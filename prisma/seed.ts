import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' })
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config()

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const staffData = [
    { name: 'Yuki', bio: 'ネイルアート歴10年。トレンドデザインが得意です。', imageUrl: '/images/staff/yuki.jpg' },
    { name: 'Hana', bio: 'ケアとジェルネイルのスペシャリスト。丁寧な施術が好評。', imageUrl: '/images/staff/hana.jpg' },
    { name: 'Mio', bio: 'アート系デザインが得意。個性的なネイルを提供します。', imageUrl: '/images/staff/mio.jpg' },
    { name: 'Saki', bio: '速くて丁寧。シンプルからグラデーションまで対応。', imageUrl: '/images/staff/saki.jpg' },
  ]

  const staff = []
  for (const s of staffData) {
    const created = await prisma.staff.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    })
    staff.push(created)
  }

  const menuData = [
    { name: 'ワンカラー（手）', price: 5500, duration: 60, category: 'ジェルネイル', description: 'シンプルで清潔感のあるワンカラーネイル。' },
    { name: 'フレンチネイル（手）', price: 7700, duration: 90, category: 'ジェルネイル', description: '定番のフレンチデザイン。上品な仕上がり。' },
    { name: 'グラデーション（手）', price: 8800, duration: 90, category: 'ジェルネイル', description: '自然なグラデーションで指先を美しく。' },
    { name: 'ネイルアート（手）', price: 11000, duration: 120, category: 'ネイルアート', description: 'オリジナルデザインのネイルアート。ご要望に合わせます。' },
    { name: 'ストーンデコ（手）', price: 9900, duration: 90, category: 'ネイルアート', description: 'キラキラのストーンを使った華やかなデザイン。' },
    { name: 'ワンカラー（足）', price: 4400, duration: 60, category: 'フットネイル', description: 'フットのワンカラーネイル。サンダルシーズンに。' },
    { name: 'フットアート（足）', price: 6600, duration: 90, category: 'フットネイル', description: 'フット用のオリジナルアートデザイン。' },
    { name: 'オフのみ', price: 2200, duration: 30, category: 'ケア', description: '付け替え不要の方向けジェルオフ。' },
    { name: 'ハンドケア', price: 3300, duration: 30, category: 'ケア', description: 'キューティクルケア＋保湿トリートメント。' },
    { name: 'ブライダルパッケージ', price: 22000, duration: 180, category: 'スペシャル', description: '結婚式向け手足フルセット。カウンセリング込み。' },
  ]

  for (const m of menuData) {
    await prisma.menu.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    })
  }

  const adminHash = await bcrypt.hash('admin1234', 10)
  await prisma.user.upsert({
    where: { email: 'admin@principal.jp' },
    update: {},
    create: {
      name: 'オーナー',
      email: 'admin@principal.jp',
      password: adminHash,
      role: Role.OWNER,
    },
  })

  const testHash = await bcrypt.hash('test1234', 10)
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'テストユーザー',
      email: 'test@example.com',
      password: testHash,
      phone: '090-0000-0000',
      role: Role.CUSTOMER,
    },
  })

  console.log('Seed completed!')
  console.log(`Staff: ${staff.length}`)
  console.log(`Menus: ${menuData.length}`)
  console.log('Admin: admin@principal.jp / admin1234')
  console.log('Test:  test@example.com / test1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
