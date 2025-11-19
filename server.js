const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
// Get admin password from environment variable, or use default "admin123"
// To change password: set ADMIN_PASSWORD_HASH environment variable or use generate-password.js
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;
const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD || 'STInumber1@novalicbes'; // Fallback for easy setup

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file path
const DATA_FILE = path.join(__dirname, 'leaderboard.json');

// Initialize data file if it doesn't exist
async function initializeData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ scores: [] }, null, 2));
  }
}

// Read leaderboard data
async function readLeaderboard() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { scores: [] };
  }
}

// Write leaderboard data
async function writeLeaderboard(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Sort scores by WPM (descending), then by accuracy (descending)
function sortScores(scores) {
  return scores.sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    return b.accuracy - a.accuracy;
  });
}

// API Routes

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const data = await readLeaderboard();
    const sortedScores = sortScores([...data.scores]);
    res.json({ scores: sortedScores });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get rank for a specific player
app.get('/api/rank/:name', async (req, res) => {
  try {
    const data = await readLeaderboard();
    const sortedScores = sortScores([...data.scores]);
    const playerIndex = sortedScores.findIndex(
      score => score.name.toLowerCase() === req.params.name.toLowerCase()
    );
    
    if (playerIndex === -1) {
      return res.json({ rank: null, message: 'Player not found' });
    }
    
    res.json({ 
      rank: playerIndex + 1, 
      score: sortedScores[playerIndex],
      totalPlayers: sortedScores.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rank' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  try {
    let isValid = false;
    
    // Try bcrypt hash first (if a proper hash is provided via environment variable)
    // Check if it's a valid bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (ADMIN_PASSWORD_HASH && (ADMIN_PASSWORD_HASH.startsWith('$2a$') || 
                                 ADMIN_PASSWORD_HASH.startsWith('$2b$') || 
                                 ADMIN_PASSWORD_HASH.startsWith('$2y$'))) {
      isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    }
    
    // Fallback to plain text comparison (for easy setup/development)
    if (!isValid && ADMIN_PASSWORD_PLAIN) {
      isValid = (password === ADMIN_PASSWORD_PLAIN);
    }
    
    if (isValid) {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to verify admin token
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.admin) {
      req.admin = true;
      next();
    } else {
      res.status(403).json({ error: 'Not authorized' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Add score (admin only)
app.post('/api/admin/add-score', verifyAdmin, async (req, res) => {
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
    res.status(500).json({ error: 'Failed to add score' });
  }
});

// Delete score (admin only)
app.delete('/api/admin/score/:id', verifyAdmin, async (req, res) => {
  try {
    const data = await readLeaderboard();
    data.scores = data.scores.filter(score => score.id !== req.params.id);
    await writeLeaderboard(data);
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete score' });
  }
});

// Initialize and start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Default admin password: admin123`);
  });
});

