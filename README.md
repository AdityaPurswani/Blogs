# Blog Website

A fully scalable blog website built with Next.js, featuring authentication, CRUD operations, comments, likes, real-time chat, and email notifications.

## Features

- ✅ **Authentication**: User registration and login with NextAuth.js
- ✅ **Blog Management**: Create, read, update, and delete blog posts
- ✅ **Comments**: Users can comment on blog posts
- ✅ **Likes**: Users can like/unlike blog posts
- ✅ **Email Notifications**: Receive email notifications when someone likes your blog
- ✅ **Real-time Chat**: Socket.IO powered chat room
- ✅ **Containerization**: Docker and Docker Compose setup for easy deployment
- ✅ **Scalable Architecture**: Built with Next.js API routes and PostgreSQL

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Containerization**: Docker, Docker Compose

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (for containerized setup)
- PostgreSQL (if not using Docker)
- SMTP credentials for email notifications

## Getting Started

### Option 1: Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Blog_website
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Add your SMTP credentials for email notifications
   - Adjust database credentials if needed

4. Start the application with Docker Compose:
```bash
docker-compose up -d
```

5. The application will be available at `http://localhost:3000`

### Option 2: Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
   - Make sure PostgreSQL is running
   - Update `DATABASE_URL` in `.env`
   - Run migrations:
```bash
npx prisma generate
npx prisma db push
```

3. Start the development server:
```bash
npm run dev
```

4. The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blogdb?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Blogs
- `GET /api/blogs` - Get all blogs (with pagination)
- `POST /api/blogs` - Create a new blog (authenticated)
- `GET /api/blogs/[slug]` - Get a specific blog
- `PUT /api/blogs/[slug]` - Update a blog (authenticated, owner only)
- `DELETE /api/blogs/[slug]` - Delete a blog (authenticated, owner only)

### Comments
- `GET /api/blogs/[slug]/comments` - Get comments for a blog
- `POST /api/blogs/[slug]/comments` - Add a comment (authenticated)
- `PUT /api/comments/[id]` - Update a comment (authenticated, owner only)
- `DELETE /api/comments/[id]` - Delete a comment (authenticated, owner only)

### Likes
- `GET /api/blogs/[slug]/likes` - Get likes for a blog
- `POST /api/blogs/[slug]/likes` - Toggle like (authenticated)

### Chat
- `GET /api/chat` - Get chat messages
- `POST /api/chat` - Send a chat message (authenticated)

## Project Structure

```
Blog_website/
├── components/          # React components
├── lib/                # Utility functions and configurations
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── auth/          # Authentication pages
│   └── blog/          # Blog pages
├── prisma/            # Prisma schema and migrations
├── styles/            # Global styles
├── types/             # TypeScript type definitions
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
└── package.json       # Dependencies
```

## Database Schema

The application uses PostgreSQL with the following main models:
- **User**: User accounts and authentication
- **Blog**: Blog posts
- **Comment**: Comments on blog posts
- **Like**: Likes on blog posts
- **ChatMessage**: Chat messages
- **Account/Session**: NextAuth session management

## Email Notifications

When someone likes your blog post, you'll receive an email notification. Configure your SMTP settings in the `.env` file.

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASSWORD`

## Deployment

### Docker Deployment

1. Build and push your Docker image to a registry
2. Deploy using Docker Compose or Kubernetes
3. Ensure environment variables are set correctly

### Vercel/Netlify Deployment

1. Set up a PostgreSQL database (e.g., Supabase, Railway)
2. Configure environment variables in your hosting platform
3. Deploy the Next.js application
4. Run database migrations after deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

