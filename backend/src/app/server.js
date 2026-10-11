require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const webhookRouter = require('./webhook');

const app = express();
const PORT = process.env.PORT || 4000;

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Mount Stripe Webhook Router BEFORE express.json() to maintain raw body format
app.use(webhookRouter);

// Global Middleware for standard JSON routes
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',')
      : '*',
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// =========================================================================
// 1. ALGORITHMIC MIDI & CHORD GENERATION ENGINE
// =========================================================================
const CHORD_PROGRESSIONS = {
  funk: [
    { chord: 'Emin11', midi: [40, 52, 55, 59, 62, 66], duration: '2n' },
    { chord: 'A13',    midi: [45, 53, 57, 61, 64, 67], duration: '2n' },
    { chord: 'Dmaj9',  midi: [38, 50, 54, 57, 61, 64], duration: '2n' },
    { chord: 'Gmaj7',  midi: [43, 50, 54, 59, 62],     duration: '2n' }
  ],
  lofi: [
    { chord: 'Cmaj9',  midi: [36, 48, 52, 55, 59, 62], duration: '1n' },
    { chord: 'Am9',    midi: [45, 48, 52, 55, 60],     duration: '1n' },
    { chord: 'Dm9',    midi: [38, 48, 52, 55, 57],     duration: '1n' },
    { chord: 'G13',    midi: [43, 47, 50, 53, 57],     duration: '1n' }
  ],
  trap: [
    { chord: 'Fm',     midi: [41, 53, 56, 60],         duration: '2n' },
    { chord: 'Dbmaj7', midi: [37, 49, 53, 56, 60],     duration: '2n' },
    { chord: 'Bbm',    midi: [34, 46, 49, 53],         duration: '2n' },
    { chord: 'C7',     midi: [36, 48, 52, 55, 58],     duration: '2n' }
  ]
};

app.get('/v1/midi/generate', (req, res) => {
  const genre = (req.query.genre || 'funk').toLowerCase();
  const progression = CHORD_PROGRESSIONS[genre] || CHORD_PROGRESSIONS.funk;

  res.status(200).json({
    success: true,
    genre,
    bpm: genre === 'lofi' ? 82 : genre === 'trap' ? 140 : 108,
    chords: progression
  });
});

// =========================================================================
// 2. OFFLINE MOBILE SYNC QUEUE INGESTION
// =========================================================================
app.post('/v1/sync/projects', async (req, res) => {
  const { userId, changes } = req.body;

  if (!userId || !Array.isArray(changes)) {
    return res.status(400).json({ error: 'Invalid sync payload' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const syncedIds = [];
    for (const item of changes) {
      const { local_id, title, genre, chord_data, updated_at } = item;

      const queryText = `
        INSERT INTO user_projects (user_id, local_id, title, genre, chord_data, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, local_id) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          genre = EXCLUDED.genre,
          chord_data = EXCLUDED.chord_data,
          updated_at = EXCLUDED.updated_at;
      `;
      await client.query(queryText, [userId, local_id, title, genre, JSON.stringify(chord_data), updated_at]);
      syncedIds.push(local_id);
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, syncedLocalIds: syncedIds });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Sync failed:', err);
    res.status(500).json({ error: 'Failed to process sync queue' });
  } finally {
    client.release();
  }
});

// Start Express Listener
app.listen(PORT, () => {
  console.log(`🚀 SMGPUB Backend API running on port ${PORT}`);
});


