// デモ版の初期データ（旧 prisma/seed.ts の内容を移植）。
// すべて架空のデータです。実在の人物・店舗とは関係ありません。

export type Role = 'CUSTOMER' | 'STAFF' | 'OWNER'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export type User = {
  id: string
  name: string | null
  email: string
  phone: string | null
  hasAllergy: boolean
  role: Role
  /** デモ用の平文（シード）または 'sha256:...'（新規登録）。null はログイン不可 */
  password: string | null
  createdAt: string
}

export type Staff = {
  id: string
  name: string
  bio: string | null
  imageUrl: string | null
  isActive: boolean
}

export type Menu = {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string
  isActive: boolean
}

export type BookingRec = {
  id: string
  userId: string
  staffId: string
  menuId: string
  startAt: string
  endAt: string
  status: BookingStatus
  note: string | null
  createdAt: string
}

export const DEMO_CUSTOMER = { email: 'test@example.com', password: 'test1234' }
export const DEMO_ADMIN = { email: 'admin@principal.jp', password: 'admin1234' }

export const SEED_STAFF: Staff[] = [
  { id: 'staff-yuki', name: 'Yuki', bio: 'ネイルアート歴10年。トレンドデザインが得意です。', imageUrl: '/images/staff/yuki.jpg', isActive: true },
  { id: 'staff-hana', name: 'Hana', bio: 'ケアとジェルネイルのスペシャリスト。丁寧な施術が好評。', imageUrl: '/images/staff/hana.jpg', isActive: true },
  { id: 'staff-mio', name: 'Mio', bio: 'アート系デザインが得意。個性的なネイルを提供します。', imageUrl: '/images/staff/mio.jpg', isActive: true },
  { id: 'staff-saki', name: 'Saki', bio: '速くて丁寧。シンプルからグラデーションまで対応。', imageUrl: '/images/staff/saki.jpg', isActive: true },
]

export const SEED_MENUS: Menu[] = [
  { id: 'menu-1', name: 'ワンカラー（手）', price: 5500, duration: 60, category: 'ジェルネイル', description: 'シンプルで清潔感のあるワンカラーネイル。', isActive: true },
  { id: 'menu-2', name: 'フレンチネイル（手）', price: 7700, duration: 90, category: 'ジェルネイル', description: '定番のフレンチデザイン。上品な仕上がり。', isActive: true },
  { id: 'menu-3', name: 'グラデーション（手）', price: 8800, duration: 90, category: 'ジェルネイル', description: '自然なグラデーションで指先を美しく。', isActive: true },
  { id: 'menu-4', name: 'ネイルアート（手）', price: 11000, duration: 120, category: 'ネイルアート', description: 'オリジナルデザインのネイルアート。ご要望に合わせます。', isActive: true },
  { id: 'menu-5', name: 'ストーンデコ（手）', price: 9900, duration: 90, category: 'ネイルアート', description: 'キラキラのストーンを使った華やかなデザイン。', isActive: true },
  { id: 'menu-6', name: 'ワンカラー（足）', price: 4400, duration: 60, category: 'フットネイル', description: 'フットのワンカラーネイル。サンダルシーズンに。', isActive: true },
  { id: 'menu-7', name: 'フットアート（足）', price: 6600, duration: 90, category: 'フットネイル', description: 'フット用のオリジナルアートデザイン。', isActive: true },
  { id: 'menu-8', name: 'オフのみ', price: 2200, duration: 30, category: 'ケア', description: '付け替え不要の方向けジェルオフ。', isActive: true },
  { id: 'menu-9', name: 'ハンドケア', price: 3300, duration: 30, category: 'ケア', description: 'キューティクルケア＋保湿トリートメント。', isActive: true },
  { id: 'menu-10', name: 'ブライダルパッケージ', price: 22000, duration: 180, category: 'スペシャル', description: '結婚式向け手足フルセット。カウンセリング込み。', isActive: true },
]

