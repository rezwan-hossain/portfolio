// lib/og-fonts.ts
import { readFile } from "fs/promises";
import path from "path";

// Simple in-memory cache for fonts (prevents re-fetching across requests)
const fontCache = new Map<string, ArrayBuffer>();

/**
 * Loads a Google Font as an ArrayBuffer, preferring TTF/OTF for Satori.
 * Falls back to local files if present (recommended for production).
 */
export async function loadGoogleFont(
  font: string,
  weight: number = 400,
): Promise<ArrayBuffer> {
  const cacheKey = `${font}-${weight}`;
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!;
  }

  // Try local files first (guarantees correct format)
  const localFontMap: Record<string, string> = {
    "Hind Siliguri-700": "HindSiliguri-Bold.ttf",
    "Hind Siliguri-400": "HindSiliguri-Regular.ttf",
    "Inter-700": "Inter-Bold.ttf",
    "Inter-400": "Inter-Regular.ttf",
    // Add additional fonts here as needed
  };
  const localFile = localFontMap[cacheKey];
  if (localFile) {
    try {
      const fontPath = path.join(process.cwd(), "public", "fonts", localFile);
      const buffer = await readFile(fontPath);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
      fontCache.set(cacheKey, arrayBuffer);
      return arrayBuffer;
    } catch {
      // If local missing, continue to Google Fonts fetch
    }
  }

  // Build Google Fonts URL with correct subsets
  const encodedFont = encodeURIComponent(font);
  const needsBengali = [
    "Hind Siliguri",
    "Noto Sans Bengali",
    "Baloo Da 2",
    "Tiro Bangla",
    "Noto Serif Bengali",
  ].includes(font);
  const subset = needsBengali ? "bengali,latin,latin-ext" : "latin,latin-ext";
  const url = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@${weight}&subset=${subset}&display=swap`;

  // ⚠️ Use an old Safari User-Agent to force TTF (not WOFF2)
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch font CSS: ${response.status}`);
  }

  const css = await response.text();
  const match = css.match(
    /src:\s*url\(([^)]+)\)\s*format\(['"]?(truetype|opentype)['"]?\)/,
  );

  if (!match?.[1]) {
    // Log up to 300 chars to see what Google actually returned (WOFF2, etc.)
    console.error("Font CSS received:", css.substring(0, 300));
    throw new Error(
      `No TTF/OTF font available for "${font}" (weight ${weight}). ` +
        "Google Fonts may have delivered WOFF2 due to UA. Verify the User-Agent.",
    );
  }

  const fontUrl = match[1].replace(/['"]/g, "");
  const fontResponse = await fetch(fontUrl, {
    next: { revalidate: 86400 },
  });

  if (!fontResponse.ok) {
    throw new Error(`Failed to download font: ${fontResponse.status}`);
  }

  const arrayBuffer = await fontResponse.arrayBuffer();
  fontCache.set(cacheKey, arrayBuffer);

  return arrayBuffer;
}
