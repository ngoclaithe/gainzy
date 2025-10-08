import { useEffect, useState } from 'react';
import Toast from '../../components/Toast.jsx';
import { api } from '../../lib/apiClient';
import { Layers, Plus, Pencil, Trash2, Search, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { uploadImage } from '../../lib/cloudinary';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const pages = Math.max(1, Math.ceil(total / limit));

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const q = `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      const res = await api.categories.list(q);
      const candidates = [
  res,
  res?.items,
  res?.data,
  res?.results,
  res?.categories,
  res?.data?.items,
  res?.data?.results,
  res?.data?.categories,
];
const list = candidates.find((v) => Array.isArray(v)) || [];
const tCandidates = [
  res?.total,
  res?.count,
  res?.pagination?.total,
  res?.data?.total,
  res?.data?.count,
  Array.isArray(res) ? res.length : null,
  list.length,
];
const t = tCandidates.find((v) => typeof v === 'number' && !Number.isNaN(v)) ?? list.length;
      setItems(list);
      setTotal(t);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, limit]);

  const onSearch = (e) => { e.preventDefault(); setPage(1); fetchData(); };

  const startEdit = (c) => { setEditing({ ...c }); setFile(null); setPreview(''); };
  const closeEdit = () => { setEditing(null); setFile(null); setPreview(''); };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null; setFile(f);
    if (f) { const reader = new FileReader(); reader.onloadend = () => setPreview(reader.result); reader.readAsDataURL(f); } else setPreview('');
  };

  const saveEdit = async () => {
    const id = editing?.id || editing?._id;
    if (!id) return;
    setSaving(true);
    try {
      await api.categories.update(id, { name: (editing.name || '').trim() });
      if (file) {
        const url = await uploadImage(file);
        await api.categories.updateImage(id, url);
      }
      closeEdit();
      fetchData();
    } catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  };

  const remove = async (id) => { if (!confirm('Xác nhận xóa danh mục này?')) return; try { await api.categories.remove(id); fetchData(); showToast('Xóa danh mục thành công!'); } catch (e) { showToast(e.message, 'error'); } };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
            <p className="text-sm text-gray-500">Hiển thị, tạo, sửa, xóa</p>
          </div>
        </div>
        <Link to="/admin/categories/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium shadow">
          <Plus className="w-4 h-4" /> Tạo mới
        </Link>
      </div>

      <form onSubmit={onSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên..." className="w-full pl-9 pr-3 py-2 rounded-lg border" />
        </div>
        <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">Tìm</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="px-4 py-3 border-b">Tên</th>
                <th className="px-4 py-3 border-b">Slug</th>
                <th className="px-4 py-3 border-b">Hình ảnh</th>
                <th className="px-4 py-3 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
              ) : !Array.isArray(items) || items.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Không có dữ liệu</td></tr>
              ) : (
                (Array.isArray(items) ? items : []).map((c) => (
                  <tr key={c.id || c._id || c.slug || c.name} className="text-sm">
                    <td className="px-4 py-3 border-b">{c.name}</td>
                    <td className="px-4 py-3 border-b">{c.slug}</td>
                    <td className="px-4 py-3 border-b">
                      {c.image ? <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded" /> : <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(c)} className="px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 inline-flex items-center gap-1"><Pencil className="w-4 h-4" />Sửa</button>
                        <button onClick={() => remove(c.id || c._id)} className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-gray-500">Tổng: {total}</div>
          <div className="flex items-center gap-2">
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded-lg px-2 py-1 text-sm">
              {[10,20,50].map(n => <option key={n} value={n}>{n}/trang</option>)}
            </select>
            <button disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1.5 rounded-lg border disabled:opacity-50">Trước</button>
            <span className="text-sm">{page}/{pages}</span>
            <button disabled={page===pages} onClick={() => setPage(p => Math.min(pages, p+1))} className="px-3 py-1.5 rounded-lg border disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>

      <Modal open={!!editing} onClose={closeEdit} title="Sửa danh mục">
        {editing && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Tên</label>
              <input value={editing.name} onChange={(e)=>setEditing({...editing, name:e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Slug</label>
              <input value={editing.slug} onChange={(e)=>setEditing({...editing, slug:e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Hình ảnh</label>
              <div className="flex items-center gap-3">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                ) : editing.image ? (
                  <img src={editing.image} alt={editing.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                )}
                <input type="file" accept="image/*" onChange={onFileChange} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={closeEdit} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={saveEdit} disabled={saving} className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
