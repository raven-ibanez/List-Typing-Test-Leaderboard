const jwt = require('jsonwebtoken');
const { readLeaderboard, writeLeaderboard } = require('../../utils');

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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin
  const auth = verifyAdmin(req);
  if (!auth.valid) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    // Extract id from URL path (Vercel dynamic route)
    const urlParts = req.url.split('/');
    const id = urlParts[urlParts.length - 1];
    const data = await readLeaderboard();
    data.scores = data.scores.filter(score => score.id !== id);
    await writeLeaderboard(data);
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Error deleting score:', error);
    res.status(500).json({ error: 'Failed to delete score' });
  }
};

