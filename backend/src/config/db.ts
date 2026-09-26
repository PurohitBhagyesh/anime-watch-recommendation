import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaClientSingleton: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaClientSingleton ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClientSingleton = prisma;
}

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Connected to SQLite database via Prisma');
  } catch (err) {
    console.error('⚠️ Database connection warning:', err);
  }
}
