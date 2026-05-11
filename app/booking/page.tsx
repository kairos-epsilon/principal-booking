'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Menu = { id: string; name: string; price: number; duration: number; category: string }
type Staff = { id: string; name: string; bio: string | null }

const STEPS = ['メニュー', 'スタッフ', '日時', '確認', '完了']

export default function BookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [menus, setMenus] = useState<Menu[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth')
  }, [status, router])

  useEffect(() => {
    fetch('/api/menus').then((r) => r.json()).then(setMenus)
    fetch('/api/staff').then((r) => r.json()).then(setStaffList)
  }, [])

  useEffect(() => {
    if (!selectedDate || !selectedStaff || !selectedMenu) return
    setSlots([])
    fetch(`/api/bookings/available?date=${selectedDate}&staffId=${selectedStaff.id}&duration=${selectedMenu.duration}`)
      .then((r) => r.json())
      .then(setSlots)
  }, [selectedDate, selectedStaff, selectedMenu])

  const handleBooking = async () => {
    if (!selectedMenu || !selectedStaff || !selectedSlot) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menuId: selectedMenu.id,
        staffId: selectedStaff.id,
        startAt: selectedSlot,
        note,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '予約に失敗しました')
      return
    }
    setStep(4)
  }

  const categories = [...new Set(menus.map((m) => m.category))]

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-widest text-rose-800">PRINCIPAL</Link>
          {session && (
            <span className="text-sm text-stone-500">{session.user?.name}</span>
          )}
        </div>
      </header>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step
                    ? 'bg-rose-700 text-white'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs mt-1 ${i === step ? 'text-rose-700 font-medium' : 'text-stone-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        {/* Step 0: Menu */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-stone-800">メニューを選んでください</h2>
            {categories.map((cat) => (
              <div key={cat} className="mb-6">
                <h3 className="text-sm font-semibold text-rose-700 mb-2">{cat}</h3>
                <div className="space-y-2">
                  {menus.filter((m) => m.category === cat).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedMenu(m); setStep(1) }}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        selectedMenu?.id === m.id
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-stone-100 bg-white hover:border-rose-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-stone-800">{m.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{m.duration}分</p>
                        </div>
                        <p className="text-rose-700 font-bold">¥{m.price.toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Staff */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-stone-800">スタッフを選んでください</h2>
            <div className="space-y-3">
              {staffList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setStep(2) }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedStaff?.id === s.id
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-stone-100 bg-white hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{s.name}</p>
                      {s.bio && <p className="text-xs text-stone-400">{s.bio}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="mt-4 text-sm text-stone-500 hover:text-stone-700">
              ← 戻る
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-stone-800">日時を選んでください</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">日付</label>
              <input
                type="date"
                value={selectedDate}
                min={minDateStr}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot('') }}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">時間</label>
                {slots.length === 0 ? (
                  <p className="text-stone-400 text-sm">空き時間がありません</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const time = new Date(slot).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                            selectedSlot === slot
                              ? 'bg-rose-700 text-white border-rose-700'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300'
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="mt-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">備考（任意）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                placeholder="ご要望があればご記入ください"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="text-sm text-stone-500 hover:text-stone-700">
                ← 戻る
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                className="ml-auto bg-rose-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-rose-800 disabled:opacity-50 transition-colors"
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedMenu && selectedStaff && selectedSlot && (
          <div>
            <h2 className="text-lg font-bold mb-6 text-stone-800">予約内容の確認</h2>
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 space-y-4">
              <Row label="メニュー" value={selectedMenu.name} />
              <Row label="料金" value={`¥${selectedMenu.price.toLocaleString()}`} />
              <Row label="所要時間" value={`${selectedMenu.duration}分`} />
              <Row label="スタッフ" value={selectedStaff.name} />
              <Row
                label="日時"
                value={new Date(selectedSlot).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
              {note && <Row label="備考" value={note} />}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="text-sm text-stone-500 hover:text-stone-700">
                ← 戻る
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="ml-auto bg-rose-700 text-white px-6 py-2.5 rounded-full font-medium hover:bg-rose-800 disabled:opacity-60 transition-colors"
              >
                {loading ? '予約中...' : '予約を確定する'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">ご予約が完了しました</h2>
            <p className="text-stone-500 text-sm mb-8">
              予約内容はマイページからご確認いただけます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/mypage"
                className="bg-rose-700 text-white px-6 py-2.5 rounded-full font-medium hover:bg-rose-800 transition-colors"
              >
                マイページへ
              </Link>
              <Link
                href="/"
                className="border border-stone-200 text-stone-600 px-6 py-2.5 rounded-full hover:bg-stone-50 transition-colors"
              >
                トップへ戻る
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-800 font-medium text-right">{value}</span>
    </div>
  )
}
