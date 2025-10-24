/**
 * Prisma Error Codes Reference
 * Complete mapping of all Prisma error codes to their descriptions
 */

export const PRISMA_ERROR_CODES = {
  // Connection Errors (P1xxx) - Infrastructure level
  P1000: "Authentication failed at database server",
  P1001: "Can't reach database server",
  P1002: "Database server connection timeout",
  P1003: "Database does not exist",
  P1008: "Operations timed out",
  P1009: "Database already exists",
  P1010: "User was denied access on the database",
  P1011: "Error opening a TLS connection",
  P1012: "Schema validation error",
  P1013: "Invalid database string provided",
  P1014: "The underlying model for this operation does not exist",
  P1015: "Your Prisma schema is using features that are not supported",
  P1016: "Incorrect number of parameters in raw query",
  P1017: "Server has closed the connection",

  // Query Engine Errors (P2xxx) - Query/Data level
  P2000: "The provided value for the column is too long",
  P2001: "The record searched for does not exist",
  P2002: "Unique constraint failed",
  P2003: "Foreign key constraint failed",
  P2004: "A constraint failed on the database",
  P2005: "The value stored in the database is invalid for the field's type",
  P2006: "The provided value is not valid",
  P2007: "Data validation error",
  P2008: "Failed to parse the query",
  P2009: "Failed to validate the query",
  P2010: "Raw query failed",
  P2011: "Null constraint violation",
  P2012: "Missing a required value",
  P2013: "Missing the required argument",
  P2014:
    "The change you are trying to make would violate the required relation",
  P2015: "A related record could not be found",
  P2016: "Query interpretation error",
  P2017: "The records for relation are not connected",
  P2018: "The required connected records were not found",
  P2019: "Input error",
  P2020: "Value out of range for the type",
  P2021: "The table does not exist in the current database",
  P2022: "The column does not exist in the current database",
  P2023: "Inconsistent column data",
  P2024: "Timed out fetching a new connection from the connection pool",
  P2025:
    "An operation failed because it depends on one or more records that were required but not found",
  P2026: "The current database provider doesn't support a feature",
  P2027: "Multiple errors occurred on the database during query execution",
  P2028: "Transaction API error",
  P2030: "Cannot find a fulltext index to use for the search",
  P2033: "A number used in the query does not fit into a 64 bit signed integer",
  P2034: "Transaction failed due to a write conflict or a deadlock",
} as const;

/**
 * Categorize errors by their retry behavior
 */
export const RETRYABLE_ERROR_CODES = [
  "P1001", // Can't reach database
  "P1002", // Database timeout
  "P1008", // Operations timeout
  "P1017", // Server closed connection
  "P2024", // Connection pool timeout
  "P2034", // Transaction conflict/deadlock
] as const;

export const CONNECTION_ERROR_CODES = [
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1008",
  "P1009",
  "P1010",
  "P1011",
  "P1017",
] as const;

export const VALIDATION_ERROR_CODES = [
  "P2000",
  "P2003",
  "P2004",
  "P2005",
  "P2006",
  "P2007",
  "P2011",
  "P2012",
  "P2013",
  "P2014",
  "P2016",
  "P2019",
  "P2020",
  "P2033",
] as const;

export const NOT_FOUND_ERROR_CODES = [
  "P2001",
  "P2015",
  "P2018",
  "P2025",
] as const;

export const CONFLICT_ERROR_CODES = ["P2002", "P2009", "P2034"] as const;

export const DATABASE_ERROR_CODES = [
  "P1012",
  "P1013",
  "P1014",
  "P2010",
  "P2021",
  "P2022",
  "P2023",
  "P2027",
  "P2028",
  "P2030",
] as const;

/**
 * Type guard to check if error code is retryable
 */
export function isRetryableErrorCode(code: string): boolean {
  return (RETRYABLE_ERROR_CODES as readonly string[]).includes(code);
}

/**
 * Get human-readable description for error code
 */
export function getErrorDescription(code: string): string | undefined {
  return PRISMA_ERROR_CODES[code as keyof typeof PRISMA_ERROR_CODES];
}
