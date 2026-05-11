'use client'

import { useEffect, useState } from 'react'

type Staff = {
  id: string
  name: string
  bio: string | null
  imageUrl: string | null
  isActive: boolean
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Staff | null>(null)

  const load = () =>
    fetch('/api/admin/staff')
      .then((r) => r.json())
      .then((data) => { setStaff(Array.isArray(data) ? data : []); setLoading(false) })

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!editing) return
    await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setEditing(null)
    load()
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-stone-800 mb-6">スタッフ管理</h1>

      {loading ? (
        <div className="text-stone-400 text-sm">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{s.name}</p>
                    <p className="text-xs text-stone-400">{s.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {s.isActive ? '勤務中' : '休止中'}
                  </span>
                  <button
                    onClick={() => setEditing({ ...s })}
                    className="text-xs text-stone-400 hover:text-stone-600 underline"
                  >
                    編集
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-stone-800">スタッフ編集</h2>
            <div className="space-y-4">
              <Field label="名前">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </Field>
              <Field label="プロフィール">
                <textarea
                  value={editing.bio ?? ''}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                  className="rounded border-stone-300 text-rose-600"
                />
                勤務中
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border border-stone-200 text-stone-600 py-2 rounded-full text-sm hover:bg-stone-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-rose-700 text-white py-2 rounded-full text-sm hover:bg-rose-800"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
