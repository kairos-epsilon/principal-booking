import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const staffId = searchParams.get('staffId')
  const date = searchParams.get('date')
  const duration = Number(searchParams.get('duration') || 60)
  if (!staffId || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const dayStart = new Date(`${date}T00:00:00+09:00`)
  const dayEnd = new Date(`${date}T23:59:59+09:00`)

  const existing = await prisma.booking.findMany({
    where: {
      staffId,
      status: { not: 'CANCELLED' },
      startAt: { gte: dayStart, lte: dayEnd },
    },
  })

  // Generate slots 10:00-20:00 every 30min
  const slots: string[] = []
  for (let h = 10; h < 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      const slotStart = new Date(`${date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+09:00`)
      const slotEnd = new Date(slotStart.getTime() + duration * 60000)
      if (slotEnd > new Date(`${date}T20:00:00+09:00`)) continue
      const conflict = existing.some(b =>
        slotStart < b.endAt && slotEnd > b.startAt
      )
      if (!conflict) slots.push(slotStart.toISOString())
    }
  }
  return NextResponse.json(slots)
}
