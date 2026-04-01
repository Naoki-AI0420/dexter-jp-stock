import { DexterJpAgent } from "@/agent/agent";
import type { ChatTurn } from "@/agent/types";
import { enforceRateLimit } from "@/lib/rate-limit";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { message: string; history?: ChatTurn[] };
  await enforceRateLimit(`chat:${request.headers.get("x-forwarded-for") ?? "local"}`, 10, 60);

  // Usage enforcement for authenticated users
  const session = await auth();
  if (session?.user?.id) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyUsage = await db.usage.aggregate({
      where: { userId: session.user.id, date: { gte: startOfMonth } },
      _sum: { queries: true },
    });
    const total = monthlyUsage._sum.queries ?? 0;
    const plan = (session.user.plan ?? "FREE") as keyof typeof PLANS;
    const limit = PLANS[plan]?.queries ?? 5;

    if (limit !== Infinity && total >= limit) {
      return new Response(
        JSON.stringify({
          error: `月次利用回数の上限（${limit}回）に達しました。プランをアップグレードしてください。`,
          upgradeUrl: "/settings/billing",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    // Increment today's usage before streaming
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    await db.usage.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      create: { userId: session.user.id, date: today, queries: 1 },
      update: { queries: { increment: 1 } },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const agent = new DexterJpAgent();
        for await (const event of agent.run(body.message, body.history ?? [])) {
          controller.enqueue(encoder.encode(`event: ${event.type}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
