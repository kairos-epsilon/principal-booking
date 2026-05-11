import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const staff = await prisma.staff.findMany({ where: { isActive: true } })
  return NextResponse.json(staff)
}
