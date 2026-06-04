export function hdArtworkUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/\/\d+x\d+bb\.jpg$/i, "/1000x1000bb.jpg");
}

export function releaseYear(date?: string): string | undefined {
  if (!date) return undefined;
  return new Date(date).getFullYear().toString();
}
