import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();

// Export prisma instance as default
export default prisma;

// Export Prisma types and client from package
export { Prisma, PrismaClient } from "../prisma/generated/client";
