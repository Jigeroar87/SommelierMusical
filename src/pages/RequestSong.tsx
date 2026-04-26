import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Music, Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { songService } from '../services/songService';
import { Button } from '../components/Button';
import { useTest } from '../context/TestContext';

export function RequestSong() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    requested_title: '',
    requested_artist: '',
    requested_url: '',
    user_note: ''
  });
  
  const { user } = useTest();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requested_title || !formData.requested_artist) {
      setError('Por favor completa el título y el artista.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await songService.requestSong({
        ...formData,
        user_id: user?.uid || undefined
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
      <div className="min-h-screen flex flex-col bg-[#140F12] relative overflow-hidden">
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
    <div className="min-h-screen flex flex-col bg-[#140F12] relative overflow-hidden">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-20 relative z-10">
        <button 
          onClick={() => navigate('/library')}
          className="flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase text-[#F3EBDD]/40 hover:text-[#C8A96B] transition-colors mb-16 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Regresar
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

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-serif italic text-sm">
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
                  <Send size={18} />
                  ENVIAR SOLICITUD
                </div>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
