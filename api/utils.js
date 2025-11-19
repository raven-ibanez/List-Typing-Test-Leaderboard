// Shared utilities for API functions
const fs = require('fs').promises;
const path = require('path');

// For Vercel, we'll use Vercel KV (Redis) if available, otherwise fallback to in-memory storage
// Note: In-memory storage will reset on each deployment
let memoryStore = { scores: [] };

// Initialize Vercel KV if available
let kv = null;
try {
  const { createClient } = require('@vercel/kv');
  // Vercel automatically provides KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, etc.
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
} catch (e) {
  // Vercel KV not available or not configured, use memory store
  console.log('Vercel KV not available, using memory store');
}

// Read leaderboard data
async function readLeaderboard() {
  // Try Vercel KV first
  if (kv) {
    try {
      const data = await kv.get('leaderboard');
      return data || { scores: [] };
    } catch (error) {
      console.error('KV read error:', error);
      // Fall through to memory store
    }
  }
  
  // Fallback: Try file system (for local development only)
  // On Vercel, this will fail but we catch it
  try {
    const DATA_FILE = path.join(process.cwd(), 'leaderboard.json');
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or can't read (normal on Vercel), use memory store
    return memoryStore;
  }
}

// Write leaderboard data
async function writeLeaderboard(data) {
  // Try Vercel KV first
  if (kv) {
    try {
      await kv.set('leaderboard', data);
      return;
    } catch (error) {
      console.error('KV write error:', error);
      // Fall through to memory store
    }
  }
  
  // Fallback: Try file system (for local development only)
  // On Vercel, this will fail but we catch it and use memory store
  try {
    const DATA_FILE = path.join(process.cwd(), 'leaderboard.json');
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    // File write fails (normal on Vercel - read-only filesystem), use memory store
    memoryStore = data;
    console.log('Using memory store (file system not writable)');
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

