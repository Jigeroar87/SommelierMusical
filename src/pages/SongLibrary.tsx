import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Music, Sparkles, ArrowRight, Loader2, Lock, Unlock } from 'lucide-react';
import { songService } from '../services/songService';
import { Song } from '../types';
import { Button } from '../components/Button';

const QUADRANTS = ['Te Abraza', 'Te Prende', 'Te Eleva', 'Te Revela'];

export function SongLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await songService.getSongs();
      setSongs(data);
    } catch (err: any) {
      console.error('Error fetching songs:', err);
      setError(err?.message || 'Error al conectar con la cava Sommelier.');
    } finally {
      setLoading(false);
    }
  };

  const normalize = (text: string) => 
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredSongs = songs.filter(song => {
    const normalizedQuery = normalize(searchQuery);
    const matchesSearch = normalize(song.title).includes(normalizedQuery) || 
                         normalize(song.artist).includes(normalizedQuery);
    const matchesQuadrant = activeQuadrant ? song.quadrant === activeQuadrant : true;
    return matchesSearch && matchesQuadrant;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#140F12] relative overflow-hidden">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
        <header className="space-y-12 mb-20 text-center">
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] tracking-[0.8em] uppercase text-[#C8A96B] font-bold"
            >
              Biblioteca Digital
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-serif italic text-[#F3EBDD] tracking-tighter"
            >
              La Cava <br /> Sommelier.
            </motion.h1>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 font-serif italic mb-8">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
            <div className="relative w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C8A96B]/40 group-focus-within:text-[#C8A96B] transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Buscar pieza o artista..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-[#C8A96B]/10 rounded-full py-4 px-16 text-[#F3EBDD] placeholder-[#F3EBDD]/20 focus:outline-none focus:border-[#C8A96B]/40 transition-all font-serif italic"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => setActiveQuadrant(null)}
              className={`px-8 py-3 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold transition-all duration-500 border ${!activeQuadrant ? 'bg-[#C8A96B] text-[#140F12] border-[#C8A96B]' : 'bg-white/[0.02] border-white/5 text-[#F3EBDD]/40 hover:border-[#C8A96B]/30'}`}
            >
              Todos
            </button>
            {QUADRANTS.map(q => (
              <button 
                key={q}
                onClick={() => setActiveQuadrant(q)}
                className={`px-8 py-3 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold transition-all duration-500 border ${activeQuadrant === q ? 'bg-[#C8A96B] text-[#140F12] border-[#C8A96B]' : 'bg-white/[0.02] border-white/5 text-[#F3EBDD]/40 hover:border-[#C8A96B]/30'}`}
              >
                {q}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 className="animate-spin text-[#C8A96B]/40" size={40} />
            <p className="text-[#C8A96B]/40 font-serif italic tracking-widest uppercase text-[10px]">Consultando inventario...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredSongs.length > 0 ? filteredSongs.map((song, idx) => (
                <motion.div
                  key={song.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/songs/${song.slug}`)}
                  className="group relative glass p-10 flex flex-col gap-8 cursor-pointer hover:border-[#C8A96B]/40 transition-all duration-700 overflow-hidden"
                >
                  <div className="glossy-overlay opacity-50" />
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#C8A96B]/40" />
                      <span className="text-[10px] tracking-[0.3em] uppercase text-[#F3EBDD]/40 font-bold">{song.quadrant}</span>
                    </div>
                    {song.is_free ? (
                      <Unlock size={14} className="text-[#C8A96B]/40" />
                    ) : (
                      <Lock size={14} className="text-[#C8A96B]/40" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif italic text-[#F3EBDD] group-hover:text-white transition-colors leading-tight">
                      {song.title}
                    </h3>
                    <p className="text-[#C8A96B] font-serif italic text-lg opacity-60">
                      {song.artist}
                    </p>
                  </div>

                  <div className="space-y-6 flex-grow">
                    <div className="space-y-2">
                       <span className="text-[9px] tracking-[0.3em] uppercase text-[#F3EBDD]/20 font-bold">Resonancia</span>
                       <p className="text-sm font-serif italic text-[#F3EBDD]/70 leading-relaxed line-clamp-2">
                         {song.emotional_thesis || 'Explorando la esencia...'}
                       </p>
                    </div>

                    <div className="space-y-2">
                       <span className="text-[9px] tracking-[0.3em] uppercase text-[#F3EBDD]/20 font-bold">Herida Primordial</span>
                       <p className="text-xs font-serif italic text-[#F3EBDD]/40 leading-relaxed truncate">
                         {song.core_wound || 'Análisis en proceso...'}
                       </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {song.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] uppercase tracking-[0.1em] px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-[#F3EBDD]/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between group/btn">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#F3EBDD]/40 font-bold">Intensidad: {song.intensity}/10</div>
                    <ArrowRight className="text-[#C8A96B] translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" size={18} />
                  </div>
                </motion.div>
              )) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 flex flex-col items-center justify-center gap-8 text-center"
                >
                  <Music className="text-[#C8A96B]/20" size={60} strokeWidth={1} />
                  <p className="text-2xl font-serif italic text-[#F3EBDD]/40 max-w-md leading-relaxed">
                    "Esta canción todavía no ha sido catada por el Sommelier."
                  </p>
                  <Button 
                    variant="outline"
                    className="border-[#C8A96B]/20 text-[#C8A96B] tracking-[0.2em]"
                    onClick={() => navigate('/request-song')}
                  >
                    SOLICITAR LECTURA EMOCIONAL
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
