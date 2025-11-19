import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if database URL is set
const databaseUrl = process.env.Database_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('⚠️  Database URL not found! Please set Database_DATABASE_URL or DATABASE_URL environment variable.')
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

