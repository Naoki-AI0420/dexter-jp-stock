import { getCache, setCache } from "@/lib/cache";

export async function enforceRateLimit(key: string, limit = 20, windowSeconds = 60) {
  const cacheKey = `rate:${key}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
  const current = (await getCache<number>(cacheKey)) ?? 0;
  if (current >= limit) {
    throw new Error("Rate limit exceeded");
  }
  await setCache(cacheKey, current + 1, windowSeconds);
}
