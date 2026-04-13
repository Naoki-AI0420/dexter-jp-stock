"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      aria-label="テーマ切り替え"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-lg border border-gray-700 bg-gray-800/50 px-2 py-1.5 text-xs text-gray-300 hover:border-gray-500 hover:text-white transition-colors dark:border-gray-700 dark:bg-gray-800/50"
    >
      {theme === "dark" ? "☀ ライト" : "☾ ダーク"}
    </button>
  );
}
