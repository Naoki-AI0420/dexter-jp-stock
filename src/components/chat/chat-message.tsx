import { cn } from "@/lib/utils";

export function ChatMessage({
  role,
  content,
}: {
  role: "user" | "assistant" | "system";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "max-w-[90%] rounded-[28px] px-5 py-4 text-sm leading-7 shadow-lg",
        isUser
          ? "ml-auto bg-sky-500 text-white"
          : "bg-slate-900/90 text-slate-100 ring-1 ring-white/10",
      )}
    >
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}
