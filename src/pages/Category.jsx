import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { toArray } from '../lib/normalize';

function currency(v) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v || 0));
}

export default function Category() {
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [minPrice, setMinPrice] = useState(100000);
  const [sort, setSort] = useState('-price');

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const params = useMemo(() => ({ page, limit, minPrice, sort }), [page, limit, minPrice, sort]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.categories.productsBySlug(slug, params);
      const cat = res?.data?.category || res?.category || null;
      const prods = toArray(res);
      const pg = res?.data?.pagination || res?.pagination || {};
      setCategory(cat);
      setItems(prods);
      setTotal(pg.total || prods.length || 0);
      setTotalPages(pg.totalPages || 1);
    } catch (e) {
      setError(e?.message || 'Lỗi tải dữ liệu');
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [slug, params]);

  useEffect(() => { setPage(1); }, [slug]);

  useEffect(() => {
    let active = true;
    (async () => {
      await fetchData();
    })();
    return () => { active = false; };
  }, [fetchData]);

  const onApplyPrice = () => {
    setPage(1);
    fetchData();
  };

  const onChangeSort = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const gotoPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="page-container mx-auto max-w-6xl px-4 py-6">
      {/* Category header */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          {category?.image && (
            <img
              src={category.image}
              alt={category?.name}
              className="h-16 w-16 rounded-xl object-contain ring-1 ring-slate-200"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            />
          )}
          <div>
            <h1 className="m-0 text-2xl font-extrabold tracking-tight text-slate-800">{category?.name || 'Danh mục'}</h1>
            {category?.description && (
              <p className="mt-1 text-sm text-slate-600">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters bar (in-page only) */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Sắp xếp</label>
          <select
            value={sort}
            onChange={onChangeSort}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="-price">Giá cao → thấp</option>
            <option value="price">Giá thấp → cao</option>
            <option value="-createdAt">Mới nhất</option>
            <option value="createdAt">Cũ hơn</option>
          </select>
        </div>

        <div className="hidden h-6 w-px self-stretch sm:block bg-slate-200" />

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Giá tối thiểu</label>
          <input
            type="number"
            min={0}
            step={50000}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') onApplyPrice(); }}
            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          <button
            onClick={onApplyPrice}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Áp dụng
          </button>
        </div>

        <div className="hidden h-6 w-px self-stretch sm:block bg-slate-200" />

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Hiển thị</label>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={36}>36</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-slate-600">{total} sản phẩm</div>
      </div>

      {/* Content */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="h-40 bg-slate-200" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <Link
              key={p.id || p._id}
              to={`/products/${p.id || p._id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {Array.isArray(p.images) && p.images[0] && (
                <div className="relative">
                  <img
                    className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                  />
                  {p.discount > 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-1 text-xs font-bold text-white shadow">-{p.discount}%</span>
                  )}
                </div>
              )}
              <div className="p-3">
                <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-800">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-slate-900">{currency(p.finalPrice ?? p.price)}</span>
                  {p.discount > 0 && (
                    <span className="text-xs text-slate-400 line-through">{currency(p.price)}</span>
                  )}
                </div>
                {typeof p.rating === 'number' && (
                  <div className="mt-1 text-xs text-amber-600">⭐ {p.rating?.toFixed?.(1) ?? p.rating}/5 • {p.numReviews || 0} đánh giá</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => gotoPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const idx = i + 1;
            const active = idx === page;
            return (
              <button
                key={idx}
                onClick={() => gotoPage(idx)}
                className={`${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} rounded-lg border border-slate-300 px-3 py-2 text-sm`}
              >
                {idx}
              </button>
            );
          })}
          <button
            onClick={() => gotoPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
