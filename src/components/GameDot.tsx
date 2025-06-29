import React from 'react';
import { motion } from 'framer-motion';

interface GameDotProps {
  id: string;
  color: 'green' | 'red';
  x: number;
  y: number;
  onTap: (id: string) => void;
}

const GameDot: React.FC<GameDotProps> = ({ id, color, x, y, onTap }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 1], 
        opacity: 1,
        boxShadow: color === 'green' 
          ? ['0 0 0px rgba(34, 197, 94, 0)', '0 0 20px rgba(34, 197, 94, 0.8)', '0 0 15px rgba(34, 197, 94, 0.6)']
          : ['0 0 0px rgba(239, 68, 68, 0)', '0 0 20px rgba(239, 68, 68, 0.8)', '0 0 15px rgba(239, 68, 68, 0.6)']
      }}
      exit={{ 
        scale: 0, 
        opacity: 0,
        rotate: 180
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`absolute w-14 h-14 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 border-2 ${
        color === 'green' 
          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-lg shadow-green-500/50' 
          : 'bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-lg shadow-red-500/50'
      } hover:scale-110 active:scale-95 transition-transform duration-150`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={() => onTap(id)}
      whileHover={{ 
        scale: 1.15,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.3 }
      }}
      whileTap={{ 
        scale: 0.85,
        rotate: 180,
        transition: { duration: 0.1 }
      }}
    >
      {/* Inner glow effect */}
      <div className={`absolute inset-1 rounded-full ${
        color === 'green' 
          ? 'bg-gradient-to-br from-green-300 to-green-500' 
          : 'bg-gradient-to-br from-red-300 to-red-500'
      } opacity-80`}></div>
      
      {/* Center highlight */}
      <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full blur-sm"></div>
      
      {/* Pulsing ring */}
      <motion.div
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.8, 0, 0.8]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-full border-2 ${
          color === 'green' ? 'border-green-400' : 'border-red-400'
        }`}
      />
    </motion.div>
  );
};

export default GameDot;