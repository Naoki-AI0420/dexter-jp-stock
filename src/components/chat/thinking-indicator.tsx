export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs text-sky-200">
      <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
      AIが分析中です
    </div>
  );
}
