# Debugging Login Issues on Vercel

## Quick Diagnostic Steps

### 1. Check Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Required variables:**
- `Database_DATABASE_URL` (or `DATABASE_URL`)
- `NEXTAUTH_URL=https://blogs-henna-eight.vercel.app`
- `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)

### 2. Test API Endpoint

Visit: `https://blogs-henna-eight.vercel.app/api/auth/providers`

**Expected:** JSON with available providers
**If error:** Check Vercel function logs

### 3. Check Browser Console

1. Open your site: https://blogs-henna-eight.vercel.app/auth/signin
2. Press F12 to open DevTools
3. Go to Console tab
4. Try to login
5. Check for any error messages

### 4. Check Network Tab

1. In DevTools, go to Network tab
2. Try to login
3. Look for `/api/auth/callback/credentials` request
4. Check the response - it should show the error

### 5. Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions" tab
4. Click on `/api/auth/[...nextauth]`
5. Check logs for errors

## Common Error Messages

### "Invalid credentials"
- User doesn't exist in database
- Password is incorrect
- Database connection issue

### "CredentialsSignin"
- NextAuth couldn't authenticate
- Check database connection
- Check if user exists

### Database connection errors
- `Database_DATABASE_URL` not set
- Database not accessible from Vercel
- Wrong database credentials

## Testing Database Connection

Create a test API route to check database:

```typescript
// pages/api/test-db.ts
import { prisma } from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const userCount = await prisma.user.count()
    res.status(200).json({ 
      success: true, 
      userCount,
      databaseUrl: process.env.Database_DATABASE_URL ? 'Set' : 'Not set'
    })
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      databaseUrl: process.env.Database_DATABASE_URL ? 'Set' : 'Not set'
    })
  }
}
```

Visit: `https://blogs-henna-eight.vercel.app/api/test-db`

## Solution Checklist

- [ ] Environment variables are set in Vercel
- [ ] Redeployed after setting environment variables
- [ ] Database is accessible from Vercel
- [ ] User exists in database
- [ ] `NEXTAUTH_SECRET` is set
- [ ] `NEXTAUTH_URL` matches deployment URL exactly
- [ ] Checked browser console for errors
- [ ] Checked Vercel function logs

