import { PrismaClient } from '@prisma/client'

if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('./prisma/dev.db') || process.env.DATABASE_URL.includes('file:./prisma/dev.db'))) {
  process.env.DATABASE_URL = 'file:./dev.db'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
