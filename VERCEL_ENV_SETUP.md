# Vercel Environment Variables Setup

## Required Environment Variables

Go to your Vercel project settings → Environment Variables and add:

### 1. Database Connection
```
Database_DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```
**OR** if you want to use standard `DATABASE_URL`:
```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```

**Important:** Your Prisma schema uses `Database_DATABASE_URL`, so make sure this matches!

### 2. NextAuth Configuration
```
NEXTAUTH_URL=https://blogs-henna-eight.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Email Configuration (Optional but recommended)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. Socket.IO (Optional)
```
NEXT_PUBLIC_SOCKET_URL=https://blogs-henna-eight.vercel.app
```

## Common Login Issues

### Issue 1: "Invalid credentials" but credentials are correct
**Solution:** Check if:
- Database is connected and accessible
- User exists in database
- `NEXTAUTH_SECRET` is set
- `NEXTAUTH_URL` matches your deployment URL exactly

### Issue 2: Database connection error
**Solution:**
- Verify `Database_DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Ensure database is running and accessible

### Issue 3: Session not persisting
**Solution:**
- Verify `NEXTAUTH_SECRET` is set
- Check browser console for errors
- Clear browser cookies and try again

## Testing Steps

1. **Check API endpoint:**
   Visit: `https://blogs-henna-eight.vercel.app/api/auth/providers`
   Should return available providers

2. **Check database:**
   - Verify database is accessible
   - Check if users table exists
   - Verify user credentials

3. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

## Quick Fix Checklist

- [ ] `Database_DATABASE_URL` is set in Vercel
- [ ] `NEXTAUTH_URL` is set to `https://blogs-henna-eight.vercel.app`
- [ ] `NEXTAUTH_SECRET` is set (generate new one if unsure)
- [ ] Database is accessible from Vercel
- [ ] User exists in database
- [ ] Redeploy after setting environment variables

## After Setting Environment Variables

**IMPORTANT:** You must redeploy after adding/changing environment variables!

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click "..." on latest deployment
5. Click "Redeploy"

Or push a new commit to trigger automatic redeploy.

