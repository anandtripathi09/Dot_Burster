import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface WithdrawModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount < 400) {
      toast.error('Minimum withdrawal amount is ₹400');
      return;
    }
    
    if (withdrawAmount > (user?.walletBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/user/withdraw`, {
        amount: withdrawAmount,
        upiId,
      });

      toast.success('Withdrawal request submitted successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Withdraw Money</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <p className="text-yellow-300 text-sm">
            <strong>Current Balance:</strong> ₹{user?.walletBalance || 0}
          </p>
          <p className="text-yellow-300 text-sm mt-1">
            <strong>Minimum Withdrawal:</strong> ₹400
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Withdrawal Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter amount (minimum ₹400)"
              min="400"
              max={user?.walletBalance || 0}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="yourname@paytm / yourname@phonepe"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Money will be sent to this UPI ID after admin approval
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Important Notes:</h4>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• Withdrawal requests are processed manually by admin</li>
              <li>• Processing time: 24-48 hours</li>
              <li>• Make sure your UPI ID is correct</li>
              <li>• Amount will be deducted only after admin approval</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !upiId || parseFloat(amount) < 400}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default WithdrawModal;
