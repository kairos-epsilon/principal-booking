import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !['STAFF', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  const bookings = await prisma.booking.findMany({
    where: {
      startAt: { gte: start, lt: end },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
    include: { menu: true, staff: true },
  })

  const total = bookings.reduce((sum, b) => sum + b.menu.price, 0)
  const byStaff: Record<string, { name: string; count: number; revenue: number }> = {}

  for (const b of bookings) {
    if (!byStaff[b.staffId]) {
      byStaff[b.staffId] = { name: b.staff.name, count: 0, revenue: 0 }
    }
    byStaff[b.staffId].count++
    byStaff[b.staffId].revenue += b.menu.price
  }

  return NextResponse.json({ total, count: bookings.length, byStaff })
}
