# Debugging Add Score Issue

## Quick Checks

1. **Open Browser Console (F12)**
   - Go to admin page
   - Try adding a score
   - Check Console tab for any errors
   - Check Network tab to see the API request

2. **Check Vercel Function Logs**
   - Vercel Dashboard → Functions → `/api/admin/add-score`
   - Click on the function → View Logs
   - Look for error messages

3. **Verify You're Logged In**
   - Make sure you see the dashboard (not login form)
   - Check if auth token exists in localStorage

## Common Issues

### Issue 1: "Session expired" or 401 error
**Cause:** Auth token expired or invalid
**Fix:** Log out and log back in

### Issue 2: "No token provided" 
**Cause:** Token not being sent
**Fix:** Check browser console, verify login worked

### Issue 3: "Request body is required"
**Cause:** Body not being parsed correctly
**Fix:** Check Network tab to see if body is being sent

### Issue 4: Silent failure (no error shown)
**Cause:** Error handling issue
**Fix:** Check browser console for JavaScript errors

## Testing Steps

1. **Test Login First:**
   - Go to admin page
   - Login with password
   - Should see dashboard

2. **Test API Directly:**
   - Open browser console
   - Run this (replace TOKEN with your actual token):
   ```javascript
   fetch('/api/admin/add-score', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer YOUR_TOKEN_HERE'
     },
     body: JSON.stringify({ name: 'Test', wpm: 50, accuracy: 95 })
   }).then(r => r.json()).then(console.log)
   ```

3. **Check Network Request:**
   - Open DevTools → Network tab
   - Try adding score
   - Click on the `/api/admin/add-score` request
   - Check:
     - Request Method: POST
     - Request Headers: Has Authorization header
     - Request Payload: Has name, wpm, accuracy
     - Response: Check status code and body

## What to Share

If still not working, share:
1. Browser console errors (if any)
2. Network request details (status code, response)
3. Vercel function logs (from dashboard)

