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

  // Verify admin
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { name, wpm, accuracy } = req.body;
  
  if (!name || wpm === undefined || accuracy === undefined) {
    return res.status(400).json({ error: 'Name, WPM, and accuracy are required' });
  }
  
  try {
    const data = await readLeaderboard();
    const newScore = {
      id: Date.now().toString(),
      name: name.trim(),
      wpm: parseFloat(wpm),
      accuracy: parseFloat(accuracy),
      date: new Date().toISOString()
    };
    
    data.scores.push(newScore);
    await writeLeaderboard(data);
    
    res.json({ message: 'Score added successfully', score: newScore });
  } catch (error) {
    console.error('Error adding score:', error);
    res.status(500).json({ error: 'Failed to add score' });
  }
};

