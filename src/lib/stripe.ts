import Stripe from "stripe"

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    })
  }
  return _stripe
}

/** @deprecated use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export const PLANS = {
  FREE: {
    name: "フリー",
    price: 0,
    queries: 5,
    priceId: null,
  },
  PRO: {
    name: "プロ",
    price: 4980,
    queries: 100,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  PREMIUM: {
    name: "プレミアム",
    price: 9800,
    queries: Infinity,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  },
} as const

export type PlanKey = keyof typeof PLANS
