import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Music, ArrowRight, Sparkles, Heart, Flame, Eye } from 'lucide-react';
import { useTest } from '../context/TestContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentTestAnswers, logout } = useTest();

  const handleStart = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (currentTestAnswers.length > 0) {
      navigate('/songs');
    } else {
      navigate('/songs');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden selection:bg-[#C8A96B] selection:text-white">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />
      
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-24 relative z-10 py-12">
        {/* Logo / Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="h-px w-16 bg-[#C8A96B]/30 mx-auto" />
          <div className="micro-label">
            Curaduría Privada • Identidad Sonora
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-16"
        >
          <h1 className="text-7xl md:text-[11rem] font-serif italic font-extralight leading-[0.8] tracking-tight">
            <span className="text-[#F3EBDD] block">Sommelier</span>
            <span className="text-[#C8A96B] block mt-6">Musical</span>
          </h1>
          
          <div className="max-w-2xl mx-auto space-y-10">
            <p className="text-2xl md:text-3xl text-[#F3EBDD] font-serif italic leading-relaxed px-4">
              Esto no es un test; es una <span className="text-[#C8A96B] font-medium">cata emocional de lujo</span>. <br />
              Una lectura profunda de tu biografía sonora actual.
            </p>
            
            <div className="h-px w-32 bg-[#C8A96B]/20 mx-auto" />
            
            <p className="text-sm md:text-[10px] tracking-[0.5em] uppercase text-[#F3EBDD]/40 font-bold max-w-md mx-auto leading-loose">
              La música sostiene la memoria. <br /> Nosotros decantamos la emoción.
            </p>
          </div>
        </motion.div>

        {/* Action Controls */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4, duration: 1.2 }}
           className="flex flex-col items-center gap-14 w-full pt-4"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
            <Button 
              size="lg" 
              onClick={handleStart} 
              className="w-full md:w-auto min-w-[300px] px-16 transition-all hover:tracking-[0.45em] text-sm py-6 bg-[#C8A96B] text-[#140F12]"
            >
              {isLoggedIn ? (currentTestAnswers.length > 0 ? 'REANUDAR CATA' : 'NUEVA CATA MUSICAL') : 'INICIAR LA EXPERIENCIA'}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/library')} 
              className="w-full md:w-auto min-w-[300px] px-16 border-[#C8A96B]/20 text-[#C8A96B] hover:bg-[#C8A96B]/5 transition-all text-sm py-6"
            >
              EXPLORAR LA CAVA
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 items-center">
            {isLoggedIn && (
              <button 
                onClick={logout}
                className="text-[10px] tracking-[0.5em] uppercase text-[#F3EBDD]/40 hover:text-[#C8A96B] transition-all font-bold"
              >
                Cerrar Sesión Actual
              </button>
            )}
            
            <div className="hidden md:block h-3 w-px bg-[#C8A96B]/20" />
            
            <div className="text-[10px] tracking-[0.5em] uppercase text-[#F3EBDD]/50 font-bold">
              Experiencia Editorial © 2025
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle Floating Elements for Depth */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#581E2E]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#2B1638]/20 blur-[160px] pointer-events-none" />
    </div>
  );
};
