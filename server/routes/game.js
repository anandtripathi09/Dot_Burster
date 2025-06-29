import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Game from '../models/Game.js';
import User from '../models/User.js';

const router = express.Router();

// Get game history
router.get('/history', authenticate, async (req, res) => {
  try {
    const games = await Game.find({ 
      'players.userId': req.user._id 
    })
    .populate('winner', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    const formattedGames = games.map(game => {
      const player = game.players.find(p => p.userId.toString() === req.user._id.toString());
      return {
        gameId: game.gameId,
        status: game.status,
        myScore: player?.score || 0,
        winner: game.winner?.name,
        isWinner: game.winner?._id.toString() === req.user._id.toString(),
        createdAt: game.createdAt
      };
    });

    res.json(formattedGames);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;