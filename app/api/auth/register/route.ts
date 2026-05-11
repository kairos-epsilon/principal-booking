import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { name, email, phone, password, hasAllergy, allergyNote } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 400 })
  }
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, phone, password: hashed, hasAllergy: hasAllergy ?? false, allergyNote },
  })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email })
}
