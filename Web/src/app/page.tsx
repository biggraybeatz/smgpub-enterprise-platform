'react';
import { useState, useEffect } from 'react';

export default function ProducerDashboard() {
  const [genre, setGenre] = useState('funk');
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChordProgression = async (selectedGenre: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/midi/generate?genre=${selectedGenre}`);
      const data = await res.json();
      if (data.success) {
        setChords(data.chords);
      }
    } catch (err) {
      console.error('Failed to fetch algorithmic progression:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChordProgression(genre);
  }, [genre]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-500">SMGPUB CREATOR SUITE</h1>
          <p className="text-sm text-zinc-400">Summers Media Group Enterprise Ecosystem & Publishing Control</p>
        </div>
        <div className="flex gap-4">
          <a href="#beatstore" className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm font-medium hover:bg-zinc-800">Beat Store</a>
          <a href="#publishing" className="px-4 py-2 bg-amber-600 text-zinc-950 rounded-md text-sm font-bold hover:bg-amber-500">Publishing Tiers</a>
        </div>
      </header>

      {/* Algorithmic MIDI Generator Matrix */}
      <section className="mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Algorithmic MIDI & Chord Generator</h2>
          <div className="flex gap-2">
            {['funk', 'lofi', 'trap'].map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  genre === g ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500">Synthesizing progression matrix...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {chords.map((item: any, index: number) => (
              <div key={index} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                <span className="text-xs text-zinc-500 font-mono">STEP 0{index + 1}</span>
                <div className="my-3">
                  <span className="text-2xl font-bold text-amber-400">{item.chord}</span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">MIDI: [{item.midi.join(', ')}]</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publishing Administration Tiers */}
      <section id="publishing" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-zinc-200 mb-2">Tier 1: Basic License</h3>
          <p className="text-sm text-zinc-400 mb-4">Standard consumer streaming rights up to 50,000 streams. Non-exclusive MP3/WAV download.</p>
          <span className="text-xl font-bold text-amber-500">$29.99</span>
        </div>
        <div className="bg-zinc-900 border-2 border-amber-500/50 p-6 rounded-xl relative">
          <span className="absolute -top-3 right-4 bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Popular</span>
          <h3 className="text-lg font-bold text-zinc-100 mb-2">Tier 2: Co-Publishing</h3>
          <p className="text-sm text-zinc-400 mb-4">50/50 publishing split administration. Master stem delivery, commercial sync usage included.</p>
          <span className="text-xl font-bold text-amber-500">$149.99</span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-zinc-200 mb-2">Tier 3: Global Admin</h3>
          <p className="text-sm text-zinc-400 mb-4">Full worldwide PRO registration collection (ASCAP/BMI/PRS), mechanical licensing, and major label clearance.</p>
          <span className="text-xl font-bold text-amber-500">$499.99</span>
        </div>
      </section>
    </main>
  );
}
