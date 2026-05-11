import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { staffId, menuId, startAt, note } = await req.json()
  const userId = (session.user as { id: string }).id

  const menu = await prisma.menu.findUnique({ where: { id: menuId } })
  if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 })

  const start = new Date(startAt)
  const end = new Date(start.getTime() + menu.duration * 60000)

  const conflict = await prisma.booking.findFirst({
    where: {
      staffId,
      status: { not: 'CANCELLED' },
      startAt: { lt: end },
      endAt: { gt: start },
    },
  })
  if (conflict) return NextResponse.json({ error: 'その時間帯は既に予約が入っています' }, { status: 409 })

  const booking = await prisma.booking.create({
    data: { userId, staffId, menuId, startAt: start, endAt: end, status: 'PENDING', note },
    include: { staff: true, menu: true },
  })
  return NextResponse.json(booking)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { staff: true, menu: true },
    orderBy: { startAt: 'desc' },
  })
  return NextResponse.json(bookings)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id: string }).id

  const { id, status } = await req.json()

  const booking = await prisma.booking.findFirst({ where: { id, userId } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.booking.update({ where: { id }, data: { status } })
  return NextResponse.json(updated)
}
