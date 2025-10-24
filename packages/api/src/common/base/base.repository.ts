import prisma from "@memora/db";
import type { PrismaClient } from "@prisma/client";

/**
 * Base Repository
 * Provides common database operations and error handling
 */
export abstract class BaseRepository<T = unknown> {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Wrap database operations with error handling
   */
  protected async execute<R>(operation: () => Promise<R>): Promise<R> {
      return await operation();
  }

  /**
   * Common method: Find by ID
   */
  protected async findById(
    model: keyof PrismaClient,
    id: string
  ): Promise<T | null> {
    return this.execute(async () => {
      const repository = this.prisma[model] as any;
      return (await repository.findUnique({
        where: { id },
      })) as T | null;
    });
  }

  /**
   * Common method: Check existence
   */
  
// biome-ignore lint/suspicious/useAwait: <explanation>
protected  async exists(
    model: keyof PrismaClient,
    id: string
  ): Promise<boolean> {
    return this.execute(async () => {
      const repository = this.prisma[model] as any;
      const count = await repository.count({
        where: { id },
      });
      return count > 0;
    });
  }
}
