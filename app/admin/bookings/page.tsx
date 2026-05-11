'use client'

import { useState, useEffect } from 'react'

type Booking = {
  id: string
  startAt: string
  endAt: string
  status: string
  note: string | null
  user: { name: string | null; email: string; phone: string | null }
  menu: { name: string; price: number }
  staff: { name: string }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '受付中',
  CONFIRMED: '確定',
  CANCELLED: 'キャンセル',
  COMPLETED: '完了',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-stone-100 text-stone-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/bookings?date=${date}`)
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-stone-800 mb-6">予約管理</h1>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        <button
          onClick={load}
          className="bg-stone-100 text-stone-600 px-4 py-2 rounded-lg text-sm hover:bg-stone-200"
        >
          更新
        </button>
      </div>

      {loading ? (
        <div className="text-stone-400 text-sm">読み込み中...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-100 p-8 text-center text-stone-400 text-sm">
          この日の予約はありません
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
                <th className="text-left px-4 py-3">料金</th>
                <th className="text-left px-4 py-3">ステータス</th>
                <th className="text-left px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">
                    {new Date(b.startAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {new Date(b.endAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <p>{b.user.name}</p>
                    <p className="text-xs text-stone-400">{b.user.phone}</p>
                  </td>
                  <td className="px-4 py-3">{b.menu.name}</td>
                  <td className="px-4 py-3">{b.staff.name}</td>
                  <td className="px-4 py-3">¥{b.menu.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="text-xs border border-stone-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-rose-300"
                    >
                      {Object.entries(STATUS_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
