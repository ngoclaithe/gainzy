import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { toArray } from '../lib/normalize';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function Blog() {
  const q = useQuery();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(q.get('page') || 1));
  const [limit, setLimit] = useState(Number(q.get('limit') || 12));
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search.trim()) {
          params.set('search', search.trim());
        }
        const res = await api.posts.list(`?${params.toString()}`);
        const list = toArray(res);
        const tCandidates = [
          res?.total,
          res?.count,
          res?.pagination?.total,
          res?.data?.total,
          res?.data?.count,
          Array.isArray(list) ? list.length : 0,
        ];
        const t = tCandidates.find((v) => typeof v === 'number' && !Number.isNaN(v)) ?? list.length;
        if (mounted) { setItems(list); setTotal(t); }
      } catch (_) {
        if (mounted) { setItems([]); setTotal(0); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, limit, search]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
          Kiến Thức & Blog
        </h2>
      </div>

      <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 min-w-[300px] flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-base outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-transform"
          >
            Tìm
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Hiển thị:</span>
          <select 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm cursor-pointer outline-none"
          >
            {[12, 24, 36, 48].map(n => <option key={n} value={n}>{n} bài</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-lg text-gray-600">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-lg text-gray-600">
          <div className="text-5xl mb-4">📝</div>
          {search ? 'Không tìm thấy bài viết nào phù hợp' : 'Chưa có bài viết'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {items.map((p) => (
            <Link 
              key={p.slug || p._id || p.id} 
              to={`/blog/${p.slug || p._id || p.id}`}
              className="flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 no-underline text-inherit h-full"
            >
              {p.thumbnail ? (
                <div className="w-full h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900">
                  <img 
                    src={p.thumbnail} 
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-5xl">
                  📄
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-3 leading-tight line-clamp-2">
                  {p.title}
                </h3>
                
                {p.excerpt && (
                  <p className="text-gray-600 leading-relaxed flex-1 line-clamp-3 mb-4">
                    {p.excerpt}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                  {p.publishAt && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDateTime(p.publishAt)}</span>
                    </div>
                  )}
                  {p.viewCount !== undefined && (
                    <div className="flex items-center gap-2">
                      <span>👁️</span>
                      <span>{p.viewCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 p-6 bg-white rounded-xl shadow-md">
        <div className="text-sm text-gray-600">
          Tổng: <strong className="text-purple-600">{total}</strong> bài viết
        </div>
        
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-transform ${
              page === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-purple-900 text-white hover:-translate-y-0.5'
            }`}
          >
            ← Trước
          </button>
          
          <span className="px-4 py-2 font-semibold min-w-[80px] text-center">
            {page} / {pages}
          </span>
          
          <button
            disabled={page === pages}
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-transform ${
              page === pages 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-purple-900 text-white hover:-translate-y-0.5'
            }`}
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}