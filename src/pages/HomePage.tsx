import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Trophy, Users, Zap, Shield, Star, Sparkles, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="relative z-20">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="relative">
              <Target className="h-10 w-10 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Dot Burster</span>
              <div className="text-xs text-purple-300 font-medium">India's #1 Reflex Game</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <Link
              to="/login"
              className="px-6 py-2.5 text-white hover:text-purple-300 transition-all duration-300 font-medium relative group"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
            >
              Sign Up
            </Link>
            <Link
              to="/admin"
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-6 py-2 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-purple-300 font-medium">India's First Legal Reflex Game</span>
            <Star className="h-4 w-4 text-yellow-400" />
          </motion.div>

          <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Dot Burster
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Test your lightning-fast reflexes in India's most exciting skill-based game! 
            Compete with players nationwide, win real money, and become the ultimate dot-bursting champion.
          </p>
          
          <div className="flex items-center justify-center space-x-6 mb-16">
            <Link
              to="/register"
              className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Start Playing Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/login"
              className="px-10 py-4 border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white font-bold rounded-xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
            >
              I Have Account
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-20"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">₹50L+</div>
              <div className="text-gray-400">Prizes Won</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300 leading-relaxed">
                Test your reflexes in millisecond-precision gameplay. Every tap counts in this high-speed dot-bursting action!
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Multiplayer Battles</h3>
              <p className="text-gray-300 leading-relaxed">
                Face off against 2 other skilled players in real-time matches. Only the fastest reflexes claim victory!
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real Money Rewards</h3>
              <p className="text-gray-300 leading-relaxed">
                Win actual cash prizes! ₹30 entry fee, ₹60 winner reward. 100% legal, secure, and instant payouts.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* How It Works */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-32"
        >
          <h2 className="text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-400 mb-16">Simple steps to start winning</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Sign Up", desc: "Create your account and play the demo game to learn", color: "from-purple-500 to-indigo-500" },
              { step: 2, title: "Add Money", desc: "Add funds to your wallet via secure UPI payment", color: "from-blue-500 to-cyan-500" },
              { step: 3, title: "Join Game", desc: "Queue up for a 3-player match (₹30 entry fee)", color: "from-pink-500 to-rose-500" },
              { step: 4, title: "Win & Earn", desc: "Burst the most dots and win ₹60 instantly!", color: "from-green-500 to-emerald-500" }
            ].map((item, index) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Admin Access */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-32"
        >
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto backdrop-blur-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Admin Access</h3>
            <p className="text-gray-300 mb-6">
              Manage users, transactions, and game statistics with powerful admin tools
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;