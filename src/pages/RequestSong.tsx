import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Music, Send, Loader2, CheckCircle2, Sparkles, Search, HelpCircle, AlertCircle } from 'lucide-react';
import { songService } from '../services/songService';
import { Button } from '../components/Button';
import { useTest } from '../context/TestContext';
import { SongValidationResponse } from '../types';

export function RequestSong() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'validation_confirmation'>('input');
  const [validationResult, setValidationResult] = useState<SongValidationResponse | null>(null);
  
  const [formData, setFormData] = useState({
    requested_title: '',
    requested_artist: '',
    requested_url: '',
    user_note: ''
  });
  
  const { user } = useTest();
  const navigate = useNavigate();

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requested_title || !formData.requested_artist) {
      setError('Por favor completa el título y el artista.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await songService.validateSongRequest({
        requested_title: formData.requested_title,
        requested_artist: formData.requested_artist
      });

      setValidationResult(result);

      if (result.confidence >= 0.8 && (result.validation_status === 'exact_match' || result.validation_status === 'corrected')) {
        setStep('validation_confirmation');
      } else {
        setError('No pude identificar la canción con suficiente seguridad. Revisa el título y artista o intenta ser más específico.');
      }
    } catch (err: any) {
      console.error('Error validating request:', err);
      setError('Hubo un error al validar la canción. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSubmit = async () => {
    if (!validationResult) return;

    try {
      setLoading(true);
      setError(null);
      
      await songService.requestSong({
        ...formData,
        user_id: user?.uid || undefined,
        canonical_title: validationResult.canonical_title,
        canonical_artist: validationResult.canonical_artist,
        normalized_slug: validationResult.normalized_slug,
        validation_status: 'confirmed_by_user',
        validation_confidence: validationResult.confidence,
        validation_candidates: validationResult.candidates
      });
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setError('Hubo un error al procesar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="atmosphere-luxury" />
        <div className="halo-light" />
        
        <main className="flex-grow w-full max-w-2xl mx-auto px-6 py-20 relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-16 space-y-12 relative overflow-hidden"
          >
            <div className="glossy-overlay" />
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-full bg-[#C8A96B]/10 flex items-center justify-center border border-[#C8A96B]/20">
                <CheckCircle2 className="text-[#C8A96B]" size={40} strokeWidth={1} />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-serif italic text-[#F3EBDD] tracking-tight">
                  Solicitud Recibida
                </h1>
                <p className="text-lg font-serif italic text-[#F3EBDD]/60 leading-relaxed">
                  "Tu canción entró al mapa Sommelier. Cuando esté lista, aparecerá en la biblioteca."
                </p>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/library')}
              className="w-full bg-[#C8A96B] text-[#140F12] font-bold tracking-[0.3em] text-[10px] relative z-10"
            >
              VOLVER A LA CAVA
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-20 relative z-10">
        <button 
          onClick={() => step === 'validation_confirmation' ? setStep('input') : navigate('/library')}
          className="flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase text-[#F3EBDD]/40 hover:text-[#C8A96B] transition-colors mb-16 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {step === 'input' ? 'Regresar' : 'Volver a Editar'}
        </button>

        <header className="space-y-4 mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.8em] uppercase text-[#C8A96B] font-bold"
          >
            Encargo de Cata
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-serif italic text-[#F3EBDD] tracking-tighter"
          >
            Nueva <br /> Solicitud.
          </motion.h1>
          <p className="text-[#F3EBDD]/40 font-serif italic text-xl max-w-sm">
            Si la pieza no está en nuestra cava, el Sommelier la explorará para ti.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.form 
              key="input-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleValidate} 
              className="space-y-12"
            >
              {error && (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-serif italic text-sm flex gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96B] font-bold px-1">Título de la Pieza</label>
                    <input 
                      type="text"
                      required
                      value={formData.requested_title}
                      onChange={(e) => setFormData(f => ({ ...f, requested_title: e.target.value }))}
                      placeholder="Ej: Antología"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-[#F3EBDD] placeholder-[#F3EBDD]/20 focus:outline-none focus:border-[#C8A96B]/30 transition-all font-serif italic"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96B] font-bold px-1">Artista</label>
                    <input 
                      type="text"
                      required
                      value={formData.requested_artist}
                      onChange={(e) => setFormData(f => ({ ...f, requested_artist: e.target.value }))}
                      placeholder="Ej: Shakira"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-[#F3EBDD] placeholder-[#F3EBDD]/20 focus:outline-none focus:border-[#C8A96B]/30 transition-all font-serif italic"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96B] font-bold px-1">Enlace opcional (YouTube/Spotify)</label>
                  <input 
                    type="url"
                    value={formData.requested_url}
                    onChange={(e) => setFormData(f => ({ ...f, requested_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-[#F3EBDD] placeholder-[#F3EBDD]/20 focus:outline-none focus:border-[#C8A96B]/30 transition-all font-serif italic"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96B] font-bold px-1">Nota para el Sommelier</label>
                  <textarea 
                    rows={4}
                    value={formData.user_note}
                    onChange={(e) => setFormData(f => ({ ...f, user_note: e.target.value }))}
                    placeholder="¿Por qué esta canción? ¿Qué sientes al escucharla?"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-[#F3EBDD] placeholder-[#F3EBDD]/20 focus:outline-none focus:border-[#C8A96B]/30 transition-all font-serif italic resize-none"
                  />
                </div>
              </div>

              <div className="pt-8">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-8 bg-[#C8A96B] text-[#140F12] font-bold tracking-[0.4em] text-xs transition-all hover:bg-[#F3EBDD] group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <Search size={18} />
                      VALIDAR CANCIÓN
                    </div>
                  )}
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="validation-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="glass p-12 space-y-8 relative overflow-hidden border-[#C8A96B]/20">
                <div className="glossy-overlay opacity-30" />
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4 text-[#C8A96B]">
                    <HelpCircle size={24} />
                    <span className="text-[10px] tracking-[0.5em] uppercase font-bold">Confirma la Identidad</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-4xl font-serif italic text-[#F3EBDD]">
                      ¿Quisiste decir: <span className="text-[#C8A96B]">{validationResult?.canonical_title}</span>?
                    </h3>
                    <p className="text-xl font-serif italic text-[#F3EBDD]/60">
                      De {validationResult?.canonical_artist}
                    </p>
                  </div>

                  <div className="h-px w-full bg-white/5" />

                  <p className="text-sm font-serif italic text-[#F3EBDD]/40 leading-relaxed">
                    Identificamos esta pieza con un {(validationResult?.confidence || 0) * 100}% de certeza. Si es correcta, el Sommelier procederá con la lectura.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <Button 
                  onClick={() => setStep('input')}
                  variant="outline"
                  className="py-8 border-white/10 text-white/40 font-bold tracking-[0.4em] text-[10px] hover:border-white/20 hover:text-white/60"
                >
                  CORREGIR
                </Button>
                <Button 
                  onClick={handleConfirmAndSubmit}
                  disabled={loading}
                  className="py-8 bg-[#C8A96B] text-[#140F12] font-bold tracking-[0.4em] text-[10px] hover:bg-[#F3EBDD]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    'SÍ, SOLICITAR LECTURA'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
