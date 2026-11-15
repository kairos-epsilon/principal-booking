'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDemoSession } from '@/lib/demo-session'

const NAV = [
  { href: '/admin', label: 'ダッシュボード' },
  { href: '/admin/bookings', label: '予約管理' },
  { href: '/admin/customers', label: '顧客管理' },
  { href: '/admin/staff', label: 'スタッフ管理' },
  { href: '/admin/sales', label: '売上管理' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status, logout } = useDemoSession()
  const router = useRouter()
  const role = session?.user.role
  const allowed = !!session && ['STAFF', 'OWNER'].includes(role ?? '')

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !allowed)) router.replace('/auth')
  }, [status, allowed, router])

  if (!allowed || !session) return null

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-900 text-stone-300 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-stone-700">
          <Link href="/" className="font-bold tracking-widest text-white text-sm">PRINCIPAL</Link>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block px-5 py-2.5 text-sm hover:bg-stone-800 hover:text-white transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 pb-5 text-xs text-stone-500">
          {session.user.name} ({role})
          <button
            onClick={() => { logout(); router.push('/') }}
            className="block mt-2 underline hover:text-stone-300"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-stone-50 overflow-auto">
        {children}
      </main>
    </div>
  )
}
