// Shared utilities for API functions
const fs = require('fs').promises;
const path = require('path');

// For Vercel, we'll use Vercel KV (Redis) if available, otherwise fallback to in-memory storage
// ⚠️ WARNING: In-memory storage in serverless functions is NOT reliable!
// Each function invocation may use a different instance, so data won't persist.
// You MUST set up Vercel KV for data to persist properly.
let memoryStore = { scores: [] };

// Initialize Vercel KV if available
// If KV is not set up, we'll use in-memory storage (data resets on each deployment)
let kv = null;

// Only try to use KV if environment variables are present
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    const { createClient } = require('@vercel/kv');
    kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    console.log('Vercel KV initialized');
  } catch (e) {
    // KV package not available or error initializing - use memory store
    console.log('Vercel KV not available, using in-memory storage');
  }
} else {
  // No KV environment variables - use memory store
  console.log('Vercel KV not configured, using in-memory storage');
}

// Read leaderboard data
async function readLeaderboard() {
  // Try Vercel KV first
  if (kv) {
    try {
      const data = await kv.get('leaderboard');
      console.log('Data read from Vercel KV');
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
    console.log('Data read from file system');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or can't read (normal on Vercel), use memory store
    console.log('⚠️ Reading from in-memory storage. Current scores:', memoryStore.scores?.length || 0);
    return memoryStore;
  }
}

// Write leaderboard data
async function writeLeaderboard(data) {
  // Try Vercel KV first
  if (kv) {
    try {
      await kv.set('leaderboard', data);
      console.log('Data saved to Vercel KV');
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
    console.log('Data saved to file system');
  } catch (error) {
    // File write fails (normal on Vercel - read-only filesystem), use memory store
    memoryStore = data;
    console.log('⚠️ WARNING: Using in-memory storage. Data may not persist!');
    console.log('Current memory store:', JSON.stringify(memoryStore));
    console.log('⚠️ Set up Vercel KV for persistent storage!');
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

