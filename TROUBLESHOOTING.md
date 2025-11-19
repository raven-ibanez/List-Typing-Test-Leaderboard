# Troubleshooting Vercel Deployment

## If Functions Are Still Crashing

### Step 1: Test the Basic Endpoint

First, test if any API function works:
- Visit: `https://your-project.vercel.app/api/test`
- This should return a JSON response with status information
- If this fails, the issue is with Vercel setup, not your code

### Step 2: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click on **"Functions"** tab
3. Click on a failed function (e.g., `/api/leaderboard`)
4. Check the **"Logs"** section
5. Look for the actual error message

Common errors you might see:

#### Error: "Cannot find module '@vercel/kv'"
**Solution:** The package might not be installed. Make sure `package.json` includes it and push again.

#### Error: "Module not found" or "Cannot find module"
**Solution:** 
- Check that all files in `/api` directory are committed to Git
- Make sure `node_modules` is in `.gitignore` (it should be)
- Vercel will install dependencies automatically

#### Error: "req.body is undefined"
**Solution:** This is handled in the updated code. Make sure you've pushed the latest changes.

#### Error: "KV connection failed"
**Solution:** 
- This is OK if you haven't set up Vercel KV yet
- The code will fall back to in-memory storage
- To fix: Set up Vercel KV in your dashboard

### Step 3: Verify Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

- ✅ `ADMIN_PASSWORD` = `STInumber1@novalicbes`
- ✅ `JWT_SECRET` = (any random string, at least 32 characters)

**Important:** After adding environment variables, you MUST redeploy:
1. Go to Deployments tab
2. Click the three dots (⋯) on latest deployment
3. Click "Redeploy"

### Step 4: Check File Structure

Your project should have this structure:
```
/
├── api/
│   ├── admin/
│   │   ├── login.js
│   │   ├── add-score.js
│   │   └── score/
│   │       └── [id].js
│   ├── rank/
│   │   └── [name].js
│   ├── leaderboard.js
│   ├── test.js
│   └── utils.js
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── leaderboard.js
│   ├── admin.js
│   └── styles.css
├── package.json
├── vercel.json
└── server.js (not used on Vercel)
```

### Step 5: Common Fixes

#### Fix 1: Clear Build Cache
1. Vercel Dashboard → Settings → General
2. Scroll to "Build & Development Settings"
3. Clear build cache
4. Redeploy

#### Fix 2: Check Node.js Version
1. Vercel Dashboard → Settings → General
2. Set Node.js version to `18.x` or `20.x`
3. Redeploy

#### Fix 3: Simplify and Test
1. Test `/api/test` endpoint first
2. If that works, test `/api/leaderboard`
3. If that works, test `/api/admin/login`
4. This helps identify which specific function is failing

### Step 6: Get Specific Error Details

If you can see the error in Vercel logs, share:
1. The exact error message
2. Which endpoint is failing (e.g., `/api/leaderboard`)
3. The stack trace (if available)

### Step 7: Alternative - Use Simpler Storage

If Vercel KV is causing issues, you can temporarily disable it:

1. The code already falls back to in-memory storage
2. Data will reset on each deployment, but functions should work
3. Once working, you can add Vercel KV later

### Still Not Working?

If none of the above works, try this minimal test:

1. Create a file `api/hello.js`:
```javascript
module.exports = async (req, res) => {
  res.json({ message: 'Hello from Vercel!' });
};
```

2. Deploy and visit: `https://your-project.vercel.app/api/hello`
3. If this works, the issue is with a specific function
4. If this fails, the issue is with Vercel configuration

## Quick Checklist

- [ ] All files committed to Git
- [ ] Pushed to GitHub
- [ ] Environment variables set in Vercel
- [ ] Redeployed after setting environment variables
- [ ] Checked function logs for specific errors
- [ ] Tested `/api/test` endpoint
- [ ] Node.js version set to 18.x or 20.x

## Need More Help?

Share:
1. The exact error from Vercel logs
2. Which endpoint is failing
3. Screenshot of the error (if possible)

