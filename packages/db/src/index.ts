import { PrismaClient, Prisma } from "../prisma/generated/client";

const prisma = new PrismaClient();

// Export prisma instance as default
export default prisma;

// Export Prisma namespace for types and error classes
export { Prisma };

// Re-export PrismaClient for type usage
export { PrismaClient };
