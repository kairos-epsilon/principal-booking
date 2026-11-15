// デモ版のデータ層。旧 Prisma/Supabase の代わりに、ブラウザの localStorage に保存する。
// クライアントコンポーネントからのみ呼ぶこと（サーバー側では動かない）。
import {
  BookingRec,
  BookingStatus,
  Menu,
  Staff,
  User,
  genSeedBookings,
  SEED_MENUS,
  SEED_STAFF,
  seedUsers,
} from './demo-data'

const KEY = 'principal-demo-db-v1'

type DB = {
  seedDay: string
  users: User[]
  staff: Staff[]
  menus: Menu[]
  bookings: BookingRec[]
}

const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function freshDB(): DB {
  return {
    seedDay: dayKey(),
    users: seedUsers(),
    staff: SEED_STAFF.map((s) => ({ ...s })),
    menus: SEED_MENUS.map((m) => ({ ...m })),
    bookings: genSeedBookings(),
  }
}

function save(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* 保存できない環境でも画面は動かす */
  }
}

let memory: DB | null = null

function load(): DB {
  if (memory && memory.seedDay === dayKey()) return memory
  let db: DB | null = null
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) db = JSON.parse(raw) as DB
  } catch {
    db = null
  }
  if (!db) {
    db = freshDB()
    save(db)
  } else if (db.seedDay !== dayKey()) {
    // 日付が変わったら、サンプル予約だけ「今日」基準で作り直す（ユーザーが作った予約・登録は残す）
    db.bookings = [...genSeedBookings(), ...db.bookings.filter((b) => !b.id.startsWith('seed-'))]
    db.seedDay = dayKey()
    save(db)
  }
  memory = db
  return db
}

export function resetDemo() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
  memory = null
}

// ---------- 参照 ----------
export function getMenus(): Menu[] {
  return load()
    .menus.filter((m) => m.isActive)
    .sort((a, b) => a.category.localeCompare(b.category))
}

export function getStaff(): Staff[] {
  return load().staff.filter((s) => s.isActive)
}

export function getUser(id: string): User | undefined {
  return load().users.find((u) => u.id === id)
}

// ---------- 認証（デモ） ----------
async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return 'sha256:' + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const user = load().users.find((u) => u.email === email.trim().toLowerCase())
  if (!user || !user.password) return null
  const ok = user.password.startsWith('sha256:') ? user.password === (await sha256(password)) : user.password === password
  return ok ? user : null
}

