# Typing Test Leaderboard

A full-stack leaderboard website for typing test scores with real-time rank updates and an admin dashboard.

## Features

- 🏆 **Public Leaderboard**: View top players with auto-refresh every 5 seconds
- 🔍 **Rank Checker**: Players can search for their name to see their current rank
- 🔐 **Admin Dashboard**: Password-protected admin panel to add and manage scores
- 📊 **Real-time Updates**: Leaderboard automatically refreshes to show latest rankings
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Website**
   - Public Leaderboard: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin.html

4. **Default Admin Password**
   - Password: `admin123`
   - ⚠️ **Important**: Change this in production! (See "Changing Admin Password" below)

## How to Use

### For Players:
1. Visit the main page to see the leaderboard
2. Enter your name in the search box to check your rank
3. The leaderboard auto-refreshes every 5 seconds

### For Admins:
1. Go to the Admin Dashboard
2. Login with the password
3. Add new scores by entering:
   - Player Name
   - Words Per Minute (WPM)
   - Accuracy (%)
4. View and delete existing scores

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Data Storage**: JSON file (can be upgraded to a database)

## Changing Admin Password

You have **3 options** to change the admin password:

### Option 1: Generate Secure Hash (Recommended)
1. Run the password generator:
   ```bash
   npm run generate-password
   ```
2. Enter your new password when prompted
3. Copy the generated hash
4. Set it as an environment variable before starting the server:
   ```bash
   # Windows PowerShell
   $env:ADMIN_PASSWORD_HASH="your-hash-here"
   npm start
   
   # Windows CMD
   set ADMIN_PASSWORD_HASH=your-hash-here
   npm start
   
   # Linux/Mac
   export ADMIN_PASSWORD_HASH="your-hash-here"
   npm start
   ```

### Option 2: Use Plain Text Password (Quick Setup)
Set the `ADMIN_PASSWORD` environment variable:
```bash
# Windows PowerShell
$env:ADMIN_PASSWORD="your-new-password"
npm start

# Windows CMD
set ADMIN_PASSWORD=your-new-password
npm start

# Linux/Mac
export ADMIN_PASSWORD="your-new-password"
npm start
```

### Option 3: Edit server.js Directly
1. Open `server.js`
2. Find the line: `const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD || 'admin123';`
3. Change `'admin123'` to your desired password
4. Restart the server

**Note**: For production, always use Option 1 (bcrypt hash) for better security!

## Security Notes

- The default admin password is `admin123` - **change this in production!**
- Update the `JWT_SECRET` in `server.js` or via `JWT_SECRET` environment variable
- Use environment variables for sensitive data (recommended)
- For production, use a proper database (PostgreSQL, MongoDB, etc.)

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User registration and login
- Multiple typing test modes
- Historical score tracking
- Email notifications for rank changes

# List-Typing-Test-Leaderboard
