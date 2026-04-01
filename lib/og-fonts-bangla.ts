// lib/og-fonts.ts
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Load font from local public/fonts directory
 * Most reliable for non-Latin scripts (Bangla, Hindi, Arabic, etc.)
 */
export async function loadLocalFont(filename: string): Promise<ArrayBuffer> {
  const fontPath = join(process.cwd(), "public", "fonts", filename);
  const buffer = await readFile(fontPath);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

/**
 * Load font from Google Fonts API
 * Works well for Latin scripts (Inter, Bebas Neue, etc.)
 */
export async function loadGoogleFont(
  font: string,
  weight: number,
): Promise<ArrayBuffer> {
  const API = `https://fonts.googleapis.com/css2?family=${font.replace(
    / /g,
    "+",
  )}:wght@${weight}&display=swap`;

  const css = await fetch(API, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) " +
        "AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((res) => res.text());

  // Try multiple patterns
  const patterns = [
    /src: url\((.+?)\) format\('truetype'\)/,
    /src: url\((.+?)\) format\('woff'\)/,
    /src: url\((.+?)\) format\('opentype'\)/,
    /src: url\((.+?)\) format\('woff2'\)/,
    /url\((https:\/\/fonts\.gstatic\.com\/s\/.+?)\)/,
  ];

  for (const pattern of patterns) {
    const match = css.match(pattern);
    if (match) {
      return fetch(match[1]).then((res) => res.arrayBuffer());
    }
  }

  throw new Error(`Failed to load Google Font: ${font} @ ${weight}`);
}
