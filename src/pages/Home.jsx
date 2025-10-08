import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/apiClient'
import { toArray } from '../lib/normalize'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const f = await api.products.featured().catch(() => [])
        if (mounted) {
          setFeatured(toArray(f))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const placeholderImg = '/vite.svg'

  const slides = ['/images/slider_1.webp','/images/slider_2.webp','/images/slider_3.webp','/images/slider_4.webp']
  const [slideIdx, setSlideIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSlideIdx(i => (i + 1) % slides.length), 3500)
    return () => clearInterval(id)
  }, [slides.length])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>

  return (
    <>
    <div className="page-container p-6 max-w-6xl mx-auto">
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2 bg-white rounded overflow-hidden shadow relative">
            <div className="relative w-full h-96 overflow-hidden">
              <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${slideIdx * 100}%)` }}>
                {slides.map((s, i) => (
                  <img key={i} src={s} alt={`slide-${i+1}`} className="w-full h-96 object-cover flex-shrink-0" />
                ))}
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 rounded-full px-2 py-1">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setSlideIdx(i)} aria-label={`Slide ${i+1}`} className={`h-2.5 w-2.5 rounded-full ${i===slideIdx ? 'bg-white' : 'bg-white/60'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:h-96">
            {['/images/right_banner_1.webp','/images/right_banner_2.webp','/images/right_banner_3.jpg'].map((src, i) => (
              <div key={i} className="bg-white rounded overflow-hidden shadow flex-1">
                <img src={src} alt={`right-${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['/images/voucher30k.png','/images/voucher70k.png','/images/voucher100k.png','/images/voucher150k.png'].map((src, i) => (
            <div key={i} className="bg-white rounded overflow-hidden shadow p-4 flex items-center justify-center">
              <img src={src} alt={`voucher-${i+1}`} className="max-w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      </section>

      <section className="section-block -mt-2">
        <div className="bg-white rounded overflow-hidden shadow">
          <img src="/images/anhwhey.webp" alt="banner-whey" className="w-full h-56 md:h-72 object-cover" />
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title text-2xl font-semibold mb-4">WHEY PROTEIN</h2>
        <div className="flex flex-wrap gap-3">
          {['Whey protein','Protein Bar','Meal Replacements','Vegan Protein'].map((label) => (
            <Link
              key={label}
              to={`/products?category=${encodeURIComponent(label)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="mt-4 bg-white rounded overflow-hidden shadow">
          <img src="/images/bannersection1.jpg" alt="banner-section-1" className="w-full h-56 md:h-72 object-cover" />
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title text-2xl font-semibold mb-4">MASS GAINER</h2>
        <div className="flex flex-wrap gap-3">
          {['Sữa Tăng Cân','Sữa Tăng Cân Nhanh','Sữa Tăng Cân Ít Tăng Mỡ'].map((label) => (
            <Link
              key={label}
              to={`/products?category=${encodeURIComponent(label)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block -mt-2">
        <div className="bg-white rounded overflow-hidden shadow">
          <img src="/images/bannersection2.jpg" alt="banner-section-2" className="w-full h-56 md:h-72 object-cover" />
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-3">TĂNG SỨC MẠNH &amp; SỨC BỀN</h3>
          <div className="flex flex-wrap gap-3">
            {['Creatine','Pre Workout','EAA','Caffeine'].map((label) => (
              <Link
                key={label}
                to={`/products?category=${encodeURIComponent(label)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block -mt-2">
        <div className="bg-white rounded overflow-hidden shadow">
          <img src="/images/bannersection2.webp" alt="banner-section-2-webp" className="w-full h-56 md:h-72 object-cover" />
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-3">VITAMIN &amp; KHOÁNG CHẤT</h3>
          <div className="flex flex-wrap gap-3">
            {['Magnesium','Vitamin D3 K2','Vitamin Tổng Hợp','Zinc'].map((label) => (
              <Link
                key={label}
                to={`/products?category=${encodeURIComponent(label)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
