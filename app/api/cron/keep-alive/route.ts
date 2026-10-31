import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Cron が毎日呼ぶ。Supabase 無料プランの自動停止（7日間アクセスなし）を防ぐため、
// DB へ実際に問い合わせてアクティビティを発生させる。
// GitHub Actions の定期実行は、60日間 push が無いと GitHub に自動停止されるため、こちらを主にする。
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, at: new Date().toISOString() })
  } catch (e) {
    console.error('keep-alive failed', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
