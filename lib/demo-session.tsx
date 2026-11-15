'use client'

// デモ版のログイン状態。NextAuth の代わりに、ブラウザ内（localStorage）で保持する。
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as store from './demo-store'
import type { Role } from './demo-data'

const SESSION_KEY = 'principal-demo-session'

export type SessionUser = { id: string; name: string | null; email: string; role: Role }
type Status = 'loading' | 'authenticated' | 'unauthenticated'

type Ctx = {
  data: { user: SessionUser } | null
  status: Status
  login: (email: string, password: string) => Promise<boolean>
  register: (input: { name: string; email: string; phone: string; password: string; hasAllergy: boolean }) => Promise<void>
  logout: () => void
}

const SessionContext = createContext<Ctx | null>(null)

const toSessionUser = (u: { id: string; name: string | null; email: string; role: Role }): SessionUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
})

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let found: SessionUser | null = null
    try {
      const id = localStorage.getItem(SESSION_KEY)
      const u = id ? store.getUser(id) : undefined
      if (u) found = toSessionUser(u)
    } catch {
      /* noop */
    }
    setUser(found)
    setStatus(found ? 'authenticated' : 'unauthenticated')
  }, [])

  const start = useCallback((u: SessionUser) => {
    try {
      localStorage.setItem(SESSION_KEY, u.id)
    } catch {
      /* noop */
    }
    setUser(u)
    setStatus('authenticated')
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await store.authenticate(email, password)
      if (!u) return false
      start(toSessionUser(u))
      return true
    },
    [start]
  )

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string; hasAllergy: boolean }) => {
      const u = await store.register(input)
      start(toSessionUser(u))
    },
    [start]
  )

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* noop */
    }
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<Ctx>(
    () => ({ data: user ? { user } : null, status, login, register, logout }),
    [user, status, login, register, logout]
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useDemoSession(): Ctx {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('DemoSessionProvider が必要です')
  return ctx
}

export function clearDemoSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* noop */
  }
}
