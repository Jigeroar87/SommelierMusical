import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Music, Sparkles, Heart, Activity, Loader2, Lock } from 'lucide-react';
import { songService } from '../services/songService';
import { Song } from '../types';
import { Button } from '../components/Button';

export function SongDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) fetchSong();
  }, [slug]);

  const fetchSong = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await songService.getSongBySlug(slug!);
      setSong(data);
    } catch (err: any) {
      console.error('Error fetching song:', err);
      setError(err?.message || 'Pieza no encontrada.');
      setTimeout(() => navigate('/library'), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#140F12]">
        <div className="atmosphere-luxury" />
        <Loader2 className="animate-spin text-[#C8A96B]/40" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#140F12] p-6 text-center">
        <div className="atmosphere-luxury" />
        <Music className="text-[#C8A96B]/20 mb-8" size={60} strokeWidth={1} />
        <p className="text-2xl font-serif italic text-[#F3EBDD]/40 max-w-md leading-relaxed">
          "{error}"
        </p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#F3EBDD]/20 font-bold mt-4">Redirigiendo a la Cava...</p>
      </div>
    );
  }

  if (!song) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#140F12] relative overflow-hidden">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
        <button 
          onClick={() => navigate('/songs')}
          className="flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase text-[#F3EBDD]/40 hover:text-[#C8A96B] transition-colors mb-16 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a la Cava
        </button>

        <div className="grid lg:grid-cols-12 gap-20">
          {/* Main Info */}
          <div className="lg:col-span-12 space-y-24">
             <header className="space-y-8 max-w-4xl">
               <div className="flex items-center gap-6">
                 <div className="px-4 py-1.5 rounded-full bg-[#C8A96B]/10 border border-[#C8A96B]/20 text-[10px] tracking-[0.2em] font-bold text-[#C8A96B] uppercase">
                    {song.quadrant}
                 </div>
                 {!song.is_free && <Lock size={14} className="text-[#C8A96B]/40" />}
               </div>

               <h1 className="text-7xl md:text-9xl font-serif italic text-[#F3EBDD] leading-tight tracking-tighter">
                 {song.title}
               </h1>
               
               <p className="text-3xl md:text-4xl font-serif italic text-[#C8A96B]/80 pt-4">
                 {song.artist}
               </p>
             </header>

             <div className="grid lg:grid-cols-2 gap-24 py-24 border-y border-[#C8A96B]/10">
               {/* Emotional Core */}
               <div className="space-y-12">
                 <div className="space-y-4">
                    <span className="text-[11px] tracking-[0.5em] uppercase text-[#C8A96B] font-bold">Herida Primordial</span>
                    <h3 className="text-4xl font-serif italic text-[#F3EBDD] leading-tight">
                      {song.core_wound}
                    </h3>
                 </div>

                 <div className="space-y-6">
                    <span className="text-[11px] tracking-[0.5em] uppercase text-[#F3EBDD]/40 font-bold">Tesis Emocional</span>
                    <p className="text-2xl font-serif italic text-[#F3EBDD]/70 leading-relaxed max-w-xl">
                      {song.emotional_thesis}
                    </p>
                 </div>

                 <div className="flex flex-wrap gap-4 pt-4">
                    {song.tags?.map(tag => (
                      <span key={tag} className="px-6 py-2 bg-white/[0.03] border border-white/5 rounded-full text-[11px] uppercase tracking-[0.2em] text-[#F3EBDD]/40">
                        {tag}
                      </span>
                    ))}
                 </div>
               </div>

               {/* Sommelier's View */}
               <div className="space-y-16 flex flex-col justify-center">
                 <div className="glass p-12 space-y-8 relative overflow-hidden bg-[#C8A96B]/[0.02]">
                    <div className="glossy-overlay opacity-30" />
                    <Sparkles className="text-[#C8A96B]/20 absolute -top-4 -right-4" size={100} />
                    
                    <span className="text-[11px] tracking-[0.5em] uppercase text-[#C8A96B] font-bold relative z-10">Veredicto Sommelier</span>
                    <p className="text-3xl font-serif italic text-[#F3EBDD] leading-relaxed relative z-10">
                      "{song.sommelier_phrase}"
                    </p>
                    <div className="h-px w-24 bg-[#C8A96B]/20 relative z-10" />
                    <p className="text-sm font-serif italic text-[#F3EBDD]/40 relative z-10">
                       Energía: {song.energy} · Intensidad {song.intensity}/10
                    </p>
                 </div>

                 <div className="space-y-8">
                   <Button 
                     size="lg"
                     className="w-full bg-[#C8A96B] text-[#140F12] hover:bg-[#F3EBDD] tracking-[0.3em] font-bold text-xs"
                     onClick={() => navigate(`/songs/${song.slug}/test`)}
                   >
                     EMPEZAR TEST EMOCIONAL
                   </Button>
                   {!song.is_free && (
                     <p className="text-center text-[10px] tracking-[0.2em] uppercase text-[#F3EBDD]/30 font-bold">
                       Se requieren créditos de cata avanzada
                     </p>
                   )}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
