import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/apiClient'
import { toArray } from '../lib/normalize'

export default function NavBar() {
  const { user, logout } = useAuth()
  const [progress, setProgress] = useState(0)
  const headerRef = useRef(null)
  const [cartCount, setCartCount] = useState(0)

  const marqueeMsgs = useMemo(() => ([
    'FREESHIP TOÀN QUỐC CHO ĐƠN HÀNG TỪ 1.500.000Đ',
    'NHẬP CODE: GS30 - GS70 - GS100 giảm trực tiếp 30K - 70K - 100K',
    'ĐỔI TRẢ MIỄN PHÍ 15 NGÀY',
    'THƯƠNG HIỆU SUPPLEMENTS UY TÍN TỪ 2011',
    'CAM KẾT CHUẨN 100% CHÍNH HÃNG',
    'GIAO HÀNG NỘI THÀNH SIÊU TỐC 1 - 4H',
  ]), [])

  const [categories, setCategories] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.categories.list()
        if (mounted) setCategories(toArray(res))
      } catch (_) {
        if (mounted) setCategories([])
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const onCount = (e) => setCartCount(Number(e.detail) || 0)
    window.addEventListener('cart:count', onCount)
    return () => window.removeEventListener('cart:count', onCount)
  }, [])

  useEffect(() => {
    if (user) {
      api.cart.get().catch(() => {})
    } else {
      setCartCount(0)
    }
  }, [user])

  const goalsMenu = [
    { label: 'Tăng Cơ', icon: '/images/menu_icon_2_1.png' },
    { label: 'Giảm Mỡ', icon: '/images/menu_icon_2_2.png' },
    { label: 'Xương Khớp', icon: '/images/menu_icon_2_3.webp' },
    { label: 'Tăng Cân', icon: '/images/menu_icon_2_4.webp' },
    { label: 'Da, Tóc & Móng', icon: '/images/menu_icon_2_5.png' },
    { label: 'Bảo Vệ Gan', icon: '/images/menu_icon_2_6.png' },
    { label: 'Giấc Ngủ', icon: '/images/menu_icon_2_7.png' },
    { label: 'Hỗ Trợ Tim Mạch', icon: '/images/menu_icon_2_8.png' },
    { label: 'Kiểm Soát Đường Huyết', icon: '/images/menu_icon_2_9.png' },
  ]

  const [supplementsOpen, setSupplementsOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const supRef = useRef(null)
  const goalsRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
      setProgress(pct)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const updateOffset = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty('--nav-height', `${headerRef.current.offsetHeight}px`)
      }
    }
    updateOffset()
    window.addEventListener('resize', updateOffset)
    return () => {
      window.removeEventListener('resize', updateOffset)
      document.documentElement.style.removeProperty('--nav-height')
    }
  }, [])

  useEffect(() => {
    if (headerRef.current) {
      document.documentElement.style.setProperty('--nav-height', `${headerRef.current.offsetHeight}px`)
    }
  }, [user])

  useEffect(() => {
    const onDocClick = (e) => {
      if (supRef.current && !supRef.current.contains(e.target)) setSupplementsOpen(false)
      if (goalsRef.current && !goalsRef.current.contains(e.target)) setGoalsOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const imgFallback = (e) => {
    const t = e.currentTarget
    t.onerror = null
    t.src = '/images/gainzy.png'
  }

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-[120] w-full isolation-auto">
      <div className="bg-slate-950/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-r from-rose-700 via-orange-600 to-amber-500 text-white shadow-[0_18px_48px_rgba(0,0,0,0.38)]">
            <div className="absolute left-0 top-0 h-1 bg-gradient-to-r from-lime-200 via-emerald-200 to-sky-300" style={{ width: `${progress}%` }} />

            <div className="flex flex-col gap-3 px-6 py-3">
              <div className="relative overflow-hidden rounded-full border border-white/20 bg-white/15 backdrop-blur-sm">
                <div className="marquee whitespace-nowrap py-1.5 text-xs font-semibold tracking-wide uppercase">
                  {[...marqueeMsgs, ...marqueeMsgs].map((m, i) => (
                    <span key={i} className="mx-6 opacity-90">{m}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <Link to="/" className="flex items-center gap-3 pr-6">
                  <img src="/images/gainzy.png" alt="Gainzy" className="h-12 w-auto rounded-xl border border-white/20 bg-white/15 p-1.5 shadow" />
                  <span className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-white uppercase">GAINZY</span>
                </Link>

                <div className="min-w-[240px] flex-1">
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Tìm kiếm..."
                      className="w-full rounded-full border border-white/10 bg-white/95 py-2.5 pl-4 pr-32 text-gray-900 shadow-sm transition focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-slate-800 active:scale-[0.97]">
                      Tìm
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/cart"
                    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                    aria-label="Giỏ hàng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                      <path d="M7 18a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM3 4h2l3.6 7.59-1.35 2.44A1.99 1.99 0 008 17h10v-2H8.42a.25.25 0 01-.22-.37L9.1 12h7.45a2 2 0 001.79-1.11l3.58-7.16A1 1 0 0021 2H5.21l-.94-2H1v2h2z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[11px] leading-[18px] text-white text-center font-bold shadow">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="border-b border-slate-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
        <div className="mx-auto max-w-6xl px-4">
          <ul className="flex flex-wrap items-center gap-3 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
            <li
              ref={supRef}
              className="relative group"
              onMouseEnter={() => setSupplementsOpen(true)}
              onMouseLeave={() => setSupplementsOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => setSupplementsOpen((v) => !v)}
                aria-expanded={supplementsOpen}
              >
                Thực Phẩm Bổ Sung
              </button>
              <div className={`absolute left-0 mt-3 ${supplementsOpen ? 'block' : 'hidden'} min-w-[340px] rounded-xl border border-slate-200 bg-white text-gray-800 shadow-2xl group-hover:block group-focus-within:block z-[130]`}>
                <ul className="grid grid-cols-1 divide-y divide-slate-100 p-3">
                  {categories.map((c) => (
                    <li key={c._id || c.id || c.slug || c.name}>
                      <Link
                        to={`/${c.slug}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
                      >
                        <img src={c.image} onError={imgFallback} alt={c.name} className="h-8 w-8 object-contain" />
                        <span className="text-sm font-medium capitalize text-slate-700">{c.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li
              ref={goalsRef}
              className="relative group"
              onMouseEnter={() => setGoalsOpen(true)}
              onMouseLeave={() => setGoalsOpen(false)}
            >
              <button
                type="button"
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
                onClick={() => setGoalsOpen((v) => !v)}
                aria-expanded={goalsOpen}
              >
                Mục Tiêu & Nhu Cầu
              </button>
              <div className={`absolute left-0 mt-3 ${goalsOpen ? 'block' : 'hidden'} min-w-[340px] rounded-xl border border-slate-200 bg-white text-gray-800 shadow-2xl group-hover:block group-focus-within:block z-[130]`}>
                <ul className="grid grid-cols-1 divide-y divide-slate-100 p-3">
                  {goalsMenu.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        to={`/products?effect=${encodeURIComponent(item.label)}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
                      >
                        <img src={item.icon} onError={imgFallback} alt={item.label} className="h-8 w-8 object-contain" />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li>
              <Link
                to="/brands"
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
              >
                Thương Hiệu
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
              >
                Kiến Thức
              </Link>
            </li>
            <li>
              <Link
                to="/tinh-bmi-online"
                className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
              >
                Công Cụ
              </Link>
            </li>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <li>
                    <Link
                      to="/admin"
                      className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
                    >
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/profile"
                    className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
                    title={user.email}
                  >
                    Tài khoản
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
                  >
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-amber-600"
                >
                  Đăng Nhập
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}
