import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookingId } = await req.json()

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id },
    include: { menu: true },
  })

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.menu.price * 100,
    currency: 'jpy',
    metadata: { bookingId: booking.id },
  })

  await prisma.booking.update({
    where: { id: bookingId },
    data: { stripePaymentIntentId: paymentIntent.id },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
