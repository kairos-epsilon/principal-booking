'use client'

import { useEffect, useState } from 'react'

type Customer = {
  id: string
  name: string | null
  email: string
  phone: string | null
  hasAllergy: boolean
  createdAt: string
  _count: { bookings: number }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((data) => { setCustomers(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtered = customers.filter(
    (c) =>
      (c.name ?? '').includes(search) ||
      c.email.includes(search) ||
      (c.phone ?? '').includes(search)
  )

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-stone-800 mb-6">顧客管理</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="名前・メール・電話番号で検索"
        className="mb-6 border border-stone-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-rose-300"
      />

      {loading ? (
        <div className="text-stone-400 text-sm">読み込み中...</div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">名前</th>
                <th className="text-left px-4 py-3">メール</th>
                <th className="text-left px-4 py-3">電話番号</th>
                <th className="text-left px-4 py-3">アレルギー</th>
                <th className="text-left px-4 py-3">予約数</th>
                <th className="text-left px-4 py-3">登録日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">{c.name ?? '—'}</td>
                  <td className="px-4 py-3 text-stone-500">{c.email}</td>
                  <td className="px-4 py-3">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.hasAllergy ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">あり</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">{c._count.bookings}件</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-stone-400 text-sm py-8">顧客が見つかりません</p>
          )}
        </div>
      )}
    </div>
  )
}
