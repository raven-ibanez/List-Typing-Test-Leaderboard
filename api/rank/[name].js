const { readLeaderboard, sortScores } = require('../utils');

module.exports = async (req, res) => {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract name from URL path (Vercel dynamic route)
    // URL format: /api/rank/John%20Doe
    const urlParts = req.url.split('/');
    const name = decodeURIComponent(urlParts[urlParts.length - 1]);
    
    if (!name) {
      return res.status(400).json({ error: 'Player name is required' });
    }
    
    const data = await readLeaderboard();
    const scores = Array.isArray(data.scores) ? data.scores : [];
    const sortedScores = sortScores([...scores]);
    const playerIndex = sortedScores.findIndex(
      score => score.name && score.name.toLowerCase() === name.toLowerCase()
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
    console.error('Error fetching rank:', error);
    res.status(500).json({ error: 'Failed to fetch rank', details: error.message });
  }
};

