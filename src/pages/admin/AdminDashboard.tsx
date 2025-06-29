import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  DollarSign, 
  GamepadIcon, 
  TrendingUp, 
  Shield,
  LogOut,
  Check,
  X,
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalTransactions: number;
  platformRevenue: number;
}

interface Transaction {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  type: string;
  amount: number;
  status: string;
  paymentProof?: string;
  upiId?: string;
  transactionId?: string;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  walletBalance: number;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'users'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGames: 0,
    totalTransactions: 0,
    platformRevenue: 0
  });
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, transactionsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`),
        axios.get(`${API_BASE_URL}/api/admin/transactions/pending`),
        axios.get(`${API_BASE_URL}/api/admin/users`)
      ]);

      setStats(statsRes.data);
      setPendingTransactions(transactionsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (transactionId: string, status: 'approved' | 'rejected', adminNotes = '') => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/transactions/${transactionId}`, {
        status,
        adminNotes
      });

      toast.success(`Transaction ${status} successfully`);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${status} transaction`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      setDeleteConfirm(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-white">Admin Panel</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <GamepadIcon className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-gray-300 text-sm">Total Games</p>
                <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-gray-300 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-gray-300 text-sm">Platform Revenue</p>
                <p className="text-2xl font-bold text-white">₹{stats.platformRevenue}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 mb-8 border border-white/20">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'transactions', label: 'Pending Transactions', icon: Clock },
            { id: 'users', label: 'Users', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-green-400 font-semibold">Platform Revenue</p>
                    <p className="text-white">₹{stats.platformRevenue} earned from game fees</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-blue-400 font-semibold">User Growth</p>
                    <p className="text-white">{stats.totalUsers} registered users</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-purple-400 font-semibold">Game Activity</p>
                    <p className="text-white">{stats.totalGames} games completed</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Pending Actions</h3>
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-300 font-semibold">
                      {pendingTransactions.length} Pending Transactions
                    </p>
                    <p className="text-gray-300 text-sm">
                      Review and approve user deposits/withdrawals
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Pending Transactions</h2>
            
            {pendingTransactions.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No pending transactions</p>
            ) : (
              <div className="space-y-4">
                {pendingTransactions.map((transaction) => (
                  <div key={transaction._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {transaction.type === 'deposit' ? 'Add Money' : 'Withdrawal'} Request
                        </h3>
                        <p className="text-gray-300">
                          {transaction.userId.name} ({transaction.userId.email})
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">₹{transaction.amount}</p>
                        <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                          {transaction.status}
                        </span>
                      </div>
                    </div>

                    {transaction.transactionId && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-300">
                          <strong>Transaction ID:</strong> {transaction.transactionId}
                        </p>
                      </div>
                    )}

                    {transaction.upiId && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-300">
                          <strong>UPI ID:</strong> {transaction.upiId}
                        </p>
                      </div>
                    )}

                    {transaction.paymentProof && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-300 mb-2">Payment Proof:</p>
                        <img 
                          src={`${API_BASE_URL}/uploads/${transaction.paymentProof}`}
                          alt="Payment proof"
                          className="max-w-xs rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleTransactionAction(transaction._id, 'approved')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleTransactionAction(transaction._id, 'rejected', 'Rejected by admin')}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-gray-300 py-3">Name</th>
                    <th className="text-left text-gray-300 py-3">Email</th>
                    <th className="text-left text-gray-300 py-3">Wallet</th>
                    <th className="text-left text-gray-300 py-3">Games</th>
                    <th className="text-left text-gray-300 py-3">Win Rate</th>
                    <th className="text-left text-gray-300 py-3">Joined</th>
                    <th className="text-left text-gray-300 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-white/10">
                      <td className="py-3 text-white">{user.name}</td>
                      <td className="py-3 text-gray-300">{user.email}</td>
                      <td className="py-3 text-green-400 font-semibold">₹{user.walletBalance}</td>
                      <td className="py-3 text-white">{user.gamesPlayed}</td>
                      <td className="py-3 text-white">
                        {user.gamesPlayed > 0 
                          ? `${Math.round((user.gamesWon / user.gamesPlayed) * 100)}%`
                          : '0%'
                        }
                      </td>
                      <td className="py-3 text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {deleteConfirm === user._id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                            >
                              <Check className="h-3 w-3" />
                              <span>Confirm</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                            >
                              <X className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user._id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 rounded text-sm transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will also delete all their transactions and game history.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Delete User
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
