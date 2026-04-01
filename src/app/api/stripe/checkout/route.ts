import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe, PLANS } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { plan } = await req.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig || !planConfig.priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  let customerId = user?.stripeId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: session.user.name ?? undefined,
    })
    customerId = customer.id
    await db.user.update({
      where: { id: session.user.id },
      data: { stripeId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId!, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    metadata: { userId: session.user.id, plan },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
