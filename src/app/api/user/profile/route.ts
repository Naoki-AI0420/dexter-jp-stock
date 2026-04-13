import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// PUT /api/user/profile — update name and/or password
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const updateData: { name?: string; passwordHash?: string } = {};

  if (body.name !== undefined) {
    const trimmed = body.name.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      return NextResponse.json({ error: "名前は1〜100文字で入力してください" }, { status: 400 });
    }
    updateData.name = trimmed;
  }

  if (body.newPassword) {
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (user?.passwordHash) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "現在のパスワードが必要です" }, { status: 400 });
      }
      const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 400 });
      }
    }

    updateData.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "更新するフィールドがありません" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, plan: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/user/profile — delete account
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ ok: true });
}
