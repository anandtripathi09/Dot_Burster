import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import GameDot from '../components/GameDot';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Dot {
  id: string;
  color: 'green' | 'red';
  x: number;
  y: number;
}

const DemoGame: React.FC = () => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentDot, setCurrentDot] = useState<Dot | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState === 'playing') {
      const gameTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setShowCongrats(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Generate first dot immediately
      generateNewDot();

      const dotTimer = setInterval(() => {
        generateNewDot();
      }, 1000); // Generate new dot every second

      return () => {
        clearInterval(gameTimer);
        clearInterval(dotTimer);
      };
    }
  }, [gameState]);

  const generateNewDot = () => {
    // 70% chance for green, 30% chance for red
    const colors: ('green' | 'red')[] = ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'red', 'red', 'red'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const newDot: Dot = {
      id: Date.now().toString() + Math.random(),
      color,
      x: Math.random() * 80 + 10, // 10% to 90% of container width
      y: Math.random() * 80 + 10  // 10% to 90% of container height
    };
    
    setCurrentDot(newDot);
    
    // Remove dot after 800ms if not clicked
    setTimeout(() => {
      setCurrentDot(prev => prev?.id === newDot.id ? null : prev);
    }, 800);
  };

  const handleDotTap = (dotId: string) => {
    if (currentDot && currentDot.id === dotId) {
      if (currentDot.color === 'green') {
        // +1 point for green dots
        setScore(prev => {
          const newScore = prev + 1;
          console.log('Demo Score Updated:', newScore);
          return newScore;
        });
      } else if (currentDot.color === 'red') {
        // -1 point penalty for red dots (don't go below 0)
        setScore(prev => {
          const newScore = Math.max(0, prev - 1);
          console.log('Demo Red Dot Penalty! Score:', newScore);
          return newScore;
        });
      }
      // Remove the dot immediately after tap
      setCurrentDot(null);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(10);
    setCurrentDot(null);
  };

  const completeDemo = async () => {
    try {
      await axios.post('http://localhost:5000/api/user/complete-demo');
      updateUser({ hasPlayedDemo: true });
      toast.success('Demo completed! You can now play real games.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete demo');
    }
  };

  if (showCongrats) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full"
        >
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Congratulations!</h2>
          <p className="text-xl text-green-400 mb-2">You understood the game!</p>
          <p className="text-lg text-purple-300 mb-6">
            You scored {score} points in the demo round!
          </p>
          <p className="text-sm text-gray-300 mb-8">
            Now you're ready to play real multiplayer games and win actual money!
          </p>
          <button
            onClick={completeDemo}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Continue to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Demo Game</h1>
        <p className="text-gray-300 max-w-2xl">
          Welcome to Dot Burster! This is a demo to show you how the game works. 
          Tap the GREEN dots for +1 point. RED dots give -1 penalty!
        </p>
      </motion.div>

      {gameState === 'waiting' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Ready to Play?</h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-6 h-6 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="text-white">Tap GREEN dots for +1 point</span>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
              <span className="text-white">RED dots give -1 penalty</span>
            </div>
            <p className="text-gray-300">Game lasts 10 seconds</p>
          </div>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Start Demo Game
          </button>
        </motion.div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white text-xl font-semibold">
              Score: <span className="text-green-400 text-2xl font-bold">{score}</span>
            </div>
            <div className="text-white text-xl font-semibold">
              Time: <span className="text-purple-400 text-2xl font-bold">{timeLeft}s</span>
            </div>
          </div>
          
          <div className="relative bg-white/5 border-2 border-white/20 rounded-2xl aspect-square overflow-hidden">
            <div className="absolute inset-4 border border-dashed border-white/30 rounded-xl"></div>
            
            {currentDot && (
              <GameDot
                key={currentDot.id}
                id={currentDot.id}
                color={currentDot.color}
                x={currentDot.x}
                y={currentDot.y}
                onTap={handleDotTap}
              />
            )}
            
            <div className="absolute bottom-4 left-4 text-white text-sm">
              <p>• Tap GREEN dots for +1 point</p>
              <p>• RED dots give -1 penalty</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoGame;
