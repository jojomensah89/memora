import { PrismaClient } from "../prisma/generated/client.js";

const prisma = new PrismaClient();

// Export prisma instance as default
export default prisma;

// Export Prisma types and client from package
export * from "../prisma/generated/client.js";
