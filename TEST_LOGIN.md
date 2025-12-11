# Test Login Accounts

## Available Accounts

All passwords are: `test123456`

### Admin
- Email: `admin@example.com`
- Password: `test123456`
- Role: admin

### Regular Users
- Email: `user1@example.com`
- Password: `test123456`
- Email: `user2@example.com`
- Password: `test123456`

### Demo User (with sample data)
- Email: `demo@example.com`
- Password: `test123456`
- Has: 1 restaurant, menu with categories and items

## Troubleshooting Login Issues

If login doesn't work:

1. **Check browser console** (F12) for errors
2. **Check Network tab** to see the API response
3. **Verify backend is running** on `http://localhost:3000`
4. **Check CORS** - make sure backend allows requests from frontend
5. **Verify email format** - use exact emails from above

## Debug Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check for any error messages
5. Go to Network tab
6. Find the `/api/login` request
7. Check the Response tab to see what server returned

