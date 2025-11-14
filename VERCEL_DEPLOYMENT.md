# Vercel Deployment Guide

## Important Notes for Vercel Deployment

### 1. Environment Variables
Make sure to set these in your Vercel project settings:

```
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
NEXT_PUBLIC_SOCKET_URL=https://your-domain.vercel.app
```

### 2. Database Setup
- Use a cloud PostgreSQL database (e.g., Vercel Postgres, Supabase, Railway, or Neon)
- Update `DATABASE_URL` in Vercel environment variables
- Run migrations: `npx prisma migrate deploy` or `npx prisma db push`

### 3. File Uploads (IMPORTANT)
**Vercel's serverless functions have a read-only filesystem**, so local file uploads won't work in production.

**Options:**
1. **Use Vercel Blob Storage** (Recommended)
2. **Use Cloudinary** (Free tier available)
3. **Use AWS S3** or similar cloud storage
4. **Disable image uploads** for now (images can still be added via external URLs)

### 4. Build Command
The default build command should work:
```bash
npm run build
```

### 5. Install Command
```bash
npm install
```

### 6. Prisma Setup
Add a postinstall script to generate Prisma Client:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### 7. Socket.IO
Socket.IO real-time features may need additional configuration for serverless environments. Consider using Vercel's Edge Functions or a separate WebSocket service.

## Quick Deploy Steps

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Set up your PostgreSQL database
5. Deploy!

## Troubleshooting

- **Build fails**: Check TypeScript errors and ensure all dependencies are installed
- **Database connection fails**: Verify DATABASE_URL is correct
- **Image uploads fail**: Implement cloud storage (see above)
- **Socket.IO not working**: May need alternative solution for serverless

