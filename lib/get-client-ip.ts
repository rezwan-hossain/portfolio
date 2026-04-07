// lib/get-client-ip.ts

import { headers } from "next/headers";

/**
 * Converts IPv6 to IPv4 when possible
 */
function convertIpv6ToIpv4(ip: string): string {
  const trimmedIp = ip.trim();

  // IPv4-mapped IPv6: ::ffff:192.168.1.1
  const ipv4MappedRegex = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i;
  const match = trimmedIp.match(ipv4MappedRegex);
  if (match) return match[1];

  // Compressed format: ::192.168.1.1
  const compressedRegex = /^::(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;
  const compressedMatch = trimmedIp.match(compressedRegex);
  if (compressedMatch) return compressedMatch[1];

  return trimmedIp;
}

/**
 * Validates IPv4 format
 */
function isValidIpv4(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip.trim());
}

/**
 * Validates IPv6 format
 */
function isValidIpv6(ip: string): boolean {
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip.trim());
}

/**
 * Checks if IP is private/local
 */
function isPrivateIp(ip: string): boolean {
  const privatePatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^0\.0\.0\.0$/,
    /^169\.254\./,
    /^::1$/,
    /^fe80:/i,
    /^fc00:/i,
    /^fd00:/i,
  ];
  return privatePatterns.some((pattern) => pattern.test(ip.trim()));
}

/**
 * Process and validate IP
 */
function processIp(ip: string, allowPrivate: boolean): string | null {
  if (!ip?.trim()) return null;

  const convertedIp = convertIpv6ToIpv4(ip.trim());
  const isValid = isValidIpv4(convertedIp) || isValidIpv6(convertedIp);

  if (!isValid) return null;
  if (!allowPrivate && isPrivateIp(convertedIp)) return null;

  return convertedIp;
}

/**
 * Get client IP from headers (Server Actions & Server Components)
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const allowPrivate = process.env.NODE_ENV === "development";

  const headersToCheck = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-vercel-forwarded-for",
    "x-client-ip",
    "true-client-ip",
  ];

  for (const headerName of headersToCheck) {
    const headerValue = headersList.get(headerName);

    if (headerValue) {
      const ips = headerValue.split(",").map((ip) => ip.trim());

      for (const ip of ips) {
        const processedIp = processIp(ip, allowPrivate);
        if (processedIp) {
          console.log(`[IP] ✓ ${headerName}: ${processedIp}`);
          return processedIp;
        }
      }
    }
  }

  // No valid IP found
  if (process.env.NODE_ENV === "production") {
    console.error("[IP] ✗ No valid client IP found");
    throw new Error("Unable to determine client IP");
  }

  console.warn("[IP] Using fallback: 127.0.0.1");
  return "127.0.0.1";
}
