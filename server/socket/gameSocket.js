import { v4 as uuidv4 } from 'uuid';
import Game from '../models/Game.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const gameQueues = new Map(); // Stores waiting players
const activeGames = new Map(); // Stores active game sessions
const playerCooldowns = new Map(); // Stores player cooldown timers

export const setupGameSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-game-queue', async (data) => {
      try {
        const { userId, token } = data;
        
        // Check if user is in cooldown
        if (playerCooldowns.has(userId)) {
          const cooldownEnd = playerCooldowns.get(userId);
          if (Date.now() < cooldownEnd) {
            const remainingTime = Math.ceil((cooldownEnd - Date.now()) / 1000);
            socket.emit('cooldown-active', { remainingTime });
            return;
          }
          playerCooldowns.delete(userId);
        }

        const user = await User.findById(userId);
        if (!user || user.walletBalance < 30) {
          socket.emit('insufficient-balance');
          return;
        }

        // Deduct entry fee immediately
        user.walletBalance -= 30;
        await user.save();

        // Create transaction record
        const transaction = new Transaction({
          userId,
          type: 'game_entry',
          amount: 30,
          status: 'completed'
        });
        await transaction.save();

        const player = {
          userId,
          name: user.name,
          socketId: socket.id,
          score: 0
        };

        // Add player to global waiting pool
        let waitingPlayers = [];
        
        // Collect all waiting players from all queues
        for (const queue of gameQueues.values()) {
          if (queue.status === 'waiting') {
            waitingPlayers.push(...queue.players);
          }
        }
        
        // Add current player
        waitingPlayers.push(player);
        
        console.log(`Total waiting players: ${waitingPlayers.length}`);

        // Group players into sets of 3
        const gameGroups = [];
        for (let i = 0; i < waitingPlayers.length; i += 3) {
          const group = waitingPlayers.slice(i, i + 3);
          if (group.length === 3) {
            gameGroups.push(group);
          }
        }

        // Clear existing queues since we're regrouping
        gameQueues.clear();

        // Start games for complete groups of 3
        for (const group of gameGroups) {
          const gameId = uuidv4();
          await startGame(io, gameId, group);
          // Remove these players from waiting list
          waitingPlayers = waitingPlayers.filter(p => 
            !group.some(gp => gp.userId === p.userId)
          );
        }

        // Put remaining players (less than 3) back in queue
        if (waitingPlayers.length > 0) {
          const queueId = uuidv4();
          const gameQueue = {
            gameId: queueId,
            players: waitingPlayers,
            status: 'waiting'
          };
          gameQueues.set(queueId, gameQueue);

          // Join all waiting players to the same queue room
          waitingPlayers.forEach(p => {
            const playerSocket = io.sockets.sockets.get(p.socketId);
            if (playerSocket) {
              playerSocket.join(queueId);
            }
          });

          // Notify all waiting players
          io.to(queueId).emit('queue-update', {
            players: waitingPlayers.map(p => ({ name: p.name, userId: p.userId })),
            waitingFor: 3 - waitingPlayers.length
          });
        }

        // If current player is in a complete group, they'll get game-start events
        // If not, they'll get queue-update events

      } catch (error) {
        console.error('Error joining game queue:', error);
        socket.emit('game-error', { message: 'Failed to join game' });
      }
    });

    socket.on('leave-game-queue', async (data) => {
      try {
        const { userId } = data;
        
        // Find and remove player from queue
        for (const [gameId, queue] of gameQueues.entries()) {
          const playerIndex = queue.players.findIndex(p => p.userId === userId);
          if (playerIndex !== -1) {
            const player = queue.players[playerIndex];
            queue.players.splice(playerIndex, 1);
            socket.leave(gameId);
            
            // Refund entry fee
            await User.findByIdAndUpdate(userId, {
              $inc: { walletBalance: 30 }
            });
            
            // Remove the most recent game entry transaction
            await Transaction.findOneAndDelete({
              userId,
              type: 'game_entry',
              status: 'completed'
            });
            
            console.log(`Player ${player.name} left queue and got refund`);
            
            // If queue is empty, remove it
            if (queue.players.length === 0) {
              gameQueues.delete(gameId);
            } else {
              // Update remaining players
              io.to(gameId).emit('queue-update', {
                players: queue.players.map(p => ({ name: p.name, userId: p.userId })),
                waitingFor: 3 - queue.players.length
              });
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error leaving game queue:', error);
      }
    });

    socket.on('game-action', async (data) => {
      try {
        const { gameId, userId, action, dotId } = data;
        const game = activeGames.get(gameId);

        if (!game || game.status !== 'playing') return;

        const player = game.players.find(p => p.userId === userId);
        if (!player) return;

        if (action === 'tap' && game.currentDot && game.currentDot.id === dotId) {
          if (game.currentDot.color === 'green') {
            // +1 point for green dots
            player.score += 1;
            console.log(`Player ${player.name} scored! New score: ${player.score}`);
            
            // Increase dot generation speed (decrease interval)
            game.dotSpeed = Math.max(game.dotSpeed - 100, 200);
          } else if (game.currentDot.color === 'red') {
            // -1 point penalty for red dots
            player.score = Math.max(0, player.score - 1); // Don't go below 0
            console.log(`Player ${player.name} hit red dot! Penalty applied. New score: ${player.score}`);
          }

          // Broadcast score update immediately
          io.to(gameId).emit('score-update', {
            players: game.players.map(p => ({
              name: p.name,
              userId: p.userId,
              score: p.score
            }))
          });
        }
      } catch (error) {
        console.error('Error handling game action:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Handle player disconnect - could implement reconnection logic
    });
  });
};

async function startGame(io, gameId, players) {
  try {
    console.log(`Starting game ${gameId} with players:`, players.map(p => p.name));
    
    // Save game to database
    const game = new Game({
      gameId,
      players: players.map(p => ({
        userId: p.userId,
        name: p.name,
        score: 0,
        socketId: p.socketId
      })),
      status: 'playing',
      startTime: new Date()
    });
    await game.save();

    // Join all players to game room
    players.forEach(player => {
      const playerSocket = io.sockets.sockets.get(player.socketId);
      if (playerSocket) {
        playerSocket.join(gameId);
      }
    });

    // Create active game state
    const activeGame = {
      gameId,
      players: players,
      status: 'playing',
      startTime: Date.now(),
      currentDot: null,
      dotSpeed: 1000, // Start with 1 second intervals
      gameTimer: null,
      dotTimer: null
    };

    activeGames.set(gameId, activeGame);

    // Start countdown: "Get ready... 3... 2... 1... GO!"
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      io.to(gameId).emit('countdown', countdown);
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        io.to(gameId).emit('game-start');
        startGameLoop(io, activeGame);
      }
    }, 1000);

  } catch (error) {
    console.error('Error starting game:', error);
  }
}

