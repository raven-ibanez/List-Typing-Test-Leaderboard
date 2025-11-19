# Why Scores Aren't Showing on Leaderboard

## The Problem

**Without Vercel KV, your data is stored in memory**, and Vercel serverless functions are **stateless**. This means:

- Each function invocation might use a **different server instance**
- Data stored in one instance **isn't available** to other instances
- When you add a score, it's saved in one function's memory
- When you view the leaderboard, it's read from a **different function's memory** (which is empty)

## The Solution: Set Up Vercel KV

You **must** set up Vercel KV for data to persist and be shared across all function invocations.

### Quick Setup (5 minutes):

1. **Go to Vercel Dashboard**
   - Open your project: `list-typing-test-leaderboard`

2. **Create KV Database**
   - Click **"Storage"** tab (left sidebar)
   - Click **"Create Database"**
   - Select **"KV"** (Redis)
   - Give it a name (e.g., "leaderboard-db")
   - Click **"Create"**

3. **Link to Project**
   - Vercel will automatically link it to your project
   - Environment variables will be auto-added:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

4. **Redeploy**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on latest deployment
   - Click **"Redeploy"**

5. **Test Again**
   - Add a score via admin dashboard
   - Check the leaderboard - it should now show!

## Why This Happens

```
Without KV:
┌─────────────┐         ┌─────────────┐
│ Function 1  │         │ Function 2  │
│ (add-score) │         │ (leaderboard)│
│             │         │             │
│ memoryStore │    ❌    │ memoryStore │
│ = {scores:  │  NO     │ = {scores:  │
│   [new]}    │  SHARE  │   []}       │
└─────────────┘         └─────────────┘

With KV:
┌─────────────┐         ┌─────────────┐
│ Function 1  │         │ Function 2  │
│ (add-score) │         │ (leaderboard)│
│             │         │             │
│   writes    │    ✅    │   reads     │
│      ↓      │  SHARED  │      ↓      │
│   ┌─────┐   │  STORAGE │   ┌─────┐   │
│   │ KV  │   │          │   │ KV  │   │
│   │ DB  │   │          │   │ DB  │   │
│   └─────┘   │          │   └─────┘   │
└─────────────┘         └─────────────┘
```

## Alternative: Use External Database

If you don't want to use Vercel KV, you can use:
- **MongoDB Atlas** (free tier)
- **Supabase** (PostgreSQL, free tier)
- **PlanetScale** (MySQL, free tier)

But Vercel KV is the easiest and fastest to set up!

## Check Current Status

After setting up KV, check the logs:
1. Vercel Dashboard → Functions → `/api/admin/add-score`
2. Look for: `"Data saved to Vercel KV"` ✅
3. If you see: `"⚠️ WARNING: Using in-memory storage"` ❌
   - KV is not set up correctly

## Summary

- ✅ **Set up Vercel KV** (5 minutes)
- ✅ **Redeploy** your project
- ✅ **Add a score** - it will now persist!
- ✅ **View leaderboard** - scores will show!

The code is already set up to use KV automatically once you create the database!

