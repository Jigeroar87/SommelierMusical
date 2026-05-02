import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Music, Compass, PlusCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTest } from '../context/TestContext';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useTest();

  const menuItems = [
    { label: 'Inicio', path: '/', icon: Home },
    ...(isLoggedIn ? [
      { label: 'Cata Musical', path: '/songs', icon: Compass },
      { label: 'Explorar Cava', path: '/library', icon: Music },
      { label: 'Solicitar Pieza', path: '/request-song', icon: PlusCircle },
    ] : [
      { label: 'Ingresar', path: '/login', icon: User },
    ])
  ];

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed top-8 right-8 z-[100]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full glass-gold flex items-center justify-center text-[#C8A96B] border-[#C8A96B]/20 hover:border-[#C8A96B]/40 transition-all duration-300"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-[#0d080b]/98 backdrop-blur-2xl flex items-center justify-center"
          >
            <div className="atmosphere-luxury" />
            <div className="halo-light" />
            
            <div className="w-full max-w-lg px-8 py-20 flex flex-col items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="micro-label mb-12 opacity-50"
              >
                Menú de Navegación
              </motion.div>

              <nav className="flex flex-col gap-8 w-full">
                {menuItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      onClick={() => handleNavigate(item.path)}
                      className="group flex flex-col items-center gap-2"
                    >
                      <span className={`text-4xl md:text-6xl font-serif italic transition-all duration-300 ${isActive ? 'text-[#C8A96B]' : 'text-[#F3EBDD]/40 group-hover:text-[#F3EBDD]'}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-active"
                          className="h-px w-12 bg-[#C8A96B]" 
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-24 pt-12 border-t border-[#C8A96B]/10 w-full flex flex-col items-center gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
                    <span className="text-[10px] tracking-[0.4em] uppercase text-[#F3EBDD]/60">
                      Sesión activa: {user?.email}
                    </span>
                  </div>
                  <button 
                    onClick={() => { logout(); handleNavigate('/'); }}
                    className="text-[9px] tracking-[0.5em] uppercase text-[#C8A96B] font-bold hover:text-white transition-colors"
                  >
                    Finalizar Cata (Logout)
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
