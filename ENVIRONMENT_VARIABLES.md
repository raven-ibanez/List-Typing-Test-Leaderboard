# Environment Variables for Vercel

Here's exactly what to input for each environment variable in Vercel:

## Required Environment Variables

### 1. `ADMIN_PASSWORD`
**What it is:** Your admin login password

**What to input:**
```
STInumber1@novalicbes
```

**How to set it:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Click "Add New"
- **Key:** `ADMIN_PASSWORD`
- **Value:** `STInumber1@novalicbes`
- Select all environments (Production, Preview, Development)
- Click "Save"

---

### 2. `JWT_SECRET`
**What it is:** A secret key used to sign and verify JWT tokens for admin authentication

**What to input:** Any long, random, secure string

**Example values:**
```
my-super-secret-jwt-key-2024-typing-leaderboard
```

Or generate a secure random string:
```bash
# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use an online generator like: https://randomkeygen.com/
```

**Recommended:** Use a string that's at least 32 characters long

**How to set it:**
- **Key:** `JWT_SECRET`
- **Value:** `your-random-secret-key-here` (use your generated value)
- Select all environments
- Click "Save"

---

## Optional Environment Variables

### 3. `ADMIN_PASSWORD_HASH` (Optional)
**What it is:** A bcrypt hash of your password (more secure than plain text)

**When to use:** If you want extra security instead of plain text password

**What to input:**
1. First, generate the hash locally:
   ```bash
   npm run generate-password
   ```
2. Enter your password: `STInumber1@novalicbes`
3. Copy the generated hash (it will look like: `$2a$10$...`)
4. Use that hash as the value

**Example:**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**Note:** If you set `ADMIN_PASSWORD_HASH`, the system will use it instead of `ADMIN_PASSWORD`

**How to set it:**
- **Key:** `ADMIN_PASSWORD_HASH`
- **Value:** (the bcrypt hash from step 3 above)
- Select all environments
- Click "Save"

---

## Quick Setup Summary

**Minimum required (easiest setup):**
1. `ADMIN_PASSWORD` = `STInumber1@novalicbes`
2. `JWT_SECRET` = `your-random-secret-key-here`

**Recommended (more secure):**
1. `ADMIN_PASSWORD` = `STInumber1@novalicbes` (or remove if using hash)
2. `ADMIN_PASSWORD_HASH` = (generated bcrypt hash)
3. `JWT_SECRET` = (long random string)

---

## Step-by-Step in Vercel Dashboard

1. **Go to your project** on vercel.com
2. Click **Settings** (top menu)
3. Click **Environment Variables** (left sidebar)
4. Click **Add New** button
5. Fill in:
   - **Key:** `ADMIN_PASSWORD`
   - **Value:** `STInumber1@novalicbes`
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**
7. Repeat for `JWT_SECRET` with your random secret key

---

## After Setting Variables

**Important:** After adding/changing environment variables, you need to **redeploy**:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

---

## Testing

After deployment, test your admin login:
- Go to: `https://your-project.vercel.app/admin.html`
- Enter password: `STInumber1@novalicbes`
- Should login successfully!

---

## Security Tips

✅ **DO:**
- Use a strong, unique `JWT_SECRET` (at least 32 characters)
- Use `ADMIN_PASSWORD_HASH` for production
- Keep your environment variables secret
- Don't commit `.env` files to Git

❌ **DON'T:**
- Use simple passwords like "password123"
- Share your `JWT_SECRET` publicly
- Use the default `JWT_SECRET` in production
- Commit environment variables to your code

