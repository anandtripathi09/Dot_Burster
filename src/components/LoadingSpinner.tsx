import React from 'react';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mb-8">
          {/* Outer spinning ring */}
          <div className="w-24 h-24 border-4 border-purple-200/30 border-t-purple-500 rounded-full animate-spin"></div>
          
          {/* Inner spinning ring */}
          <div className="absolute inset-2 w-16 h-16 border-4 border-pink-200/30 border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Target className="w-8 h-8 text-purple-400" />
            </motion.div>
          </div>
          
          {/* Pulsing dots */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <motion.div 
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
          </div>
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <motion.div 
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="w-2 h-2 bg-pink-500 rounded-full"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <motion.div 
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="w-2 h-2 bg-indigo-500 rounded-full"
            />
          </div>
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
            <motion.div 
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
              className="w-2 h-2 bg-cyan-500 rounded-full"
            />
          </div>
        </div>
        
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <h3 className="text-xl font-semibold text-white mb-2">Loading Dot Burster</h3>
          <p className="text-gray-400">Preparing your gaming experience...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;