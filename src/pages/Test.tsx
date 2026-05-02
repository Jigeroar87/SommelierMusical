import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Play, Wine, Loader2, Pause, Heart } from 'lucide-react';
import { Button } from '../components/Button';
import { Song, QUADRANTS_DATA, SEED_SONGS } from '../data/songs';
import { useTest } from '../context/TestContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { YouTubePlayer } from '../components/YouTubePlayer';

export const Test: React.FC = () => {
  const navigate = useNavigate();
  const { addAnswer } = useTest();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveSongs = async () => {
      try {
        const q = query(collection(db, 'songs'), where('estado', '==', 'active'), orderBy('created_at', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedSongs = querySnapshot.docs.map(doc => doc.data() as Song);
        
        // Fallback to SEED_SONGS if DB is empty for seamless UX
        if (fetchedSongs.length === 0) {
          setSongs(SEED_SONGS);
        } else {
          setSongs(fetchedSongs);
        }
      } catch (error) {
        console.error("Error fetching active songs:", error);
        setSongs(SEED_SONGS); // Fallback on error
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSongs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="atmosphere-luxury" />
        <Loader2 className="animate-spin text-[#C8A96B]/40" size={32} />
      </div>
    );
  }

  const currentSong = songs[currentIndex];
  // Safe access for quadrants (might happen if quad id is wrong in DB)
  const currentQuadrant = QUADRANTS_DATA[currentSong.cuadrante_principal as keyof typeof QUADRANTS_DATA] || QUADRANTS_DATA.revela;

  const handleNext = () => {
    if (selectedScore === null) return;
    addAnswer(currentSong.id, selectedScore, currentSong.cuadrante_principal);

    if (currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedScore(null);
      setIsPlaying(false);
    } else {
      navigate('/result');
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-12 relative overflow-hidden selection:bg-[#C8A96B] selection:text-white">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      {/* Sidebar - Minimalist markers */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12 z-30 opacity-20">
          <div className="h-24 w-[1px] bg-[#C8A96B]/10 relative">
            <div 
              className="absolute top-0 left-0 w-full bg-[#C8A96B]/60 transition-all duration-1000 ease-in-out"
              style={{ height: `${((currentIndex + 1) / songs.length) * 100}%` }}
            />
          </div>
          <div className="text-[9px] tracking-[0.7em] [writing-mode:vertical-lr] uppercase text-[#C8A96B]/40 font-bold">
            Lectura {currentIndex + 1} • {songs.length}
          </div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col gap-16 relative z-10">
        <header className="space-y-6 text-center max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="micro-label"
          >
            Cata Inicial
          </motion.h2>
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-serif italic text-[#F3EBDD] leading-tight tracking-tighter">
              {currentSong.title}
            </h1>
            <p className="text-xl md:text-2xl font-serif italic text-[#C8A96B] opacity-60">
              {currentSong.artist}
            </p>
          </div>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Emotional Analysis Column */}
          <div className="lg:col-span-7 space-y-20">
            <div className="space-y-12">
               <div className="space-y-4">
                 <div className="micro-label">Resonancia Emocional</div>
                 <h3 className="text-xl md:text-2xl font-serif italic text-[#F3EBDD]/30 pt-4 border-t border-[#C8A96B]/10">Lo que esta pieza sostiene</h3>
               </div>
               
               <p className="text-3xl md:text-5xl font-serif italic text-[#F3EBDD] leading-[1.3] max-w-2xl">
                 "{currentQuadrant.description}"
               </p>
            </div>

            <div className="space-y-12 pt-8">
               <div className="micro-label opacity-40">Nivel de resonancia personal</div>
               <div className="grid grid-cols-5 md:flex md:flex-wrap gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => setSelectedScore(score)}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-serif italic text-2xl transition-all duration-700 border ${selectedScore === score ? 'bg-[#C8A96B] text-[#140F12] border-[#C8A96B] shadow-[0_0_40px_rgba(200,169,107,0.3)] scale-110' : 'bg-white/[0.01] border-[#C8A96B]/10 text-[#F3EBDD]/60 hover:border-[#C8A96B]/30 hover:bg-white/[0.03]'}`}
                    >
                      {score}
                    </button>
                  ))}
               </div>
               
               <div className="pt-8">
                 <Button 
                   size="lg"
                   disabled={selectedScore === null} 
                   onClick={handleNext}
                   className="min-w-[280px] bg-[#C8A96B] text-[#140F12] hover:bg-[#F3EBDD] transition-colors shadow-[0_20px_50px_rgba(200,169,107,0.15)] font-bold tracking-[0.3em] text-[10px]"
                 >
                   REGISTRAR EMOCIÓN
                 </Button>
               </div>
            </div>
          </div>

          {/* Player Column */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="relative aspect-video rounded-3xl overflow-hidden group shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)] bg-[#140F12] border border-[#C8A96B]/20">
               <YouTubePlayer 
                 videoId={currentSong.youtube_video_id}
                 isPlaying={isPlaying}
                 onStateChange={setIsPlaying}
                 thumbnailUrl={currentSong.youtube_thumbnail_url}
               />
               
               <AnimatePresence>
                 {!isPlaying && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.3 } }}
                     className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                   >
                     <button 
                       onClick={() => setIsPlaying(true)}
                       className="w-20 h-20 bg-[#F3EBDD] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(243,235,221,0.2)] hover:scale-110 active:scale-95 transition-transform duration-300 pointer-events-auto"
                     >
                       <Play fill="#140F12" className="text-[#140F12] ml-1" size={28} />
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div className="text-center md:text-left px-4">
              <p className="text-[10px] tracking-[0.2em] font-serif italic text-[#F3EBDD]/40 uppercase">
                Pieza seleccionada por el Sommelier para tu diagnóstico.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-24" /> {/* Spacer instead of footer */}
    </div>
  );
};
