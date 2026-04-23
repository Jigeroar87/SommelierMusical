import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Share2, Wine, BookOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { QUADRANTS_DATA, SEED_SONGS } from '../data/songs';
import { useTest } from '../context/TestContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { geminiService } from '../services/geminiService';
import { EditorialReading, FALLBACK_READINGS } from '../data/fallbacks';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const { getDominantQuadrant, currentTestAnswers, user, resetTest } = useTest();
  const [saving, setSaving] = React.useState(false);
  const [sessionSaved, setSessionSaved] = React.useState(false);
  const [reading, setReading] = React.useState<EditorialReading | null>(null);
  const [generationSource, setGenerationSource] = React.useState<'gemini' | 'fallback' | null>(null);
  
  const dominantKey = getDominantQuadrant();
  
  useEffect(() => {
    if (!dominantKey && currentTestAnswers.length === 0) {
      navigate('/');
      return;
    }

    // Inicializar con fallback mientras Gemini carga o si no hay usuario
    if (dominantKey && !reading) {
      setReading(FALLBACK_READINGS[dominantKey]);
    }

    // Guardar sesión real y generar lectura con Gemini
    const saveSessionAndGenerate = async () => {
      if (user && dominantKey && currentTestAnswers.length > 0 && !sessionSaved && !saving) {
        setSaving(true);
        try {
          const scores: any = { abraza: 0, prende: 0, eleva: 0, revela: 0 };
          currentTestAnswers.forEach(a => { scores[a.cuadrante_principal] += a.score; });

          // 1. Generar lectura dinámica con Gemini
          const { reading: generatedReading, source } = await geminiService.generateEditorialReading({
            display_name: user.displayName,
            dominant_quadrant: dominantKey,
            score_summary: scores,
            answers: currentTestAnswers
          });

          setReading(generatedReading);
          setGenerationSource(source);

          // 2. Guardar Sesión
          const sessionRef = await addDoc(collection(db, 'test_sessions'), {
            uid: user.id,
            dominant_quadrant: dominantKey,
            answers: currentTestAnswers.map(a => ({
              song_id: a.song_id,
              score: a.score,
              cuadrante_principal: a.cuadrante_principal
            })),
            score_summary: scores,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });

          // 3. Guardar Resultado con la lectura generada
          await addDoc(collection(db, 'results'), {
            uid: user.id,
            session_id: sessionRef.id,
            dominant_quadrant: dominantKey,
            short_diagnosis: generatedReading.short_diagnosis,
            long_reading: generatedReading.long_reading,
            cta_final: generatedReading.cta_final,
            metadata: {
              source: source,
              generated_at: new Date().toISOString()
            },
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });

          setSessionSaved(true);
          console.log(`Sesión y Resultado (${source}) guardados en Firestore`);
        } catch (error) {
          console.error("Error saving session/generating reading:", error);
        } finally {
          setSaving(false);
        }
      }
    };

    saveSessionAndGenerate();
  }, [dominantKey, currentTestAnswers, navigate, user, sessionSaved, saving]);

  if (!dominantKey || !reading) return null;

  const quadrant = QUADRANTS_DATA[dominantKey];
  const playedSongs = SEED_SONGS.filter(s => currentTestAnswers.some(a => a.song_id === s.id));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden selection:bg-[#C8A96B] selection:text-white">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl flex flex-col items-center text-center space-y-20 relative z-10"
      >
        {/* Header Section */}
        <div className="space-y-6">
          <div className="h-px w-16 bg-[#C8A96B]/30 mx-auto" />
          <h2 className="text-[11px] tracking-[0.8em] uppercase text-[#C8A96B] font-bold">
            Lectura Final
          </h2>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-12">
          <h1 className="text-6xl md:text-8xl font-serif italic text-[#F3EBDD] leading-tight tracking-tighter">
            Hoy tu música <br /> 
            te <span style={{ color: quadrant.color }}>{quadrant.name.replace('Te ', '')}</span>.
          </h1>
          
          <div className="h-px w-32 bg-[#C8A96B]/10 mx-auto" />
          
          <p className="text-3xl md:text-4xl font-serif italic text-[#F3EBDD]/90 leading-relaxed px-4 max-w-2xl mx-auto">
            {reading.short_diagnosis}
          </p>

          <p className="text-lg md:text-2xl font-serif italic text-[#F3EBDD]/70 leading-relaxed max-w-2xl mx-auto pt-8">
             {reading.long_reading.split('.')[0]}. {reading.long_reading.split('.')[1] || ''}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-12 w-full pt-12">
          <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
            <Button 
              size="lg" 
              onClick={() => {
                resetTest();
                navigate('/onboarding');
              }} 
              className="px-16 bg-[#C8A96B] text-[#140F12] border-none hover:bg-[#F3EBDD] tracking-[0.3em] font-bold text-xs"
            >
              NUEVA CATA
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/')} 
              className="px-16 border-[#C8A96B]/20 text-[#C8A96B] hover:bg-[#C8A96B]/5 tracking-[0.3em] font-bold text-xs"
            >
              FINALIZAR LA EXPERIENCIA
            </Button>
          </div>

          <div className="text-[10px] tracking-[0.6em] uppercase text-[#F3EBDD]/20 font-bold">
            Curaduría Musical © 2025
          </div>
        </div>
      </motion.div>

      {/* Subtle bottom glow based on quadrant */}
      <div 
        className="fixed -bottom-[300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-[0.05] blur-[180px] -z-10 rounded-full transition-colors duration-[3000ms]"
        style={{ backgroundColor: quadrant.color }}
      />
    </div>
  );
};
