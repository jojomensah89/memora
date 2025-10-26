import type { Context } from "hono";
import { circuitBreakerRegistry } from "../common/errors/circuit-breaker";
import { logger } from "../common/logger";

/**
 * Health Status Types
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export type HealthCheck = {
  status: HealthStatus;
  latency?: number;
  error?: string;
  lastChecked: string;
};

export type HealthCheckResult = {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  checks: {
    database?: HealthCheck;
    storage?: HealthCheck;
    aiProvider?: HealthCheck;
    circuitBreakers?: Record<string, unknown>;
  };
};

/**
 * Database health check
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const prisma = (await import("@memora/db")).default;
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "healthy",
      latency: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Database health check failed", error);
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Storage health check (placeholder - implement based on your storage solution)
 */
async function checkStorage(): Promise<HealthCheck> {
  try {
    return {
      status: "healthy",
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Storage health check failed", error);
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * AI Provider health check (placeholder - implement based on your AI provider)
 */
async function checkAIProvider(): Promise<HealthCheck> {
  try {
    return {
      status: "healthy",
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("AI Provider health check failed", error);
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(
  checks: HealthCheckResult["checks"]
): HealthStatus {
  const statuses = Object.values(checks)
    .filter(
      (check): check is HealthCheck =>
        typeof check === "object" && "status" in check
    )
    .map((check) => check.status);

  if (statuses.some((s) => s === "unhealthy")) {
    return "unhealthy";
  }
  if (statuses.some((s) => s === "degraded")) {
    return "degraded";
  }
  return "healthy";
}

/**
 * Health check endpoint handler
 */
export async function healthCheckHandler(c: Context) {
  const checks: HealthCheckResult["checks"] = {};

  const [database, storage, aiProvider] = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkAIProvider(),
  ]);

  checks.database = database;
  checks.storage = storage;
  checks.aiProvider = aiProvider;
  checks.circuitBreakers = circuitBreakerRegistry.getHealthStatus();

  const result: HealthCheckResult = {
    status: determineOverallStatus(checks),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };

  let statusCode = 503;
  if (result.status === "healthy" || result.status === "degraded") {
    statusCode = 200;
  }

  return c.json(result, statusCode as never);
}

/**
 * Liveness probe - simple check that server is running
 */
export function livenessProbe(c: Context) {
  return c.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Readiness probe - check if server is ready to accept traffic
 */
export async function readinessProbe(c: Context) {
  try {
    const dbCheck = await checkDatabase();

    if (dbCheck.status === "unhealthy") {
      return c.json(
        {
          status: "not ready",
          reason: "Database unavailable",
          timestamp: new Date().toISOString(),
        },
        503
      );
    }

    return c.json({
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        status: "not ready",
        reason: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
}
