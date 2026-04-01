import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
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
