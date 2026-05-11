'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    hasAllergy: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('メールアドレスまたはパスワードが正しくありません')
    } else {
      router.push('/mypage')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '登録に失敗しました')
      setLoading(false)
      return
    }
    // Auto-login after register
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    router.push('/mypage')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 w-full max-w-md p-8">
        <Link href="/" className="block text-center text-xl font-bold tracking-widest text-rose-800 mb-8">
          PRINCIPAL
        </Link>

        {/* Toggle */}
        <div className="flex rounded-full bg-stone-100 p-1 mb-8">
          <button
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
            }`}
            onClick={() => { setMode('login'); setError('') }}
          >
            ログイン
          </button>
          <button
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === 'register' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
            }`}
            onClick={() => { setMode('register'); setError('') }}
          >
            新規登録
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">お名前</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="山田 花子"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">メールアドレス</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="example@email.com"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">電話番号</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="090-0000-0000"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">パスワード</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                name="hasAllergy"
                checked={form.hasAllergy}
                onChange={handleChange}
                className="rounded border-stone-300 text-rose-600"
              />
              アレルギーがある
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-700 text-white py-2.5 rounded-full font-medium hover:bg-rose-800 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}
