import React, { useState, useEffect } from 'react';
import { X, Copy, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AddMoneyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [adminUPI, setAdminUPI] = useState({ upiId: '', qrCode: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchAdminUPI();
  }, []);

  const fetchAdminUPI = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/admin-upi');
      setAdminUPI(response.data);
    } catch (error) {
      toast.error('Failed to fetch payment details');
    }
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(adminUPI.upiId);
    toast.success('UPI ID copied to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('transactionId', transactionId);
      if (paymentProof) {
        formData.append('paymentProof', paymentProof);
      }

      await axios.post('http://localhost:5000/api/user/add-money', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Payment request submitted successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit payment request');
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
          <h2 className="text-2xl font-bold text-white">Add Money</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 1 && (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Add (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter amount (minimum ₹50)"
                min="50"
                required
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Payment Details</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-300 mb-1">Admin UPI ID:</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono bg-white/10 px-3 py-1 rounded">
                      {adminUPI.upiId}
                    </span>
                    <button
                      onClick={copyUPIId}
                      className="p-1 text-purple-400 hover:text-purple-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {adminUPI.qrCode && (
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Or scan QR Code:</p>
                    <img 
                      src={adminUPI.qrCode} 
                      alt="UPI QR Code" 
                      className="w-32 h-32 mx-auto bg-white rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!amount || parseFloat(amount) < 50}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment Proof
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-green-400 mb-2">✓ Amount: ₹{amount}</p>
              <p className="text-green-400 mb-4">✓ UPI ID: {adminUPI.upiId}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter UPI transaction ID"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Screenshot (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  className="hidden"
                  id="paymentProof"
                />
                <label htmlFor="paymentProof" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300">
                    {paymentProof ? paymentProof.name : 'Click to upload screenshot'}
                  </p>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AddMoneyModal;