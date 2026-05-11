import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  const [todayBookings, monthBookings, totalCustomers, pendingCount] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
      include: { user: true, menu: true, staff: true },
      orderBy: { startAt: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        startAt: { gte: monthStart, lt: monthEnd },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: { menu: true },
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
  ])

  const monthRevenue = monthBookings.reduce((s, b) => s + b.menu.price, 0)

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-stone-800 mb-6">ダッシュボード</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="本日の予約" value={todayBookings.length} unit="件" />
        <StatCard label="今月の売上" value={`¥${monthRevenue.toLocaleString()}`} />
        <StatCard label="今月の予約数" value={monthBookings.length} unit="件" />
        <StatCard label="総顧客数" value={totalCustomers} unit="名" />
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          未確定の予約が <strong>{pendingCount}件</strong> あります。
          <Link href="/admin/bookings" className="underline ml-2">予約管理へ</Link>
        </div>
      )}

      {/* Today's schedule */}
      <div>
        <h2 className="text-base font-semibold text-stone-700 mb-3">本日のスケジュール</h2>
        {todayBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-100 p-6 text-center text-stone-400 text-sm">
            本日の予約はありません
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-3">時間</th>
                  <th className="text-left px-4 py-3">顧客</th>
                  <th className="text-left px-4 py-3">メニュー</th>
                  <th className="text-left px-4 py-3">担当</th>
                  <th className="text-left px-4 py-3">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {todayBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium">
                      {new Date(b.startAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">{b.user.name}</td>
                    <td className="px-4 py-3">{b.menu.name}</td>
                    <td className="px-4 py-3">{b.staff.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-stone-800">
        {value}
        {unit && <span className="text-base font-normal text-stone-500 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-stone-100 text-stone-500',
    COMPLETED: 'bg-blue-100 text-blue-700',
  }
  const labels: Record<string, string> = {
    PENDING: '受付中',
    CONFIRMED: '確定',
    CANCELLED: 'キャンセル',
    COMPLETED: '完了',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  )
}
