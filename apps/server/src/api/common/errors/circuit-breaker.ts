import { TIMEOUTS } from "../constants/timeouts.constants";
import { logger } from "../logger";
import { ServiceUnavailableError } from "./server.errors";

/**
 * Circuit Breaker States
 */
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

/**
 * Circuit Breaker Configuration
 */
export type CircuitBreakerConfig = {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxAttempts: number;
};

/**
 * Circuit Breaker Implementation
 * Prevents cascading failures by stopping requests to failing services
 */
export class CircuitBreaker {
  private readonly name: string;
  private readonly config: CircuitBreakerConfig;
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;

  constructor(
    name: string,
    config: CircuitBreakerConfig = {
      failureThreshold: TIMEOUTS.CIRCUIT_BREAKER_THRESHOLD,
      resetTimeout: TIMEOUTS.CIRCUIT_BREAKER_RESET,
      monitoringPeriod: 60_000,
      halfOpenMaxAttempts: 3,
    }
  ) {
    this.name = name;
    this.config = config;
  }

  /**
   * Execute operation through circuit breaker
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.shouldAttemptReset()) {
        this.transitionTo("HALF_OPEN");
      } else {
        throw new ServiceUnavailableError(
          `Circuit breaker ${this.name} is OPEN`
        ).withContext({
          operation: this.name,
          retryable: true,
          metadata: {
            state: this.state,
            failureCount: this.failureCount,
            nextAttemptTime: this.nextAttemptTime,
          },
        });
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if we should attempt to reset the circuit
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) {
      return false;
    }
    return Date.now() >= this.nextAttemptTime;
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === "HALF_OPEN") {
      this.successCount++;

      if (this.successCount >= this.config.halfOpenMaxAttempts) {
        logger.log(`Circuit breaker ${this.name} recovered`, {
          previousState: this.state,
        });
        this.transitionTo("CLOSED");
      }
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      logger.warn(`Circuit breaker ${this.name} failed during HALF_OPEN`, {
        failureCount: this.failureCount,
      });
      this.transitionTo("OPEN");
    } else if (this.failureCount >= this.config.failureThreshold) {
      logger.error(`Circuit breaker ${this.name} tripped`, {
        failureCount: this.failureCount,
        threshold: this.config.failureThreshold,
      });
      this.transitionTo("OPEN");
    }
  }

  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === "OPEN") {
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    } else if (newState === "HALF_OPEN") {
      this.successCount = 0;
    } else if (newState === "CLOSED") {
      this.failureCount = 0;
      this.successCount = 0;
      this.nextAttemptTime = null;
    }

    logger.log(`Circuit breaker ${this.name} state changed`, {
      from: oldState,
      to: newState,
      failureCount: this.failureCount,
    });
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    logger.log(`Circuit breaker ${this.name} manually reset`);
    this.transitionTo("CLOSED");
  }
}

/**
 * Circuit breaker registry for managing multiple breakers
 */
export class CircuitBreakerRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker(name, config as CircuitBreakerConfig)
      );
    }
    const breaker = this.breakers.get(name);
    if (!breaker) {
      throw new Error(`Failed to get circuit breaker: ${name}`);
    }
    return breaker;
  }

  /**
   * Get all circuit breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  /**
   * Get health status of all breakers
   */
  getHealthStatus() {
    const status: Record<string, unknown> = {};
    for (const [name, breaker] of this.breakers) {
      status[name] = breaker.getMetrics();
    }
    return status;
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();
