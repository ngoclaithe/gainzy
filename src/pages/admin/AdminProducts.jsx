import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../lib/apiClient';
import { toArray } from '../../lib/normalize';
import { ShoppingBag, Plus, Pencil, Trash2, Search, Loader2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Toast from '../../components/Toast.jsx';

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function isObjectId(v) { 
  return /^[a-fA-F0-9]{24}$/.test(String(v || '').trim()); 
}

const EFFECT_OPTIONS = [
  { label: 'Tăng Cơ', icon: '/images/menu_icon_2_1.png' },
  { label: 'Giảm Mỡ', icon: '/images/menu_icon_2_2.png' },
  { label: 'Xương Khớp', icon: '/images/menu_icon_2_3.webp' },
  { label: 'Tăng Cân', icon: '/images/menu_icon_2_4.webp' },
  { label: 'Da, Tóc & Móng', icon: '/images/menu_icon_2_5.png' },
  { label: 'Bảo Vệ Gan', icon: '/images/menu_icon_2_6.png' },
  { label: 'Giấc Ngủ', icon: '/images/menu_icon_2_7.png' },
  { label: 'Hỗ Trợ Tim Mạch', icon: '/images/menu_icon_2_8.png' },
  { label: 'Kiểm Soát Đường Huyết', icon: '/images/menu_icon_2_9.png' },
];

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [toast, setToast] = useState(null);
  const [removedImages, setRemovedImages] = useState([]);

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const pages = Math.max(1, Math.ceil(total / limit));

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      const q = `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      const res = await api.products.list(q, { signal: abortControllerRef.current.signal });
      const list = toArray(res);
      const t = res?.total ?? res?.count ?? res?.pagination?.total ?? res?.data?.total ?? res?.meta?.total ?? list.length;
      setItems(list);
      setTotal(t);
    } catch (e) {
      if (e.name !== 'AbortError') {
        showToast(e.message, 'error');
      }
    } finally { 
      setLoading(false); 
    }
  }, [page, limit, search, showToast]);

  useEffect(() => { 
    fetchData(); 
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  useEffect(() => {
    (async () => {
      try {
        const [cats, brs] = await Promise.all([
          api.categories.list('?limit=1000').catch(() => []),
          api.brands.list('?limit=1000').catch(() => []),
        ]);
        setCategories(toArray(cats));
        setBrands(toArray(brs));
      } catch (e) {
        showToast('Không thể tải danh mục và thương hiệu', 'error');
      }
    })();
  }, [showToast]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  const onSearch = (e) => { 
    e.preventDefault(); 
    setSearch(searchInput);
    setPage(1);
  };

  const extractId = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val._id || val.id || '';
    return '';
  };

  const startEdit = (p) => {
    const selected = Array.isArray(p.effective) 
      ? p.effective.map((it) => it?.label).filter(Boolean) 
      : [];
    setEditing({
      ...p,
      images: toArray(p.images),
      categoryId: extractId(p.category || p.categoryId),
      brandId: extractId(p.brand || p.brandId),
      selectedEffects: selected,
    });
    setRemovedImages([]);
  };

  const closeEdit = () => { setEditing(null); setRemovedImages([]); };

  const saveEdit = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      const errors = [];
      const payload = {};

      const name = String(editing.name || '').trim();
      if (name === '') {
        errors.push('Tên sản phẩm không được để trống');
      } else {
        payload.name = name;
      }

      const description = String(editing.description || '').trim();
      if (description === '') {
        errors.push('Mô tả sản phẩm không được để trống');
      } else {
        payload.description = description;
      }

      const price = Number(editing.price);
      if (Number.isNaN(price) || price <= 0) {
        errors.push('Giá sản phẩm phải lớn hơn 0');
      } else {
        payload.price = price;
      }

      const stock = Number(editing.stock);
      if (Number.isNaN(stock) || stock < 0) {
        errors.push('Số lượng không hợp lệ');
      } else {
        payload.stock = stock;
      }

      const categoryId = extractId(editing.categoryId || editing.category);
      if (categoryId) {
        if (!isObjectId(categoryId)) {
          errors.push('Danh mục không hợp lệ');
        } else {
          payload.category = categoryId;
        }
      }

      const brandId = extractId(editing.brandId || editing.brand);
      if (brandId) {
        if (!isObjectId(brandId)) {
          errors.push('Thương hiệu không hợp lệ');
        } else {
          payload.brand = brandId;
        }
      }

      if (Array.isArray(editing.selectedEffects)) {
        const effective = editing.selectedEffects
          .map((lbl) => EFFECT_OPTIONS.find((o) => o.label === lbl))
          .filter(Boolean)
          .map((o) => ({ label: o.label, icon: o.icon }));
        if (effective.some((it) => typeof it !== 'object' || it === null || Array.isArray(it))) {
          errors.push('Mỗi phần tử trong effective phải là object hợp lệ');
        } else {
          payload.effective = effective;
        }
      }

      if (errors.length > 0) {
        showToast(errors.join(', '), 'error');
        return;
      }

      await api.products.update(editing.id, payload);

      if (removedImages.length > 0) {
        await api.products.deleteImages(editing.id, removedImages);
      }

      showToast('Cập nhật sản phẩm thành công!');
      closeEdit();
      fetchData();
    } catch (e) {
      const msg = e?.errors?.join(', ') || e.message;
      showToast(msg, 'error');
    } finally { 
      setSaving(false); 
    }
  };

  const remove = async (id) => {
    if (!confirm('Xác nhận xóa sản phẩm này?')) return;
    setDeleting(id);
    try { 
      await api.products.remove(id); 
      showToast('Xóa sản phẩm thành công!');
      fetchData(); 
    } catch (e) { 
      showToast(e.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const toggleEffect = (label) => {
    setEditing((prev) => {
      const selected = prev?.selectedEffects || [];
      const exists = selected.includes(label);
      return { 
        ...prev, 
        selectedEffects: exists 
          ? selected.filter((l) => l !== label) 
          : [...selected, label] 
      };
    });
  };

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
  };

  const removeExistingImage = (url) => {
    setEditing((prev) => ({ ...prev, images: toArray(prev.images).filter((u) => u !== url) }));
    setRemovedImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
            <p className="text-sm text-gray-500">Hiển thị, tạo, sửa, xóa</p>
          </div>
        </div>
        <Link 
          to="/admin/products/create" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" /> Tạo mới
        </Link>
      </div>

      <form onSubmit={onSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
            placeholder="Tìm theo tên (tự động sau 0.5s)..." 
            className="w-full pl-9 pr-10 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" 
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button 
          type="submit"
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Tìm
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="px-4 py-3 border-b font-medium">Tên</th>
                <th className="px-4 py-3 border-b font-medium">Giá</th>
                <th className="px-4 py-3 border-b font-medium">Tồn kho</th>
                <th className="px-4 py-3 border-b font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin inline mb-2" />
                    <div className="text-sm">Đang tải...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <div className="text-sm">Không có sản phẩm nào</div>
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-b font-medium">{p.name}</td>
                    <td className="px-4 py-3 border-b">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.stock > 10 ? 'bg-green-100 text-green-700' : 
                        p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => startEdit(p)} 
                          className="px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 inline-flex items-center gap-1 hover:bg-amber-200 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />Sửa
                        </button>
                        <button 
                          onClick={() => remove(p.id)} 
                          disabled={deleting === p.id}
                          className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 inline-flex items-center gap-1 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div className="text-sm text-gray-600">
            Tổng: <span className="font-medium">{total}</span> sản phẩm
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={limit} 
              onChange={(e) => { 
                setLimit(Number(e.target.value)); 
                setPage(1); 
              }} 
              className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {[10,20,50,100].map(n => (
                <option key={n} value={n}>{n}/trang</option>
              ))}
            </select>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Trước
            </button>
            <span className="text-sm px-2">
              <span className="font-medium">{page}</span> / {pages}
            </span>
            <button 
              disabled={page === pages} 
              onClick={() => setPage(p => Math.min(pages, p + 1))} 
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <Modal open={!!editing} onClose={closeEdit} title="Sửa sản phẩm">
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input 
                value={editing.name || ''} 
                onChange={(e) => setEditing({...editing, name: e.target.value})} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="1000"
                  value={editing.price} 
                  onChange={(e) => setEditing({...editing, price: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tồn kho <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={editing.stock} 
                  onChange={(e) => setEditing({...editing, stock: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows={4} 
                value={editing.description || ''} 
                onChange={(e) => setEditing({...editing, description: e.target.value})} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none" 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Hình ảnh đã tải lên</label>
                {Array.isArray(editing.images) && editing.images.length > 0 && (
                  <span className="text-xs text-gray-500">{editing.images.length} ảnh</span>
                )}
              </div>
              {Array.isArray(editing.images) && editing.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {editing.images.map((url, idx) => (
                    <div key={url + idx} className="relative group border rounded-lg overflow-hidden">
                      <img src={url} alt={`Image ${idx+1}`} onError={handleImageError} className="w-full h-28 object-cover" />
                      <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Xóa</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Chưa có ảnh</div>
              )}
              {removedImages.length > 0 && (
                <div className="text-xs text-red-600 mt-2">Sẽ xóa {removedImages.length} ảnh sau khi lưu.</div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select 
                  value={editing.categoryId || ''} 
                  onChange={(e) => setEditing({...editing, categoryId: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {(categories || []).map((c) => (
                    <option key={c._id || c.id || c.slug || c.name} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                <select 
                  value={editing.brandId || ''} 
                  onChange={(e) => setEditing({...editing, brandId: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {(brands || []).map((b) => (
                    <option key={b._id || b.id || b.slug || b.name} value={b._id || b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Hiệu quả sản phẩm
                  {Array.isArray(editing.selectedEffects) && editing.selectedEffects.length > 0 && (
                    <span className="ml-2 text-xs text-purple-600 font-normal">
                      ({editing.selectedEffects.length} đã chọn)
                    </span>
                  )}
                </label>
                {Array.isArray(editing.selectedEffects) && editing.selectedEffects.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setEditing({ ...editing, selectedEffects: [] })} 
                    className="text-xs px-2 py-1 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {EFFECT_OPTIONS.map((opt) => {
                  const active = (editing.selectedEffects || []).includes(opt.label);
                  return (
                    <button
                      type="button"
                      key={opt.label}
                      onClick={() => toggleEffect(opt.label)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                        active 
                          ? 'border-purple-500 bg-purple-50 shadow-sm' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <img 
                        src={opt.icon} 
                        alt={opt.label} 
                        onError={handleImageError}
                        className="w-7 h-7 rounded object-cover" 
                      />
                      <span className={`text-xs font-medium flex-1 text-left ${
                        active ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {opt.label}
                      </span>
                      {active && <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button 
                type="button"
                onClick={closeEdit} 
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={saveEdit}
                disabled={saving} 
                className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50 hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
