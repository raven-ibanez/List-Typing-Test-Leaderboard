// Simple test endpoint to verify Vercel functions work
module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ 
      status: 'ok', 
      message: 'API is working',
      timestamp: new Date().toISOString(),
      env: {
        hasKv: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
        hasAdminPassword: !!process.env.ADMIN_PASSWORD,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

