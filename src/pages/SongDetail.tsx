import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Music, Sparkles, Heart, Activity, Loader2, Lock, Youtube } from 'lucide-react';
import { songService } from '../services/songService';
import { Song } from '../types';
import { Button } from '../components/Button';

import { geminiService } from '../services/geminiService';
import { YouTubePlayer } from '../components/YouTubePlayer';

function getYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  
  // Clean the URL
  const cleanUrl = url.trim();
  
  // If it's already an 11-char ID
  if (cleanUrl.length === 11 && !cleanUrl.includes('/') && !cleanUrl.includes('.')) {
    return cleanUrl;
  }

  // Regex for various YouTube URL formats including shorts and live
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
  const match = cleanUrl.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }

  // Fallback for simple watch URLs or embed URLs that might not match the complex regex
  try {
    const urlObj = new URL(cleanUrl);
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.pathname.startsWith('/embed/') || urlObj.pathname.startsWith('/v/') || urlObj.pathname.startsWith('/shorts/') || urlObj.pathname.startsWith('/live/')) {
        return urlObj.pathname.split('/')[2];
      }
    }
  } catch (e) {
    // Not a valid URL, ignore
  }

  return null;
}

export function SongDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoFinding, setAutoFinding] = useState(false);
  const [foundVideoId, setFoundVideoId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Array<{ video_id: string }> | null>(null);
  const [searchIndex, setSearchIndex] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [originalRestricted, setOriginalRestricted] = useState(false);
  const navigate = useNavigate();

  const dbVideoId = !originalRestricted ? (
    song?.youtube_video_id || 
    // @ts-ignore
    song?.video_id ||
    // @ts-ignore
    song?.youtube_id ||
    // @ts-ignore
    song?.yt_id ||
    getYouTubeId(song?.youtube_url) || 
    // @ts-ignore
    getYouTubeId(song?.youtube) || 
    // @ts-ignore
    getYouTubeId(song?.video_url) ||
    // @ts-ignore
    getYouTubeId(song?.url)
  ) : null;

  const videoId = dbVideoId || 
                  (searchResults && searchResults[searchIndex]?.video_id) ||
                  foundVideoId;

  const handlePlayerError = (code: number) => {
    console.log('[SongDetail] Player reported error:', code);
    
    // If it's a restriction error (101/150)
    if (code === 101 || code === 150) {
      // Case 1: We were using the DB video - mark as restricted and start searching if not already done
      if (dbVideoId && !searchResults && !autoFinding) {
        console.log('[SongDetail] Database video restricted, falling back to auto-search...');
        setOriginalRestricted(true);
        autoFindVideo();
        return;
      }

      // Case 2: We were using a search result - try the next one
      if (searchResults && searchIndex < searchResults.length - 1) {
        console.log('[SongDetail] Search result restricted, trying next one...');
        setIsRetrying(true);
        setTimeout(() => {
          setSearchIndex(prev => prev + 1);
          setIsRetrying(false);
        }, 1500);
      }
    }
  };

  useEffect(() => {
    if (slug) fetchSong();
  }, [slug]);

  useEffect(() => {
    if (song && !videoId && !autoFinding && !searchResults) {
      autoFindVideo();
    }
  }, [song, videoId, autoFinding, searchResults]);

  const fetchSong = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchIndex(0);
      setSearchResults(null);
      setOriginalRestricted(false);
      const data = await songService.getSongBySlug(slug!);
      console.log('[SongDetail] Raw song data:', data);
      setSong(data);
    } catch (err: any) {
      console.error('Error fetching song:', err);
      setError(err?.message || 'Pieza no encontrada.');
      setTimeout(() => navigate('/library'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const autoFindVideo = async () => {
    if (!song) return;
    try {
      setAutoFinding(true);
      console.log('[SongDetail] Auto-searching for video:', `${song.title} ${song.artist}`);
      const results = await geminiService.searchMusic(`${song.title} ${song.artist}`);
      if (results && results.length > 0) {
        console.log('[SongDetail] Auto-search found results:', results.length);
        setSearchResults(results);
        setFoundVideoId(results[0].video_id);
      }
    } catch (err) {
      console.error('[SongDetail] Auto-search failed:', err);
    } finally {
      setAutoFinding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="atmosphere-luxury" />
        <div className="halo-light" />
        <Loader2 className="animate-spin text-[#C8A96B]/40" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="atmosphere-luxury" />
        <div className="halo-light" />
        <Music className="text-[#C8A96B]/20 mb-8" size={60} strokeWidth={1} />
        <p className="text-2xl font-serif italic text-[#F3EBDD]/40 max-w-md leading-relaxed">
          "{error}"
        </p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#F3EBDD]/20 font-bold mt-4">Redirigiendo a la Cava...</p>
      </div>
    );
  }

  if (!song) return null;

  console.log('[SongDetail] Video Info:', {
    title: song.title,
    artist: song.artist,
    videoId,
    youtube_url: song.youtube_url,
    // @ts-ignore
    video_id: song.video_id,
    // @ts-ignore
    youtube: song.youtube
  });

  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/nonexistent/maxresdefault.jpg`;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/songs')}
          className="flex items-center gap-4 micro-label hover:text-[#C8A96B] transition-colors mb-20 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver a la Cava
        </motion.button>

        <div className="grid lg:grid-cols-12 gap-20">
          {/* Main Info */}
          <div className="lg:col-span-12 space-y-24">
             <motion.header 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
               className="space-y-8 max-w-4xl"
             >
               <div className="flex items-center gap-6">
                 <div className="px-4 py-1.5 rounded-full bg-[#C8A96B]/10 border border-[#C8A96B]/20 text-[10px] tracking-[0.2em] font-bold text-[#C8A96B] uppercase">
                    {song.quadrant}
                 </div>
                 {!song.is_free && <Lock size={14} className="text-[#C8A96B]/40" />}
               </div>

               <h1 className="text-7xl md:text-11xl font-serif italic text-[#F3EBDD] font-extralight leading-[0.85] tracking-tighter">
                 {song.title}
               </h1>
               
               <p className="text-3xl md:text-4xl font-serif italic text-[#C8A96B]/80 pt-4">
                 {song.artist}
               </p>
             </motion.header>

             {/* YouTube Player / Preview */}
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1, duration: 0.8 }}
               className="w-full aspect-video rounded-2xl overflow-hidden glass border border-[#C8A96B]/20 shadow-[0_0_80px_rgba(200,169,107,0.1)] group relative my-12 bg-zinc-950"
             >
               <div className="glossy-overlay opacity-20 pointer-events-none z-20" />
               
               {videoId && !isRetrying ? (
                 <YouTubePlayer 
                   videoId={videoId}
                   isPlaying={isPlaying}
                   onStateChange={setIsPlaying}
                   onError={handlePlayerError}
                   thumbnailUrl={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center bg-zinc-950/50">
                    {autoFinding || isRetrying ? (
                      <>
                        <Loader2 size={48} className="text-[#C8A96B]/20 animate-spin" />
                        <div className="space-y-2">
                          <p className="text-lg font-serif italic text-[#F3EBDD]/60 animate-pulse">
                            {isRetrying ? 'Buscando una frecuencia alternativa...' : 'Sintonizando la frecuencia...'}
                          </p>
                          <p className="text-[10px] tracking-[0.3em] uppercase text-[#F3EBDD]/20">
                            {isRetrying ? 'La señal actual está protegida' : 'El Sommelier está localizando el manuscrito original'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Youtube size={48} className="text-[#C8A96B]/20 animate-pulse" />
                        <div className="space-y-2">
                          <p className="text-lg font-serif italic text-[#F3EBDD]/60">Reproducción no disponible en la cava</p>
                          {song.youtube_url && (
                            <a 
                              href={song.youtube_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-block micro-label text-[#C8A96B] hover:text-[#F3EBDD] transition-colors pt-2"
                            >
                              Intentar abrir en YouTube →
                            </a>
                          )}
                        </div>
                      </>
                    )}
                 </div>
               )}
             </motion.div>

             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2, duration: 0.6 }}
               className="grid lg:grid-cols-2 gap-24 py-24 border-y border-[#C8A96B]/10"
             >
               {/* Emotional Core */}
               <div className="space-y-12">
                 <div className="space-y-4">
                    <span className="micro-label">Herida Primordial</span>
                    <h3 className="text-3xl md:text-5xl font-serif italic text-[#F3EBDD] leading-tight">
                      {song.core_wound}
                    </h3>
                 </div>

                 <div className="space-y-6">
                    <span className="micro-label opacity-40">Tesis Emocional</span>
                    <p className="text-xl md:text-2xl font-serif italic text-[#F3EBDD]/50 leading-relaxed max-w-xl">
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
                    
                    <span className="micro-label">Veredicto Sommelier</span>
                    <p className="text-2xl md:text-3xl font-serif italic text-[#F3EBDD] leading-relaxed relative z-10">
                      "{song.sommelier_phrase}"
                    </p>
                    <div className="h-px w-24 bg-[#C8A96B]/10 relative z-10" />
                    <p className="micro-label">
                       Energía: {song.energy} • Intensidad {song.intensity}/10
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
             </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