const daysAgo = (n: number) => {
  const d = new Date()
  d.setHours(10, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/** 管理者＋デモ顧客＋サンプル顧客（架空）。サンプル顧客はログイン不可 */
export function seedUsers(): User[] {
  return [
    { id: 'user-admin', name: 'オーナー', email: DEMO_ADMIN.email, phone: null, hasAllergy: false, role: 'OWNER', password: DEMO_ADMIN.password, createdAt: daysAgo(400) },
    { id: 'user-test', name: 'テストユーザー', email: DEMO_CUSTOMER.email, phone: '090-0000-0000', hasAllergy: false, role: 'CUSTOMER', password: DEMO_CUSTOMER.password, createdAt: daysAgo(120) },
    { id: 'user-c1', name: '山田 花子', email: 'hanako.yamada@example.com', phone: '090-0000-0101', hasAllergy: false, role: 'CUSTOMER', password: null, createdAt: daysAgo(300) },
    { id: 'user-c2', name: '佐藤 美咲', email: 'misaki.sato@example.com', phone: '090-0000-0102', hasAllergy: true, role: 'CUSTOMER', password: null, createdAt: daysAgo(270) },
    { id: 'user-c3', name: '鈴木 あかり', email: 'akari.suzuki@example.com', phone: '090-0000-0103', hasAllergy: false, role: 'CUSTOMER', password: null, createdAt: daysAgo(240) },
    { id: 'user-c4', name: '高橋 ゆり', email: 'yuri.takahashi@example.com', phone: '090-0000-0104', hasAllergy: false, role: 'CUSTOMER', password: null, createdAt: daysAgo(200) },
    { id: 'user-c5', name: '田中 莉子', email: 'riko.tanaka@example.com', phone: '090-0000-0105', hasAllergy: false, role: 'CUSTOMER', password: null, createdAt: daysAgo(170) },
    { id: 'user-c6', name: '伊藤 さくら', email: 'sakura.ito@example.com', phone: '090-0000-0106', hasAllergy: true, role: 'CUSTOMER', password: null, createdAt: daysAgo(140) },
    { id: 'user-c7', name: '渡辺 まい', email: 'mai.watanabe@example.com', phone: '090-0000-0107', hasAllergy: false, role: 'CUSTOMER', password: null, createdAt: daysAgo(110) },
    { id: 'user-c8', name: '中村 ひなた', email: 'hinata.nakamura@example.com', phone: '090-0000-0108', hasAllergy: false, role: 'CUSTOMER', password: null, createdAt: daysAgo(80) },
  ]
}

const SEED_CUSTOMER_IDS = ['user-test', 'user-c1', 'user-c2', 'user-c3', 'user-c4', 'user-c5', 'user-c6', 'user-c7', 'user-c8']

/**
 * サンプル予約を「今日」を基準に毎回生成する（過去75日〜未来14日）。
 * 擬似乱数は固定シードなので、同じ日に開けば同じ内容になる。月曜は定休日。
 */
export function genSeedBookings(): BookingRec[] {
  let s = 20260101
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const now = new Date()

  const out: BookingRec[] = []
  const taken: Record<string, { s: number; e: number }[]> = {}

  const at = (off: number, min: number) => {
    const d = new Date(today)
    d.setDate(today.getDate() + off)
    d.setHours(0, min, 0, 0)
    return d
  }
  const nonMonday = (off: number) => (at(off, 0).getDay() === 1 ? off + 1 : off)

  const push = (
    id: string,
    off: number,
    startMin: number,
    userId: string,
    staffId: string,
    menuId: string,
    status: BookingStatus,
    note: string | null = null
  ): boolean => {
    const menu = SEED_MENUS.find((m) => m.id === menuId)!
    const start = at(off, startMin)
    const end = at(off, startMin + menu.duration)
    const key = `${staffId}:${off}`
    const list = (taken[key] ??= [])
    if (list.some((t) => startMin < t.e && startMin + menu.duration > t.s)) return false
    list.push({ s: startMin, e: startMin + menu.duration })
    out.push({
      id,
      userId,
      staffId,
      menuId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status,
      note,
      createdAt: new Date(start.getTime() - 3 * 86400000).toISOString(),
    })
    return true
  }

  // デモ顧客（test@example.com）のマイページ用に、今後1件・過去1件を必ず用意する
  push('seed-test-future', nonMonday(3), 14 * 60, 'user-test', 'staff-yuki', 'menu-2', 'CONFIRMED', 'シンプルなフレンチ希望です')
  push('seed-test-pending', nonMonday(6), 11 * 60, 'user-test', 'staff-hana', 'menu-9', 'PENDING')
  push('seed-test-past', nonMonday(-12), 13 * 60, 'user-test', 'staff-mio', 'menu-4', 'COMPLETED')

  for (let off = -75; off <= 14; off++) {
    if (at(off, 0).getDay() === 1) continue
    const n = off === 0 ? 5 : 1 + Math.floor(rnd() * 4)
    for (let i = 0; i < n; i++) {
      const staff = SEED_STAFF[Math.floor(rnd() * SEED_STAFF.length)]
      const menu = SEED_MENUS[Math.floor(rnd() * SEED_MENUS.length)]
      const slots = Math.floor((1200 - 600 - menu.duration) / 30) + 1
      const startMin = 600 + 30 * Math.floor(rnd() * slots)
      const userId = SEED_CUSTOMER_IDS[1 + Math.floor(rnd() * (SEED_CUSTOMER_IDS.length - 1))]
      const r = rnd()

      let status: BookingStatus
      if (off < 0) status = r < 0.1 ? 'CANCELLED' : 'COMPLETED'
      else if (off === 0) status = now.getTime() > at(0, startMin + menu.duration).getTime() ? 'COMPLETED' : 'CONFIRMED'
      else status = r < 0.3 ? 'PENDING' : 'CONFIRMED'

      push(`seed-${off}-${i}`, off, startMin, userId, staff.id, menu.id, status)
    }
  }
  return out
}