function startGameLoop(io, game) {
  const gameId = game.gameId;
  
  // Game duration: exactly 10 seconds
  game.gameTimer = setTimeout(async () => {
    await endGame(io, game);
  }, 10000);

  // Dot generation loop - only one dot at a time
  function generateDot() {
    if (game.status !== 'playing') return;

    // 70% green, 30% red dots
    const colors = ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'red', 'red', 'red'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    game.currentDot = {
      id: uuidv4(),
      color,
      x: Math.random() * 80 + 10, // 10-90% of container width
      y: Math.random() * 80 + 10, // 10-90% of container height
      timestamp: Date.now()
    };

    io.to(gameId).emit('new-dot', game.currentDot);

    // Schedule next dot with current speed
    game.dotTimer = setTimeout(generateDot, game.dotSpeed);
  }

  // Start generating dots immediately
  generateDot();
}

async function endGame(io, game) {
  try {
    clearTimeout(game.gameTimer);
    clearTimeout(game.dotTimer);
    
    game.status = 'completed';
    
    // Find winner (highest score)
    const winner = game.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    console.log(`Game ${game.gameId} ended. Winner: ${winner.name} with score ${winner.score}`);

    // Update database
    const dbGame = await Game.findOne({ gameId: game.gameId });
    dbGame.status = 'completed';
    dbGame.endTime = new Date();
    dbGame.winner = winner.userId;
    dbGame.players = game.players.map(p => ({
      userId: p.userId,
      name: p.name,
      score: p.score,
      socketId: p.socketId
    }));
    await dbGame.save();

    // Award prize to winner: ₹60
    const winnerUser = await User.findById(winner.userId);
    winnerUser.walletBalance += 60;
    winnerUser.gamesWon += 1;
    winnerUser.totalEarnings += 60;
    winnerUser.lastGameAt = new Date();
    await winnerUser.save();

    // Update all players' game count
    for (const player of game.players) {
      await User.findByIdAndUpdate(player.userId, {
        $inc: { gamesPlayed: 1 },
        lastGameAt: new Date()
      });
    }

    // Create winning transaction
    const winningTransaction = new Transaction({
      userId: winner.userId,
      type: 'game_winning',
      amount: 60,
      status: 'completed',
      gameId: dbGame._id
    });
    await winningTransaction.save();

    // Set 45-second cooldown for all players
    const cooldownEnd = Date.now() + 45000;
    game.players.forEach(player => {
      playerCooldowns.set(player.userId, cooldownEnd);
    });

    // Send game results
    io.to(game.gameId).emit('game-end', {
      winner: {
        name: winner.name,
        score: winner.score
      },
      results: game.players.map(p => ({
        name: p.name,
        score: p.score,
        isWinner: p.userId === winner.userId
      })),
      cooldownTime: 45
    });

    // Clean up
    activeGames.delete(game.gameId);

    console.log(`Game ${game.gameId} completed. Platform fee: ₹30, Winner prize: ₹60`);

  } catch (error) {
    console.error('Error ending game:', error);
  }
}