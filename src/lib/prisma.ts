let prisma: any

if (process.env.NODE_ENV === 'production') {
  prisma = null
} else {
  const { PrismaClient } = require('@/generated/prisma')
  const globalForPrisma = globalThis as unknown as {
    prisma: any
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['error'],
    })
  }
  prisma = globalForPrisma.prisma
}

export { prisma }