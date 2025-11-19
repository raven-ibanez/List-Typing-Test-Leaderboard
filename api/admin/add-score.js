const jwt = require('jsonwebtoken');
const { readLeaderboard, writeLeaderboard } = require('../utils');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify admin token
function verifyAdmin(req) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return { error: 'No token provided', status: 401 };
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.admin) {
      return { valid: true };
    } else {
      return { error: 'Not authorized', status: 403 };
    }
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

module.exports = async (req, res) => {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin first
    const auth = verifyAdmin(req);
    if (!auth.valid) {
      console.log('Auth failed:', auth.error);
      return res.status(auth.status).json({ error: auth.error });
    }

    // Parse body - Vercel serverless functions need manual parsing
    let body = req.body;
    
    // If body is undefined or empty, try to read from the request
    if (!body || Object.keys(body).length === 0) {
      // Vercel might not auto-parse JSON, so we need to handle it
      if (typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON in request body' });
        }
      } else {
        // Try to get raw body if available
        body = req.body;
      }
    }
    
    // If still no body, return error
    if (!body || Object.keys(body).length === 0) {
      console.log('No body received:', { body, type: typeof body });
      return res.status(400).json({ error: 'Request body is required' });
    }
    
    const { name, wpm, accuracy } = body;
    
    // Validate inputs
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Player name is required' });
    }
    
    if (wpm === undefined || wpm === null || isNaN(parseFloat(wpm))) {
      return res.status(400).json({ error: 'Valid WPM is required' });
    }
    
    if (accuracy === undefined || accuracy === null || isNaN(parseFloat(accuracy))) {
      return res.status(400).json({ error: 'Valid accuracy is required' });
    }
    
    // Read current leaderboard
    const data = await readLeaderboard();
    const scores = Array.isArray(data.scores) ? data.scores : [];
    
    // Create new score
    const newScore = {
      id: Date.now().toString(),
      name: String(name).trim(),
      wpm: parseFloat(wpm),
      accuracy: parseFloat(accuracy),
      date: new Date().toISOString()
    };
    
    // Add score
    scores.push(newScore);
    data.scores = scores;
    
    // Save leaderboard
    await writeLeaderboard(data);
    
    console.log('Score added successfully:', newScore);
    res.json({ message: 'Score added successfully', score: newScore });
  } catch (error) {
    console.error('Error adding score:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to add score', details: error.message });
  }
};

