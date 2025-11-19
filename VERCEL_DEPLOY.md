# Deploying to Vercel

This guide will help you deploy your Typing Test Leaderboard to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed (optional, but recommended):
   ```bash
   npm i -g vercel
   ```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin <your-github-repo-url>
     git push -u origin main
     ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect the settings

3. **Configure Environment Variables**
   - In the Vercel project settings, go to "Environment Variables"
   - Add the following:
     - `ADMIN_PASSWORD`: Your admin password (e.g., `STInumber1@novalicbes`)
     - `JWT_SECRET`: A secure random string for JWT signing
     - (Optional) `ADMIN_PASSWORD_HASH`: A bcrypt hash if you prefer hashed passwords

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production deployment, run: `vercel --prod`

4. **Set Environment Variables**:
   ```bash
   vercel env add ADMIN_PASSWORD
   vercel env add JWT_SECRET
   ```
   - Enter values when prompted
   - Redeploy after adding environment variables: `vercel --prod`

## Important: Data Storage

⚠️ **Vercel's file system is read-only**, so the default JSON file storage won't persist data. You have two options:

### Option A: Use Vercel KV (Recommended)

1. **Create a Vercel KV Database**:
   - Go to your Vercel project dashboard
   - Navigate to "Storage" → "Create Database"
   - Select "KV" (Redis)
   - Create the database

2. **Link to your project**:
   - The KV database will be automatically linked
   - Environment variables will be auto-configured

3. **The code is already set up** to use Vercel KV if available!

### Option B: Use External Database

For production, consider using:
- **MongoDB Atlas** (free tier available)
- **Supabase** (PostgreSQL, free tier)
- **PlanetScale** (MySQL, free tier)

You'll need to update `api/utils.js` to use your database instead of file storage.

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Admin login password | `STInumber1@novalicbes` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-random-secret-key` |
| `ADMIN_PASSWORD_HASH` | (Optional) Bcrypt hash of password | Generated via `npm run generate-password` |

## Testing Your Deployment

1. Visit your deployed URL: `https://your-project.vercel.app`
2. Test the leaderboard page
3. Test admin login at: `https://your-project.vercel.app/admin.html`
4. Try adding a score

## Troubleshooting

### Data Not Persisting
- Make sure you've set up Vercel KV or an external database
- Check that environment variables are set correctly

### API Routes Not Working
- Check Vercel function logs in the dashboard
- Verify `vercel.json` configuration is correct
- Ensure API routes are in the `/api` directory

### CORS Issues
- The API functions already include CORS headers
- If issues persist, check browser console for specific errors

## Updating Your Deployment

After making changes:

1. **Via CLI**:
   ```bash
   git add .
   git commit -m "Update"
   git push
   vercel --prod
   ```

2. **Via GitHub**:
   - Push changes to GitHub
   - Vercel will automatically redeploy (if auto-deploy is enabled)

## Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- Check function logs in Vercel Dashboard → Functions

