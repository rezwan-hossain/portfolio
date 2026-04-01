// lib/og-fonts.ts
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
      // This User-Agent ensures Google returns .ttf/.woff
      // compatible with @vercel/og (Satori)
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) " +
        "AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((res) => res.text());

  // Match .ttf, .woff, or .otf formats
  const match = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype|woff2?)'\)/,
  );

  if (!match) {
    throw new Error(`Failed to load Google Font: ${font} @ ${weight}`);
  }

  return fetch(match[1]).then((res) => res.arrayBuffer());
}
