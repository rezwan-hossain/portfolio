// lib/imageCdn.ts

// Falls back to the production domain so server-side rendering still works
// if the env var is somehow missing during a build.
export const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_URL || "https://assets.merchcommunication.com";

/**
 * Turn a stored DB value into something you can put in <img src={...}>.
 *
 * Handles all three cases:
 *   "uploads/2026/08/abc.webp"        → "https://assets.../uploads/2026/08/abc.webp"
 *   "https://xyz.supabase.co/..."     → unchanged (legacy rows during migration)
 *   "https://example.com/pic.jpg"     → unchanged (user pasted a URL)
 */
export function toSrc(value: string): string {
  if (!value) return "";

  // Already absolute (http://, https://, or protocol-relative //) or a data URI.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;

  // Relative path — prepend the CDN base.
  // The replace strips any leading slash so we never produce a double slash.
  return `${CDN_BASE}/${value.replace(/^\/+/, "")}`;
}

/**
 * Do we own this file, i.e. is it safe to DELETE?
 *
 * Critical guard: without it, clicking "Remove" on a pasted third-party URL
 * would fire a delete request for a file that was never ours.
 */
export function isOwned(value: string): boolean {
  if (!value) return false;

  // Relative path means we wrote it ourselves.
  if (!/^https?:\/\//i.test(value)) return true;

  // Absolute URL is only ours if it points at our own CDN domain.
  return value.startsWith(CDN_BASE);
}

/**
 * Convert an owned value (relative OR absolute) back to the relative path
 * that the DELETE endpoint expects.
 */
// export function toRelPath(value: string): string {
//   if (value.startsWith(CDN_BASE)) {
//     return value.slice(CDN_BASE.length).replace(/^\/+/, "");
//   }
//   return value.replace(/^\/+/, "");
// }

export function toRelPath(value: string): string {
  return value.startsWith(CDN_BASE)
    ? value.slice(CDN_BASE.length).replace(/^\/+/, "")
    : value.replace(/^\/+/, "");
}
