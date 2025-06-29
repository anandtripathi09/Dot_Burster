import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Users, Clock, Trophy, ArrowLeft, X, Zap } from 'lucide-react';
import GameDot from '../components/GameDot';
import toast from 'react-hot-toast';

interface Player {
  name: string;
  userId: string;
  score?: number;
}

interface GameDotData {
  id: string;
  color: 'green' | 'red';
  x: number;
  y: number;
}

const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<'joining' | 'waiting' | 'countdown' | 'playing' | 'finished' | 'cooldown'>('joining');
  const [players, setPlayers] = useState<Player[]>([]);
  const [waitingFor, setWaitingFor] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const [currentDot, setCurrentDot] = useState<GameDotData | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [waitingTimer, setWaitingTimer] = useState(10);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(10);
  const { socket } = useSocket();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user) return;

    // Socket event listeners
    socket.on('queue-update', (data) => {
      setPlayers(data.players);
      setWaitingFor(data.waitingFor);
      setGameState('waiting');
      
      // Start waiting timer when first player joins
      if (data.players.length === 1) {
        setWaitingTimer(10);
        setShowCancelButton(false);
      }
    });

    socket.on('countdown', (count) => {
      setCountdown(count);
      setGameState('countdown');
    });

    socket.on('game-start', () => {
      setGameState('playing');
      setMyScore(0);
      setGameTimeLeft(10);
      
      // Start game timer
      const gameTimer = setInterval(() => {
        setGameTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(gameTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('new-dot', (dot) => {
      setCurrentDot(dot);
      
      // Auto-remove dot after 800ms if not tapped
      setTimeout(() => {
        setCurrentDot(prev => prev?.id === dot.id ? null : prev);
      }, 800);
    });

    socket.on('score-update', (data) => {
      setPlayers(data.players);
      // Update my score immediately for real-time feedback
      const myPlayer = data.players.find((p: any) => p.userId === user?.id);
      if (myPlayer) {
        setMyScore(myPlayer.score);
      }
    });

    socket.on('game-end', (results) => {
      setGameResults(results);
      setCooldownTime(results.cooldownTime);
      setGameState('finished');
      
      // Store last game time for cooldown tracking
      localStorage.setItem(`lastGame_${user.id}`, Date.now().toString());
      
      refreshUser(); // Refresh user data to update wallet balance
    });

    socket.on('insufficient-balance', () => {
      toast.error('Insufficient balance! Add money to your wallet.');
      navigate('/dashboard');
    });

    socket.on('cooldown-active', (data) => {
      setCooldownTime(data.remainingTime);
      setGameState('cooldown');
    });

    socket.on('game-error', (data) => {
      toast.error(data.message);
      navigate('/dashboard');
    });

    return () => {
      socket.off('queue-update');
      socket.off('countdown');
      socket.off('game-start');
      socket.off('new-dot');
      socket.off('score-update');
      socket.off('game-end');
      socket.off('insufficient-balance');
      socket.off('cooldown-active');
      socket.off('game-error');
    };
  }, [socket, user, navigate, refreshUser]);

  // Waiting timer effect
  useEffect(() => {
    if (gameState === 'waiting' && waitingTimer > 0) {
      const timer = setInterval(() => {
        setWaitingTimer(prev => {
          if (prev <= 1) {
            setShowCancelButton(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, waitingTimer]);

  // Cooldown timer effect
  useEffect(() => {
    if (gameState === 'cooldown' && cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setGameState('joining');
            // Try to join game again
            if (socket && user) {
              socket.emit('join-game-queue', {
                userId: user.id,
                token: localStorage.getItem('token')
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, cooldownTime, socket, user]);

  useEffect(() => {
    if (socket && user && gameState === 'joining') {
      socket.emit('join-game-queue', {
        userId: user.id,
        token: localStorage.getItem('token')
      });
    }
  }, [socket, user, gameState]);

  const handleDotTap = (dotId: string) => {
    if (socket && gameState === 'playing' && currentDot && currentDot.id === dotId) {
      // Optimistically update local score for immediate feedback
      if (currentDot.color === 'green') {
        setMyScore(prev => prev + 1);
      } else if (currentDot.color === 'red') {
        setMyScore(prev => Math.max(0, prev - 1)); // Don't go below 0
      }
      
      socket.emit('game-action', {
        gameId: 'current-game',
        userId: user?.id,
        action: 'tap',
        dotId
      });
      
      // Remove dot immediately after tap
      setCurrentDot(null);
    }
  };

  const goBackToDashboard = () => {
    navigate('/dashboard');
  };

  const cancelGame = () => {
    if (socket && user) {
      socket.emit('leave-game-queue', { userId: user.id });
      toast.success('Game cancelled. Entry fee refunded.');
      navigate('/dashboard');
    }
  };

  // Cooldown Modal - 45 second break
  if (gameState === 'cooldown') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">45-Second Break</h2>
          <p className="text-gray-300 mb-6">
            Please wait before joining another game
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {cooldownTime}s
            </div>
            <p className="text-yellow-300 text-sm">
              Time remaining before you can join another game
            </p>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            This break ensures fair play and prevents rapid game joining.
          </p>
          
          <button
            onClick={goBackToDashboard}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'joining') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Joining Game...</h2>
          <p className="text-gray-300">Finding players and starting match</p>
          <p className="text-gray-400 text-sm mt-2">Entry fee: ₹30 deducted</p>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full relative"
        >
          <button
            onClick={goBackToDashboard}
            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <Users className="h-16 w-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Waiting Room</h2>
          <p className="text-gray-300 mb-6">
            System groups every 3 players automatically
          </p>
          
          {!showCancelButton && waitingTimer > 0 && (
            <div className="mb-4">
              <p className="text-yellow-300 text-sm">
                Cancel available in {waitingTimer}s
              </p>
            </div>
          )}
          
          <div className="space-y-3 mb-6">
            {players.map((player, index) => (
              <div key={player.userId} className="bg-white/5 rounded-lg p-3 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-white">{player.name}</span>
                {player.userId === user?.id && (
                  <span className="ml-2 text-purple-400 text-sm">(You)</span>
                )}
              </div>
            ))}
            
            {Array.from({ length: waitingFor }).map((_, index) => (
              <div key={`waiting-${index}`} className="bg-white/5 rounded-lg p-3 flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-gray-400">Waiting for player...</span>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              <strong>Game Details:</strong><br/>
              • Entry Fee: ₹30 (already deducted)<br/>
              • Winner Prize: ₹60<br/>
              • Platform Fee: ₹30<br/>
              • Need {waitingFor} more player{waitingFor !== 1 ? 's' : ''} to start
            </p>
          </div>

          {showCancelButton && (
            <button
              onClick={cancelGame}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mx-auto"
            >
              <X className="h-4 w-4" />
              <span>Cancel Game & Get Refund</span>
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            key={countdown}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-8xl font-bold text-white mb-4"
          >
            {countdown > 0 ? countdown : 'GO!'}
          </motion.div>
          <p className="text-xl text-gray-300">
            {countdown > 0 ? 'Get ready...' : 'GREEN dots: +1 point | RED dots: -1 penalty!'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen p-6">
        {/* Game Header with Timer and Scores */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span className="text-white font-semibold">Time Left:</span>
              <span className="text-2xl font-bold text-purple-400">{gameTimeLeft}s</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-semibold">Live Game</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {players.map((player) => (
              <div key={player.userId} className="text-center bg-white/5 rounded-lg p-3">
                <div className="text-white font-semibold text-sm mb-1">{player.name}</div>
                <div className={`text-2xl font-bold ${
                  player.userId === user?.id ? 'text-purple-400' : 'text-gray-300'
                }`}>
                  {player.userId === user?.id ? myScore : (player.score || 0)}
                </div>
                {player.userId === user?.id && (
                  <div className="text-xs text-purple-300">You</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Area - Square Box */}
        <div className="relative bg-white/5 border-2 border-white/20 rounded-2xl aspect-square max-w-2xl mx-auto overflow-hidden">
          <div className="absolute inset-4 border border-dashed border-white/30 rounded-xl"></div>
          
          {/* Only one dot at a time */}
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
            <p>• GREEN dots: +1 point</p>
            <p>• RED dots: -1 penalty</p>
            <p>• Speed increases with green taps</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-300 text-lg">GREEN dots: +1 point | RED dots: -1 penalty</p>
          <p className="text-gray-400 text-sm mt-1">Game ends after 10 seconds • Highest score wins ₹60</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished' && gameResults) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full"
        >
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          
          <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
          
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Winner</h3>
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {gameResults.winner.name}
            </div>
            <div className="text-lg text-white">
              Score: {gameResults.winner.score} points
            </div>
            <div className="text-sm text-green-400 mt-2">
              Prize: ₹60 added to wallet
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h4 className="text-lg font-semibold text-white">Final Scores:</h4>
            {gameResults.results.map((result: any, index: number) => (
              <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                <span className="text-white">
                  {result.name}
                  {result.name === user?.name && <span className="text-purple-400"> (You)</span>}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">{result.score}</span>
                  {result.isWinner && <Trophy className="h-4 w-4 text-yellow-400" />}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <h4 className="text-yellow-300 font-semibold mb-2">45-Second Break</h4>
            <p className="text-yellow-200 text-sm">
              Cooldown: {cooldownTime} seconds before you can join another game
            </p>
          </div>

          <button
            onClick={goBackToDashboard}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );
};

export default GamePage;
