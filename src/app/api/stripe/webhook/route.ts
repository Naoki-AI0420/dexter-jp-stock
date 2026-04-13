import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import Stripe from "stripe"

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      if (userId && plan) {
        await db.user.update({
          where: { id: userId },
          data: { plan: plan as "FREE" | "PRO" | "PREMIUM" },
        })
      }
      break
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if (customer.deleted) break
      const user = await db.user.findFirst({ where: { stripeId: sub.customer as string } })
      if (!user) break
      if (event.type === "customer.subscription.deleted") {
        await db.user.update({ where: { id: user.id }, data: { plan: "FREE" } })
      } else {
        const subscription = sub as Stripe.Subscription & { current_period_end?: number }
        await db.user.update({
          where: { id: user.id },
          data: {
            stripeSubscriptionId: sub.id,
            stripeCurrentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
