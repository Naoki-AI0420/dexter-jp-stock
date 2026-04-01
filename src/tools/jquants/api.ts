import { getCache, setCache } from "@/lib/cache";

type Query = Record<string, string | number | undefined>;

function buildUrl(path: string, query?: Query) {
  const base = process.env.JQUANTS_BASE_URL ?? "https://api.jquants.com/v2";
  const url = new URL(path, base);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export async function jquantsFetch<T>(
  path: string,
  query?: Query,
  ttlSeconds = 300,
): Promise<T> {
  const url = buildUrl(path, query);
  const cacheKey = `jquants:${url}`;
  const cached = await getCache<T>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.JQUANTS_API_KEY ?? ""}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: ttlSeconds },
  });

  if (!response.ok) {
    throw new Error(`J-Quants API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as T;
  await setCache(cacheKey, data, ttlSeconds);
  return data;
}
