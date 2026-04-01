import { getCache, setCache } from "@/lib/cache";

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const base = process.env.EDINET_BASE_URL ?? "https://disclosure.edinet-fsa.go.jp/api/v2";
  const url = new URL(path, base);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

export async function edinetFetchJson<T>(path: string, query?: Record<string, string | undefined>) {
  const url = buildUrl(path, query);
  const cacheKey = `edinet:${url}`;
  const cached = await getCache<T>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, {
    headers: { "Subscription-Key": process.env.EDINET_API_KEY ?? "" },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) {
    throw new Error(`EDINET API error: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as T;
  await setCache(cacheKey, data, 60 * 60 * 24);
  return data;
}

export async function edinetFetchBinary(path: string, query?: Record<string, string | undefined>) {
  const url = buildUrl(path, query);
  const response = await fetch(url, {
    headers: { "Subscription-Key": process.env.EDINET_API_KEY ?? "" },
  });
  if (!response.ok) {
    throw new Error(`EDINET document error: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}
