import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [menus, staff] = await Promise.all([
    prisma.menu.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
    prisma.staff.findMany({ where: { isActive: true } }),
  ])

  const categories = [...new Set(menus.map((m) => m.category))]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
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
      <section className="bg-gradient-to-br from-rose-50 to-stone-100 py-24 px-4 text-center">
        <p className="text-rose-600 text-sm tracking-widest mb-4">NAIL SALON</p>
        <h1 className="text-5xl font-bold mb-6 text-stone-800 tracking-widest">Principal</h1>
        <p className="text-stone-600 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          あなたの指先に、上質なひとときを。<br />
          オンラインで24時間かんたん予約。
        </p>
        <Link
          href="/booking"
          className="inline-block bg-rose-700 text-white px-8 py-3 rounded-full text-lg hover:bg-rose-800 transition-colors shadow-sm"
        >
          今すぐ予約する
        </Link>
      </section>

      {/* Menus */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full">
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
                    className="bg-white rounded-xl p-5 border border-stone-100 shadow-sm flex justify-between items-start"
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
            className="inline-block bg-rose-700 text-white px-8 py-3 rounded-full hover:bg-rose-800 transition-colors"
          >
            予約する
          </Link>
        </div>
      </section>

      {/* Staff */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-stone-800">スタッフ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {staff.map((s) => (
              <div key={s.id} className="text-center">
                <div className="w-20 h-20 rounded-full bg-rose-100 mx-auto mb-3 flex items-center justify-center text-2xl text-rose-400 font-bold">
                  {s.name[0]}
                </div>
                <p className="font-semibold text-stone-800">{s.name}</p>
                {s.bio && <p className="text-stone-500 text-xs mt-1 leading-relaxed">{s.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-400 text-sm py-8 px-4 text-center mt-auto">
        <p className="font-bold text-stone-200 tracking-widest mb-2">PRINCIPAL</p>
        <p>© 2024 Principal Nail Salon. All rights reserved.</p>
      </footer>
    </div>
  )
}
