import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useTest } from '../context/TestContext';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding, user } = useTest();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.displayName || '');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate('/songs', { replace: true });
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    }
  };

  const handleFinish = async () => {
    if (birthDate && name.trim()) {
      setSaving(true);
      try {
        console.log("Saving onboarding data...", { name, birthDate });
        await completeOnboarding(name, birthDate);
        console.log("Onboarding completed successfully. Navigating...");
        navigate('/songs', { replace: true });
      } catch (error) {
        console.error("Error saving onboarding:", error);
        alert("Hubo un error al guardar tu perfil. Por favor, intenta de nuevo.");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden selection:bg-[#C8A96B] selection:text-white">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-xl w-full text-center space-y-16 relative z-10"
          >
            <div className="space-y-6">
              <div className="h-px w-12 bg-[#C8A96B]/45 mx-auto" />
              <div className="text-[11px] tracking-[0.7em] uppercase text-[#C8A96B] font-bold">
                PASO 01 · IDENTIDAD SONORA
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-serif italic text-[#F3EBDD] leading-tight tracking-tighter">
                ¿Cómo te gusta <br /> que te llamen?
              </h2>
              <p className="text-xl text-[#F3EBDD]/78 font-serif italic leading-relaxed">
                Queremos nombrarte como esta experiencia realmente debe leerte.
              </p>
            </div>

            <div className="pt-8 space-y-12">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escribe tu nombre preferido"
                className="w-full bg-white/[0.03] border-b border-[#C8A96B]/30 py-6 px-4 text-3xl font-serif italic text-[#F3EBDD] placeholder:text-[#F3EBDD]/20 focus:outline-none focus:border-[#C8A96B] transition-colors text-center"
              />
              <Button
                size="lg"
                disabled={!name.trim()}
                onClick={handleNext}
                className="w-full bg-[#C8A96B] text-[#140F12]"
              >
                CONTINUAR
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-xl w-full text-center space-y-16 relative z-10"
          >
            <div className="space-y-6">
              <div className="h-px w-12 bg-[#C8A96B]/45 mx-auto" />
              <div className="text-[11px] tracking-[0.7em] uppercase text-[#C8A96B] font-bold">
                PASO 02 · FECHA DE NACIMIENTO
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-serif italic text-[#F3EBDD] leading-tight tracking-tighter">
                ¿Cuál es tu fecha <br /> de nacimiento?
              </h2>
              <p className="text-xl text-[#F3EBDD]/78 font-serif italic leading-relaxed px-4">
                La usaremos para personalizar tu lectura musical y construir tu perfil base.
              </p>
            </div>

            <div className="pt-8 space-y-12">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white/[0.03] border-b border-[#C8A96B]/30 py-6 px-12 text-3xl font-serif italic text-[#F3EBDD] focus:outline-none focus:border-[#C8A96B] transition-colors text-center [color-scheme:dark]"
              />
              <div className="flex flex-col gap-6">
                <Button
                  size="lg"
                  disabled={!birthDate || saving}
                  onClick={handleFinish}
                  className="w-full bg-[#C8A96B] text-[#140F12]"
                >
                  {saving ? 'GUARDANDO...' : 'COMENZAR EXPERIENCIA'}
                </Button>
                <button
                  onClick={() => setStep(1)}
                  className="text-[10px] tracking-[0.5em] uppercase text-[#F3EBDD]/30 hover:text-[#F3EBDD] transition-colors font-bold"
                >
                  VOLVER
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Floating Elements for Depth */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#3A1E2E] blur-[120px] opacity-30 rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#2B1638] blur-[120px] opacity-20 rounded-full" />
    </div>
  );
};
