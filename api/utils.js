// Shared utilities for API functions
const fs = require('fs').promises;
const path = require('path');

// For Vercel, we'll use Vercel KV (Redis) if available, otherwise fallback to in-memory storage
// Note: In-memory storage will reset on each deployment
let memoryStore = { scores: [] };

// Check if Vercel KV is available
let kv = null;
try {
  kv = require('@vercel/kv');
} catch (e) {
  // Vercel KV not available, use memory store
}

// Read leaderboard data
async function readLeaderboard() {
  if (kv) {
    try {
      const data = await kv.get('leaderboard');
      return data || { scores: [] };
    } catch (error) {
      console.error('KV read error:', error);
      return { scores: [] };
    }
  }
  
  // Fallback: Try file system (for local dev)
  try {
    const DATA_FILE = path.join(process.cwd(), 'leaderboard.json');
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return memory store
    return memoryStore;
  }
}

// Write leaderboard data
async function writeLeaderboard(data) {
  if (kv) {
    try {
      await kv.set('leaderboard', data);
      return;
    } catch (error) {
      console.error('KV write error:', error);
      throw error;
    }
  }
  
  // Fallback: Try file system (for local dev)
  try {
    const DATA_FILE = path.join(process.cwd(), 'leaderboard.json');
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    // If file write fails, use memory store
    memoryStore = data;
  }
}

// Sort scores by WPM (descending), then by accuracy (descending)
function sortScores(scores) {
  return scores.sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    return b.accuracy - a.accuracy;
  });
}

module.exports = {
  readLeaderboard,
  writeLeaderboard,
  sortScores
};

