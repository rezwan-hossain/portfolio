function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  baseUrl: requireEnv("SHURJOPAY_API_URL"),
  username: requireEnv("SHURJOPAY_USERNAME"),
  password: requireEnv("SHURJOPAY_PASSWORD"),
  callbackUrl: requireEnv("SHURJOPAY_CALLBACK_URL"),
  prefix: process.env.SHURJOPAY_PREFIX ?? "RRN",
} as const;
