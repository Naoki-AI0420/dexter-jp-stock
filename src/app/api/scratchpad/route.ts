import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/scratchpad — list user's scratchpad entries
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await db.scratchpad.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, content: true, toolCalls: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(entries);
}

// POST /api/scratchpad — save a new scratchpad entry
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { title?: string; content: string; toolCalls?: unknown };
  if (!body.content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const entry = await db.scratchpad.create({
    data: {
      userId: session.user.id,
      title: body.title ?? null,
      content: body.content,
      toolCalls: body.toolCalls ? (body.toolCalls as object) : undefined,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// DELETE /api/scratchpad?id=xxx — delete a scratchpad entry
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const entry = await db.scratchpad.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.scratchpad.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
