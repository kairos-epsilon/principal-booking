'use client'

import { resetDemo } from '@/lib/demo-store'
import { clearDemoSession } from '@/lib/demo-session'

export function DemoBanner() {
  const handleReset = () => {
    if (!confirm('デモのデータを初期状態に戻します。よろしいですか？')) return
    resetDemo()
    clearDemoSession()
    window.location.href = '/'
  }
  return (
    <div className="bg-stone-800 text-stone-200 text-xs px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
      <span>
        <strong className="text-rose-300 mr-1">DEMO</strong>
        ポートフォリオ用のデモ版です。データはこのブラウザ内にのみ保存され、実際の予約・決済・メール送信は行われません。
      </span>
      <button onClick={handleReset} className="underline hover:text-white">
        データを初期化
      </button>
    </div>
  )
}
