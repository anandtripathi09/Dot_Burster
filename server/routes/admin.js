import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Game from '../models/Game.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await Game.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const platformRevenue = await Transaction.aggregate([
      { $match: { type: 'game_entry', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalUsers,
      totalGames,
      totalTransactions,
      platformRevenue: platformRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending transactions
router.get('/transactions/pending', authenticateAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject transaction
router.put('/transactions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = status;
    transaction.adminNotes = adminNotes;

    if (status === 'approved' && transaction.type === 'deposit') {
      // Add money to user wallet
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: { walletBalance: transaction.amount }
      });
    } else if (status === 'approved' && transaction.type === 'withdrawal') {
      // Deduct money from user wallet
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: { walletBalance: -transaction.amount }
      });
    }

    await transaction.save();
    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's transactions
    await Transaction.deleteMany({ userId });
    
    // Remove user from any active games
    await Game.updateMany(
      { 'players.userId': userId },
      { $pull: { players: { userId } } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;