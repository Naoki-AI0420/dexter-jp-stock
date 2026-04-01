import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.stripeId) {
    return NextResponse.json({ error: "No subscription" }, { status: 400 })
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  })
  return NextResponse.json({ url: portal.url })
}
