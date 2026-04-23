import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-sans tracking-[0.2em] uppercase transition-all duration-700 active:scale-95 disabled:opacity-50';
  
  const variants = {
    primary: 'bg-[#C8A96B] text-[#140F12] hover:bg-[#d4ba85] shadow-[0_10px_30px_rgba(200,169,107,0.2)]',
    secondary: 'bg-white/5 text-[#F3EBDD]/70 hover:text-[#F3EBDD] hover:bg-white/10 border border-white/5',
    outline: 'border border-[#C8A96B]/30 text-[#C8A96B] hover:border-[#C8A96B] hover:bg-[#C8A96B]/5',
    glass: 'backdrop-blur-xl bg-white/5 border border-white/10 text-[#F3EBDD] hover:bg-white/10'
  };

  const sizes = {
    sm: 'px-5 py-2 text-[9px] font-bold',
    md: 'px-8 py-3.5 text-[10px] font-bold',
    lg: 'px-12 py-5 text-[11px] font-bold'
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
