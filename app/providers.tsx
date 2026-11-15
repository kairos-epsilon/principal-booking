'use client'

import { DemoSessionProvider } from '@/lib/demo-session'

export function Providers({ children }: { children: React.ReactNode }) {
  return <DemoSessionProvider>{children}</DemoSessionProvider>
}
