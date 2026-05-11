import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const menus = await prisma.menu.findMany({ where: { isActive: true }, orderBy: { category: 'asc' } })
  return NextResponse.json(menus)
}