export async function register(input: {
  name: string
  email: string
  phone: string
  password: string
  hasAllergy: boolean
}): Promise<User> {
  const db = load()
  const email = input.email.trim().toLowerCase()
  if (db.users.some((u) => u.email === email)) throw new Error('このメールアドレスは既に登録されています')
  const user: User = {
    id: `user-${Date.now().toString(36)}`,
    name: input.name,
    email,
    phone: input.phone || null,
    hasAllergy: input.hasAllergy,
    role: 'CUSTOMER',
    password: await sha256(input.password),
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  save(db)
  return user
}

// ---------- 予約 ----------
const DAY_START = 10
const DAY_END = 20

/** 空き枠（10:00〜20:00・30分刻み）。同じスタッフの既存予約と重なる枠は除く */
export function availableSlots(date: string, staffId: string, duration: number): string[] {
  const dayStart = new Date(`${date}T00:00:00`)
  const dayEnd = new Date(`${date}T23:59:59`)
  const existing = load().bookings.filter(
    (b) => b.staffId === staffId && b.status !== 'CANCELLED' && new Date(b.startAt) >= dayStart && new Date(b.startAt) <= dayEnd
  )
  const close = new Date(`${date}T${String(DAY_END).padStart(2, '0')}:00:00`)
  const slots: string[] = []
  for (let h = DAY_START; h < DAY_END; h++) {
    for (let m = 0; m < 60; m += 30) {
      const start = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
      const end = new Date(start.getTime() + duration * 60000)
      if (end > close) continue
      if (!existing.some((b) => start < new Date(b.endAt) && end > new Date(b.startAt))) slots.push(start.toISOString())
    }
  }
  return slots
}

export function createBooking(input: { userId: string; staffId: string; menuId: string; startAt: string; note?: string }) {
  const db = load()
  const menu = db.menus.find((m) => m.id === input.menuId)
  if (!menu) throw new Error('メニューが見つかりません')
  const start = new Date(input.startAt)
  const end = new Date(start.getTime() + menu.duration * 60000)
  const conflict = db.bookings.some(
    (b) => b.staffId === input.staffId && b.status !== 'CANCELLED' && start < new Date(b.endAt) && end > new Date(b.startAt)
  )
  if (conflict) throw new Error('その時間帯は既に予約が入っています')
  const rec: BookingRec = {
    id: `b-${Date.now().toString(36)}`,
    userId: input.userId,
    staffId: input.staffId,
    menuId: input.menuId,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    status: 'PENDING',
    note: input.note?.trim() ? input.note : null,
    createdAt: new Date().toISOString(),
  }
  db.bookings.push(rec)
  save(db)
  return rec
}

function populate(b: BookingRec) {
  const db = load()
  return {
    ...b,
    user: db.users.find((u) => u.id === b.userId)!,
    staff: db.staff.find((s) => s.id === b.staffId)!,
    menu: db.menus.find((m) => m.id === b.menuId)!,
  }
}

export type PopulatedBooking = ReturnType<typeof populate>

export function myBookings(userId: string): PopulatedBooking[] {
  return load()
    .bookings.filter((b) => b.userId === userId)
    .sort((a, b) => b.startAt.localeCompare(a.startAt))
    .map(populate)
}

export function setBookingStatus(id: string, status: BookingStatus, userId?: string) {
  const db = load()
  const b = db.bookings.find((x) => x.id === id && (!userId || x.userId === userId))
  if (!b) throw new Error('予約が見つかりません')
  b.status = status
  save(db)
}

// ---------- 管理画面 ----------
export function adminBookings(date: string): PopulatedBooking[] {
  const from = new Date(`${date}T00:00:00`)
  const to = new Date(`${date}T23:59:59`)
  return load()
    .bookings.filter((b) => new Date(b.startAt) >= from && new Date(b.startAt) <= to)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .map(populate)
}

export function adminCustomers() {
  const db = load()
  return db.users
    .filter((u) => u.role === 'CUSTOMER')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      hasAllergy: u.hasAllergy,
      createdAt: u.createdAt,
      _count: { bookings: db.bookings.filter((b) => b.userId === u.id).length },
    }))
}

export function adminStaff(): Staff[] {
  return [...load().staff].sort((a, b) => a.name.localeCompare(b.name))
}

export function updateStaff(s: Pick<Staff, 'id' | 'name' | 'bio' | 'isActive'>) {
  const db = load()
  const target = db.staff.find((x) => x.id === s.id)
  if (!target) return
  target.name = s.name
  target.bio = s.bio
  target.isActive = s.isActive
  save(db)
}

export function sales(year: number, month: number) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  const list = load()
    .bookings.filter((b) => {
      const t = new Date(b.startAt)
      return t >= start && t < end && (b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    })
    .map(populate)
  const byStaff: Record<string, { name: string; count: number; revenue: number }> = {}
  for (const b of list) {
    const row = (byStaff[b.staffId] ??= { name: b.staff.name, count: 0, revenue: 0 })
    row.count++
    row.revenue += b.menu.price
  }
  return { total: list.reduce((sum, b) => sum + b.menu.price, 0), count: list.length, byStaff }
}

export function dashboard() {
  const db = load()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  const todayBookings = db.bookings
    .filter((b) => new Date(b.startAt) >= today && new Date(b.startAt) < tomorrow && b.status !== 'CANCELLED')
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .map(populate)
  const monthBookings = db.bookings
    .filter((b) => {
      const t = new Date(b.startAt)
      return t >= monthStart && t < monthEnd && (b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    })
    .map(populate)
  return {
    todayBookings,
    monthBookings,
    monthRevenue: monthBookings.reduce((s, b) => s + b.menu.price, 0),
    totalCustomers: db.users.filter((u) => u.role === 'CUSTOMER').length,
    pendingCount: db.bookings.filter((b) => b.status === 'PENDING').length,
  }
}
