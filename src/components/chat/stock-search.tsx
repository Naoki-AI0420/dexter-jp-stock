"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchResult {
  code: string;
  companyName: string;
}

export function StockSearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        return;
      }
      setItems((await response.json()) as SearchResult[]);
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="銘柄名 or コードで検索"
        className="pl-11"
      />
      {items.length ? (
        <div className="absolute z-20 mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl">
          {items.map((item) => (
            <div key={item.code} className="rounded-2xl px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
              <p className="font-medium">{item.companyName}</p>
              <p className="text-xs text-slate-400">{item.code}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
