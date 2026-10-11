import * as SQLite from 'expo-sqlite';

export interface LocalProject {
  local_id: string;
  title: string;
  genre: string;
  chord_data: string;
  is_dirty: number; // 1 = modified offline, 0 = synced
  updated_at: string;
}

export class LocalDatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('smgpub_mobile_cache.db');
    
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS local_projects (
        local_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        genre TEXT NOT NULL,
        chord_data TEXT NOT NULL,
        is_dirty INTEGER DEFAULT 1,
        updated_at TEXT NOT NULL
      );
    `);
  }

  async saveProject(localId: string, title: string, genre: string, chordData: object): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updatedAt = new Date().toISOString();
    await this.db.runAsync(
      `INSERT OR REPLACE INTO local_projects (local_id, title, genre, chord_data, is_dirty, updated_at) 
       VALUES (?, ?, ?, ?, 1, ?);`,
      [localId, title, genre, JSON.stringify(chordData), updatedAt]
    );
  }

  async getDirtyProjects(): Promise<LocalProject[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<LocalProject>('SELECT * FROM local_projects WHERE is_dirty = 1;');
  }

  async markSynced(localIds: string[]): Promise<void> {
    if (!this.db || localIds.length === 0) return;
    
    const placeholders = localIds.map(() => '?').join(',');
    await this.db.runAsync(
      `UPDATE local_projects SET is_dirty = 0 WHERE local_id IN (${placeholders});`,
      localIds
    );
  }

  async syncWithBackend(userId: string, apiEndpoint: string): Promise<boolean> {
    try {
      const dirtyProjects = await this.getDirtyProjects();
      if (dirtyProjects.length === 0) return true;

      const payload = {
        userId,
        changes: dirtyProjects.map(p => ({
          ...p,
          chord_data: JSON.parse(p.chord_data)
        }))
      };

      const response = await fetch(`${apiEndpoint}/v1/sync/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success && result.syncedLocalIds) {
        await this.markSynced(result.syncedLocalIds);
        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ Offline sync queue upload failed:', err);
      return false;
    }
  }
}
