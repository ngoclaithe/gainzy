import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { toArray } from '../lib/normalize';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Products() {
  const q = useQuery();
  const location = useLocation();

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
      const effect = q.get('effect');
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', String(limit));
      query.set('sort', sort);
      if (minPrice != null) query.set('minPrice', String(minPrice));
      if (q.get('category')) query.set('category', q.get('category'));
      if (q.get('keyword')) query.set('keyword', q.get('keyword'));

      let res;
      if (effect) {
        res = await api.products.byEffect(effect, `?${query.toString()}`);
      } else {
        res = await api.products.list(`?${query.toString()}`);
      }

      const prods = toArray(res);
      const pg = res?.data?.pagination || res?.pagination || {};
      setItems(prods);
      setTotal(pg.total || prods.length || 0);
      setTotalPages(pg.totalPages || 1);
    } catch (e) {
      setError(e?.message || 'Không thể tải danh sách sản phẩm');
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [q, params]);

  useEffect(() => { setPage(1); }, [q.get('effect')]);

  useEffect(() => {
    let active = true;
    (async () => { await fetchData(); })();
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

  const getCategorySlug = (category) => {
    if (!category) return 'uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.slug) return category.slug;
    if (typeof category === 'object' && category.name) return category.name.toLowerCase().replace(/\s+/g, '-');
    return 'uncategorized';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const effectLabel = q.get('effect');

  return (
    <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="m-0 text-2xl font-extrabold tracking-tight text-slate-800">
              {effectLabel ? `Mục tiêu: ${effectLabel}` : 'Tất cả sản phẩm'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">Khám phá bộ sưu tập sản phẩm của chúng tôi</p>
          </div>
        </div>
      </div>

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

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có sản phẩm nào</h3>
          <p className="text-gray-500">Hiện không có sản phẩm phù hợp với tìm kiếm của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((p) => (
            <Link
              key={p.id || p._id}
              to={`/products/${p.id || p._id}${location.search || ''}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                {Array.isArray(p.images) && p.images[0] ? (
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-sm">Không có ảnh</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
                  {p.name}
                </h3>
                <p className="text-lg font-bold text-primary-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(p.price || 0)}
                </p>

                {p.originalPrice && p.originalPrice > p.price && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 line-through">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(p.originalPrice)}
                    </span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    #{getCategorySlug(p.category)}
                  </span>
                  <button
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Add to cart:', p.id || p._id);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

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
