import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !['STAFF', 'OWNER'].includes(session.user.role)) {
    return null
  }
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  const where = date
    ? {
        startAt: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      }
    : {}

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      staff: true,
      menu: true,
    },
    orderBy: { startAt: 'asc' },
  })

  return NextResponse.json(bookings)
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status } = await req.json()

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { user: true, menu: true, staff: true },
  })

  return NextResponse.json(booking)
}
