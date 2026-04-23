import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useTest } from '../context/TestContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, loading, user } = useTest();

  React.useEffect(() => {
    if (isLoggedIn && !loading && user) {
      if (!user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/songs');
      }
    }
  }, [isLoggedIn, loading, user, navigate]);

  const handleLogin = async () => {
    try {
      await login();
      // Navigation will be handled by useEffect above
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden selection:bg-[#C8A96B] selection:text-white">
      <div className="atmosphere-luxury" />
      <div className="halo-light" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full text-center space-y-20 relative z-10 py-12"
      >
        <div className="space-y-6">
          <div className="h-px w-12 bg-[#C8A96B]/45 mx-auto" />
          <div className="text-[11px] tracking-[0.7em] uppercase text-[#C8A96B] font-bold">
            Acceso Privado • Perfil Sonoro
          </div>
        </div>

        <div className="space-y-12">
          <h2 className="text-6xl md:text-8xl font-serif italic text-[#F3EBDD] leading-[0.9] tracking-tighter">
            Inicia tu <br /> lectura sonora
          </h2>
          <p className="text-xl md:text-2xl text-[#F3EBDD]/82 font-serif italic leading-relaxed px-4">
             Permite que Sommelier Musical interprete tu pulso actual 
             para comenzar una lectura precisa y emocional de tu universo musical.
          </p>
        </div>

        <div className="pt-6 space-y-12">
          <Button 
            size="lg" 
            className="w-full flex items-center gap-10 justify-center py-6 bg-[#C8A96B] text-[#140F12] shadow-[0_20px_50px_rgba(200,169,107,0.15)]" 
            onClick={handleLogin}
          >
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#140F12" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#140F12" opacity="0.6" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#140F12" opacity="0.6" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#140F12" opacity="0.6" />
            </svg>
            <span className="tracking-[0.5em] font-bold text-sm">ACCEDER CON GOOGLE</span>
          </Button>

          <div className="pt-16 border-t border-[#C8A96B]/20 space-y-6">
             <div className="text-[11px] tracking-[0.5em] uppercase text-[#F3EBDD]/40 font-bold">Sommelier Musical</div>
             <p className="text-[10px] tracking-[0.3em] uppercase text-[#F3EBDD]/72 px-8 leading-relaxed italic font-bold">
               Una experiencia editorial para leer tu identidad musical.
             </p>
          </div>
        </div>
      </motion.div>

      {/* Subtle Floating Elements for Depth */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#3A1E2E] blur-[120px] opacity-30 rounded-full" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#2B1638] blur-[120px] opacity-20 rounded-full" />
    </div>
  );
};
