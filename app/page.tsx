import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1600&q=80'
const SALON_IMAGE = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80'
const STAFF_BG   = 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80'

export default async function HomePage() {
  const [menus, staff] = await Promise.all([
    prisma.menu.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
    prisma.staff.findMany({ where: { isActive: true } }),
  ])

  const categories = [...new Set(menus.map((m) => m.category))]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-widest text-rose-800">
            PRINCIPAL
          </Link>
          <nav className="flex gap-4 items-center text-sm">
            <Link href="/auth" className="text-stone-600 hover:text-stone-900">ログイン</Link>
            <Link
              href="/booking"
              className="bg-rose-700 text-white px-4 py-2 rounded-full hover:bg-rose-800 transition-colors"
            >
              予約する
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[560px] md:h-[680px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="ネイルサロン施術"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-4">
          <p className="text-rose-300 text-sm tracking-[0.3em] mb-4 uppercase">Nail Salon</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white tracking-widest drop-shadow-lg">
            Principal
          </h1>
          <p className="text-white/90 text-lg mb-10 max-w-md mx-auto leading-relaxed drop-shadow">
            あなたの指先に、上質なひとときを。<br />
            オンラインで24時間かんたん予約。
          </p>
          <Link
            href="/booking"
            className="inline-block bg-rose-600 text-white px-10 py-3.5 rounded-full text-lg hover:bg-rose-700 transition-colors shadow-lg"
          >
            今すぐ予約する
          </Link>
        </div>
      </section>

      {/* Salon intro banner */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="text-rose-600 text-xs tracking-widest mb-3 uppercase">About Principal</p>
            <h2 className="text-2xl font-bold text-stone-800 mb-4 leading-snug">
              心地よい空間で、<br />丁寧な施術をご提供します
            </h2>
            <p className="text-stone-500 leading-relaxed text-sm">
              プリンシパルは、上質な素材と確かな技術で<br />
              お客様の指先を美しく彩るネイルサロンです。<br />
              ご予約はオンラインで24時間受け付けています。
            </p>
          </div>
          <div className="flex-1 relative w-full h-56 md:h-64 rounded-2xl overflow-hidden shadow-md">
            <Image
              src={SALON_IMAGE}
              alt="サロンイメージ"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-rose-900/10" />
          </div>
        </div>
      </section>

      {/* Menus */}
      <section className="bg-stone-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-rose-600 text-xs tracking-widest text-center mb-2 uppercase">Menu</p>
          <h2 className="text-2xl font-bold text-center mb-10 text-stone-800">メニュー</h2>
          {categories.map((cat) => (
            <div key={cat} className="mb-10">
              <h3 className="text-base font-semibold mb-4 text-rose-700 border-b border-rose-100 pb-2">
                {cat}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menus
                  .filter((m) => m.category === cat)
                  .map((menu) => (
                    <div
                      key={menu.id}
                      className="bg-white rounded-xl p-5 border border-stone-100 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-semibold text-stone-800">{menu.name}</p>
                        {menu.description && (
                          <p className="text-stone-500 text-sm mt-1">{menu.description}</p>
                        )}
                        <p className="text-stone-400 text-xs mt-2">所要時間 {menu.duration}分</p>
                      </div>
                      <p className="text-rose-700 font-bold whitespace-nowrap ml-4">
                        ¥{menu.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          <div className="text-center mt-8">
            <Link
              href="/booking"
              className="inline-block bg-rose-700 text-white px-8 py-3 rounded-full hover:bg-rose-800 transition-colors shadow-sm"
            >
              予約する
            </Link>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="relative py-20 px-4 overflow-hidden">
        <Image
          src={STAFF_BG}
          alt="スタッフ背景"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/88" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-rose-600 text-xs tracking-widest text-center mb-2 uppercase">Staff</p>
          <h2 className="text-2xl font-bold text-center mb-10 text-stone-800">スタッフ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {staff.map((s) => (
              <div key={s.id} className="text-center">
                <div className="w-20 h-20 rounded-full bg-rose-100 mx-auto mb-3 flex items-center justify-center text-2xl text-rose-500 font-bold shadow-sm">
                  {s.name[0]}
                </div>
                <p className="font-semibold text-stone-800">{s.name}</p>
                {s.bio && <p className="text-stone-500 text-xs mt-1 leading-relaxed">{s.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-rose-700 py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">ご予約はオンラインで</h2>
        <p className="text-rose-100 mb-8 text-sm">24時間いつでもかんたんにご予約いただけます</p>
        <Link
          href="/booking"
          className="inline-block bg-white text-rose-700 font-bold px-10 py-3.5 rounded-full hover:bg-rose-50 transition-colors shadow"
        >
          今すぐ予約する
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-sm py-10 px-4 text-center">
        <p className="font-bold text-white tracking-widest mb-2 text-lg">PRINCIPAL</p>
        <p className="mb-1">〒000-0000 東京都○○区○○ 1-2-3</p>
        <p className="mb-4">TEL: 00-0000-0000　営業時間: 10:00〜20:00（月曜定休）</p>
        <p>© 2024 Principal Nail Salon. All rights reserved.</p>
      </footer>
    </div>
  )
}
