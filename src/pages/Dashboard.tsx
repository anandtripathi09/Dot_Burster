import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Wallet, Plus, Minus, Trophy, History, Target, LogOut, Zap, Users, Star, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import AddMoneyModal from '../components/AddMoneyModal';
import WithdrawModal from '../components/WithdrawModal';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface GameHistory {
  gameId: string;
  status: string;
  myScore: number;
  winner: string;
  isWinner: boolean;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Check for cooldown when component mounts
  useEffect(() => {
    const lastGameTime = localStorage.getItem(`lastGame_${user?.id}`);
    if (lastGameTime) {
      const timeSinceLastGame = Date.now() - parseInt(lastGameTime);
      const remainingCooldown = 45000 - timeSinceLastGame; // 45 seconds
      
      if (remainingCooldown > 0) {
        setCooldownTime(Math.ceil(remainingCooldown / 1000));
        startCooldownTimer(Math.ceil(remainingCooldown / 1000));
      }
    }
  }, [user?.id]);

  const startCooldownTimer = (seconds: number) => {
    setCooldownTime(seconds);
    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchData = async () => {
    try {
      const [transactionsRes, gameHistoryRes] = await Promise.all([
        axios.get('http://localhost:5000/api/user/transactions'),
        axios.get('http://localhost:5000/api/game/history')
      ]);
      
      setTransactions(transactionsRes.data);
      setGameHistory(gameHistoryRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleJoinGame = () => {
    // Check if user has sufficient balance
    if ((user?.walletBalance || 0) < 30) {
      toast.error('Insufficient balance! Add money to your wallet.');
      return;
    }

    // Check cooldown
    if (cooldownTime > 0) {
      setShowCooldownModal(true);
      return;
    }

    // Navigate to game
    window.location.href = '/game';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const winRate = gameHistory.length > 0 ? (gameHistory.filter(g => g.isWinner).length / gameHistory.length * 100) : 0;
  const totalEarnings = gameHistory.filter(g => g.isWinner).length * 60;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <Target className="h-8 w-8 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Dot Burster</span>
              <div className="text-xs text-purple-300">Gaming Dashboard</div>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-white font-medium">Welcome back,</div>
              <div className="text-purple-300 font-bold">{user?.name}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Wallet Balance Card - Top Priority */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-purple-500/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Wallet className="h-8 w-8 text-purple-400" />
                  <span className="text-xl font-medium text-white">Wallet Balance</span>
                </div>
                <div className="text-5xl font-bold text-white mb-2">₹{user?.walletBalance || 0}</div>
                <p className="text-purple-200">Ready to play and win!</p>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddMoney(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Add Money</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWithdraw(true)}
                    className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                  >
                    <Minus className="h-5 w-5" />
                    <span className="font-semibold">Withdraw</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Games Played</p>
                <p className="text-2xl font-bold text-white">{gameHistory.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-white">₹{totalEarnings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Games Won</p>
                <p className="text-2xl font-bold text-white">{gameHistory.filter(g => g.isWinner).length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Quick Play Card */}
            <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/20 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Join Multiplayer Game</h2>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-2xl p-8 mb-6 border border-green-500/30">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Game Flow</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">₹30</div>
                        <div className="text-xs text-gray-400">Entry Fee</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">₹60</div>
                        <div className="text-xs text-gray-400">Winner Prize</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">3</div>
                        <div className="text-xs text-gray-400">Players</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-200 space-y-1">
                      <p>• System groups every 3 players automatically</p>
                      <p>• If 6 players waiting → 2 games start in parallel</p>
                      <p>• GREEN dots: +1 point | RED dots: -1 penalty</p>
                      <p>• 10 seconds gameplay • Highest score wins</p>
                      <p>• Platform fee: ₹30 • Winner gets: ₹60</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleJoinGame}
                    disabled={cooldownTime > 0}
                    className={`inline-flex items-center space-x-2 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform shadow-lg ${
                      cooldownTime > 0
                        ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 hover:shadow-purple-500/25'
                    }`}
                  >
                    {cooldownTime > 0 ? (
                      <>
                        <Clock className="h-5 w-5" />
                        <span>Wait {cooldownTime}s</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Join Game (₹30)</span>
                      </>
                    )}
                  </button>
                  
                  {(user?.walletBalance || 0) < 30 && (
                    <p className="text-red-400 mt-4 text-sm">
                      Add money to your wallet to join games
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Game History */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <History className="h-5 w-5 mr-2" />
                Recent Games
              </h3>
              
              {gameHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No games played yet</p>
                  <p className="text-gray-500 text-sm">Start your first game to see history here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gameHistory.slice(0, 5).map((game) => (
                    <motion.div 
                      key={game.gameId} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          game.isWinner 
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                            : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}>
                          {game.isWinner ? <Trophy className="h-5 w-5 text-white" /> : <Star className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">Game #{game.gameId.slice(-6)}</span>
                            {game.isWinner && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">Winner</span>}
                          </div>
                          <p className="text-gray-300 text-sm">
                            Score: {game.myScore} | {game.isWinner ? 'You Won!' : `Winner: ${game.winner}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-lg ${game.isWinner ? 'text-green-400' : 'text-red-400'}`}>
                          {game.isWinner ? '+₹60' : '-₹30'}
                        </span>
                        <p className="text-gray-400 text-xs">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Transactions Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Transactions
              </h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction._id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium capitalize">
                          {transaction.type.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'game_winning' 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'game_winning' ? '+' : '-'}
                          ₹{transaction.amount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-green-500/20 text-green-300'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {transaction.status}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showAddMoney && (
        <AddMoneyModal 
          onClose={() => setShowAddMoney(false)} 
          onSuccess={() => {
            setShowAddMoney(false);
            fetchData();
            refreshUser();
          }}
        />
      )}
      
      {showWithdraw && (
        <WithdrawModal 
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            setShowWithdraw(false);
            fetchData();
            refreshUser();
          }}
        />
      )}

      {/* Cooldown Modal */}
      {showCooldownModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-white/20 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Please Wait</h2>
            <p className="text-gray-300 mb-6">
              You need to wait {cooldownTime} seconds before joining another game.
            </p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {cooldownTime}s
              </div>
              <p className="text-yellow-300 text-sm">
                Cooldown remaining
              </p>
            </div>
            
            <button
              onClick={() => setShowCooldownModal(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Okay
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
