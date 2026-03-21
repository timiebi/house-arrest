const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=USD&to=NGN';

export async function getUsdToNgnRate(): Promise<number> {
  const fallbackRaw = process.env.FX_USD_NGN_FALLBACK;
  const fallback = fallbackRaw ? Number(fallbackRaw) : null;

  try {
    const res = await fetch(FRANKFURTER_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: { NGN?: number } };
    const rate = Number(data?.rates?.NGN);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('Invalid FX rate');
    return rate;
  } catch {
    if (fallback && Number.isFinite(fallback) && fallback > 0) return fallback;
    throw new Error('FX rate unavailable');
  }
}

export function usdCentsToNgnKobo(usdCents: number, usdToNgnRate: number): number {
  const usd = Math.max(0, usdCents) / 100;
  const ngn = usd * usdToNgnRate;
  return Math.round(ngn * 100);
}
