import { ValidationError } from "../errors";

/**
 * URL Validation Utilities
 */

const ALLOWED_PROTOCOLS = ["http:", "https:"];
const BLOCKED_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0"];

/**
 * Validate URL format and safety
 */
export function validateUrl(urlString: string): URL {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    throw new ValidationError("Invalid URL format");
  }

  // Check protocol
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    throw new ValidationError(
      `Protocol ${url.protocol} not allowed. Use http: or https:`
    );
  }

  // Check for blocked domains (prevent SSRF)
  if (BLOCKED_DOMAINS.includes(url.hostname)) {
    throw new ValidationError("Cannot fetch from localhost");
  }

  // Check for private IP ranges
  if (isPrivateIP(url.hostname)) {
    throw new ValidationError("Cannot fetch from private IP addresses");
  }

  return url;
}

/**
 * Check if hostname is a private IP
 */
function isPrivateIP(hostname: string): boolean {
  // Check for IPv4 private ranges
  const privateIPv4Regex =
    /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)/;

  return privateIPv4Regex.test(hostname);
}

/**
 * Validate GitHub URL
 */
export function validateGitHubUrl(urlString: string): {
  owner: string;
  repo: string;
  branch?: string;
} {
  const url = validateUrl(urlString);

  if (!url.hostname.includes("github.com")) {
    throw new ValidationError("URL must be from github.com");
  }

  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length < 2) {
    throw new ValidationError("Invalid GitHub repository URL");
  }

  const [owner, repo] = pathParts;

  return {
    owner,
    repo: repo.replace(".git", ""),
    branch: pathParts[3] === "tree" ? pathParts[4] : undefined,
  };
}

/**
 * Sanitize URL for display
 */
export function sanitizeUrlForDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}
