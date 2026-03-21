export function extractGoogleDriveFileId(url: string | null | undefined): string | null {
  if (!url) return null;
  const input = url.trim();
  if (!input) return null;
  try {
    const u = new URL(input);
    const host = u.hostname.toLowerCase();
    if (!host.includes('drive.google.com')) return null;

    const byPath = u.pathname.match(/\/file\/d\/([^/]+)/i);
    if (byPath?.[1]) return byPath[1];

    const openId = u.searchParams.get('id');
    if (openId) return openId;
  } catch {
    return null;
  }
  return null;
}
