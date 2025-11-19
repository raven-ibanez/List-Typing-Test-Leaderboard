# Deploying Without Vercel KV

You can deploy this project **without setting up Vercel KV**. The code will automatically use in-memory storage as a fallback.

## ⚠️ Important Note

**Without Vercel KV:**
- ✅ Your functions will work fine
- ✅ You can add and view scores
- ❌ **Data will reset on each deployment** (scores are stored in memory)
- ❌ Data is not persistent between deployments

This is fine for testing, but for production you'll want to set up Vercel KV or another database.

## Deployment Steps (Without KV)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect settings

3. **Set Environment Variables** (Required)
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add these two:
     - `ADMIN_PASSWORD` = `STInumber1@novalicbes`
     - `JWT_SECRET` = (any random string, e.g., `my-secret-key-12345`)
   - **Do NOT add** `KV_REST_API_URL` or `KV_REST_API_TOKEN` (skip KV setup)

4. **Redeploy**
   - After adding environment variables, go to Deployments
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"

5. **Test Your Deployment**
   - Visit: `https://your-project.vercel.app`
   - Visit: `https://your-project.vercel.app/api/test` (should work)
   - Visit: `https://your-project.vercel.app/api/leaderboard` (should return empty array)
   - Visit: `https://your-project.vercel.app/admin.html` and login

## How It Works Without KV

The code automatically detects if Vercel KV is not set up:
- Checks for `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables
- If not found, uses in-memory storage
- Data is stored in a JavaScript variable (resets on each deployment)

## When to Add KV Later

If you want persistent data storage:
1. Go to Vercel Dashboard → Storage → Create Database
2. Select "KV" (Redis)
3. Link it to your project
4. Vercel will automatically add the environment variables
5. Redeploy - the code will automatically start using KV!

No code changes needed - it's already set up to use KV if available.

## Testing

After deployment, test these endpoints:

1. **Test endpoint:**
   ```
   GET https://your-project.vercel.app/api/test
   ```
   Should return: `{ status: 'ok', message: 'API is working', ... }`

2. **Leaderboard:**
   ```
   GET https://your-project.vercel.app/api/leaderboard
   ```
   Should return: `{ scores: [] }` (empty initially)

3. **Admin login:**
   ```
   POST https://your-project.vercel.app/api/admin/login
   Body: { "password": "STInumber1@novalicbes" }
   ```
   Should return: `{ token: "..." }`

## Troubleshooting

If functions still crash:

1. **Check environment variables are set:**
   - `ADMIN_PASSWORD` must be set
   - `JWT_SECRET` must be set

2. **Check Vercel logs:**
   - Dashboard → Functions → Click function → Logs
   - Look for error messages

3. **Verify Node.js version:**
   - Settings → General → Node.js Version
   - Set to `18.x` or `20.x`

4. **Test the simple endpoint first:**
   - `/api/test` should always work
   - If this fails, there's a basic setup issue

## Summary

✅ **You can deploy without KV** - it will work with in-memory storage  
✅ **Set only 2 environment variables:** `ADMIN_PASSWORD` and `JWT_SECRET`  
✅ **Add KV later** if you need persistent data  
✅ **No code changes needed** - it automatically detects KV availability

