'use client'

import { useEffect, useState } from 'react'

type SalesData = {
  total: number
  count: number
  byStaff: Record<string, { name: string; count: number; revenue: number }>
}

export default function AdminSalesPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/sales?year=${year}&month=${month}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { load() }, [year, month]) // eslint-disable-line react-hooks/exhaustive-deps

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-stone-800 mb-6">売上管理</h1>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-8">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {years.map((y) => <option key={y} value={y}>{y}年</option>)}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {months.map((m) => <option key={m} value={m}>{m}月</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-stone-400 text-sm">読み込み中...</div>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs text-stone-400 mb-1">売上合計</p>
              <p className="text-3xl font-bold text-rose-700">¥{data.total.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs text-stone-400 mb-1">施術件数</p>
              <p className="text-3xl font-bold text-stone-800">
                {data.count}
                <span className="text-base font-normal text-stone-500 ml-1">件</span>
              </p>
            </div>
          </div>

          {/* By Staff */}
          <h2 className="text-base font-semibold text-stone-700 mb-3">スタッフ別</h2>
          {Object.keys(data.byStaff).length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-100 p-6 text-center text-stone-400 text-sm">
              この期間のデータはありません
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500 text-xs">
                  <tr>
                    <th className="text-left px-4 py-3">スタッフ</th>
                    <th className="text-right px-4 py-3">件数</th>
                    <th className="text-right px-4 py-3">売上</th>
                    <th className="text-right px-4 py-3">構成比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {Object.entries(data.byStaff)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([id, s]) => (
                      <tr key={id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-right">{s.count}件</td>
                        <td className="px-4 py-3 text-right font-medium text-rose-700">
                          ¥{s.revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-stone-400">
                          {data.total > 0 ? Math.round((s.revenue / data.total) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
