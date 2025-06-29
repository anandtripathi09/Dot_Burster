import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    score: {
      type: Number,
      default: 0
    },
    socketId: String
  }],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'completed'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  entryFee: {
    type: Number,
    default: 30
  },
  prizeAmount: {
    type: Number,
    default: 60
  },
  platformFee: {
    type: Number,
    default: 30
  },
  startTime: Date,
  endTime: Date,
  gameData: {
    dots: Array,
    duration: {
      type: Number,
      default: 10
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Game', gameSchema);