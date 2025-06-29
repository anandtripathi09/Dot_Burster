import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete demo game
router.post('/complete-demo', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.hasPlayedDemo = true;
    await user.save();

    res.json({ message: 'Demo completed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add money request
router.post('/add-money', authenticate, upload.single('paymentProof'), async (req, res) => {
  try {
    const { amount, transactionId } = req.body;
    const paymentProof = req.file ? req.file.filename : null;

    const transaction = new Transaction({
      userId: req.user._id,
      type: 'deposit',
      amount: parseFloat(amount),
      paymentProof,
      transactionId,
      status: 'pending'
    });

    await transaction.save();
    res.json({ message: 'Payment request submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdrawal request
router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const user = await User.findById(req.user._id);

    if (user.walletBalance < 400) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹400' });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update user UPI ID
    user.upiId = upiId;
    await user.save();

    const transaction = new Transaction({
      userId: req.user._id,
      type: 'withdrawal',
      amount: parseFloat(amount),
      upiId,
      status: 'pending'
    });

    await transaction.save();
    res.json({ message: 'Withdrawal request submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transactions
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin UPI details for payment
router.get('/admin-upi', authenticate, async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.json({
      upiId: admin?.upiId || 'admin@paytm',
      qrCode: admin?.upiQRCode || 'https://via.placeholder.com/300x300?text=UPI+QR+CODE'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;