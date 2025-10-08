import { useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { toArray } from '../lib/normalize';

export default function Brand() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.brands.list();
        const list = toArray(res);
        if (active) setItems(list);
      } catch (e) {
        if (active) {
          setItems([]);
          setError(e?.message || 'Lỗi tải danh sách thương hiệu');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.style.visibility = 'hidden';
  };

  return (
    <div className="page-container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-slate-800">Thương hiệu</h1>
        <p className="mt-1 text-sm text-slate-600">Khám phá các thương hiệu chất lượng tại Gainzy</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="h-28 bg-slate-200" />
              <div className="p-3">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((b) => (
            <div key={b._id || b.id || b.slug || b.name} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              {b.image && (
                <div className="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <img src={b.image} alt={b.name} onError={onImgError} className="max-h-24 w-auto object-contain" loading="lazy" />
                </div>
              )}
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-800">{b.name}</div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
