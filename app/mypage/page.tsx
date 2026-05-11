'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Booking = {
  id: string
  startAt: string
  endAt: string
  status: string
  note: string | null
  menu: { name: string; price: number; duration: number }
  staff: { name: string }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '予約受付中',
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

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [status])

  const handleCancel = async (id: string) => {
    if (!confirm('キャンセルしますか？')) return
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'CANCELLED' }),
    })
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
    )
  }

  if (status === 'loading' || loading) return null

  const upcoming = bookings.filter(
    (b) => b.status !== 'CANCELLED' && new Date(b.startAt) >= new Date()
  )
  const past = bookings.filter(
    (b) => b.status === 'CANCELLED' || new Date(b.startAt) < new Date()
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-widest text-rose-800">PRINCIPAL</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-stone-400 hover:text-stone-600"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-stone-800">マイページ</h1>
          <Link
            href="/booking"
            className="bg-rose-700 text-white px-4 py-2 rounded-full text-sm hover:bg-rose-800 transition-colors"
          >
            新しく予約する
          </Link>
        </div>

        {/* Upcoming */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-stone-700 mb-3">今後の予約</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-100 p-6 text-center text-stone-400 text-sm">
              予約がありません
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={handleCancel} showCancel />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-stone-700 mb-3">過去の予約</h2>
            <div className="space-y-3">
              {past.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={handleCancel} showCancel={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function BookingCard({
  booking: b,
  onCancel,
  showCancel,
}: {
  booking: Booking
  onCancel: (id: string) => void
  showCancel: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
      <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-stone-800">{b.menu.name}</p>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[b.status]}`}>
          {STATUS_LABEL[b.status]}
        </span>
      </div>
      <p className="text-sm text-stone-500">
        {new Date(b.startAt).toLocaleString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
      <p className="text-sm text-stone-500">担当: {b.staff.name}</p>
      <p className="text-sm text-rose-700 font-medium mt-1">¥{b.menu.price.toLocaleString()}</p>
      {b.note && <p className="text-xs text-stone-400 mt-2">備考: {b.note}</p>}
      {showCancel && b.status === 'PENDING' && (
        <button
          onClick={() => onCancel(b.id)}
          className="mt-3 text-xs text-stone-400 hover:text-red-500 underline"
        >
          キャンセルする
        </button>
      )}
    </div>
  )
}
