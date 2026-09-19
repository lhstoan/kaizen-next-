// The product mockups are raw 1920px PNGs — several are over 8 MB — and the legacy
// card CSS shows them as a CSS background, so next/image never gets a chance to
// resize them. Point the markup at the optimizer's own endpoint instead: the same
// pipeline next/image uses, with the plain <img>/background trick left intact.
export function optimizedImage(url: string, width: number, quality = 75): string {
  if (!url.startsWith("/")) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}
