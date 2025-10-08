import { useEffect, useMemo, useState } from 'react';
import { Plus, FileText, Pencil, Trash2, Search, Loader2, X, Check, CalendarClock, Upload } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { toArray } from '../../lib/normalize';
import Toast from '../../components/Toast.jsx';
import { uploadImage } from '../../lib/cloudinary';

function Modal({ open, onClose, title, children, maxWidth = 'max-w-3xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = 'unset'; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function parseCommaList(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function fromDatetimeLocalValue(val) {
  if (!val) return '';
  const d = new Date(val);
  const iso = d.toISOString();
  return iso;
}

function isObjectId(v){ return /^[a-fA-F0-9]{24}$/.test(String(v||'').trim()); }

export default function AdminPosts(){
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const pages = Math.max(1, Math.ceil(total / limit));

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      const res = await api.posts.list(q);
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
      setItems(list);
      setTotal(t);
    } catch (e) {
      showToast(e.message, 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, limit, search]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const defaultPost = useMemo(() => ({
    title: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    tags: '',
    author: '',
    status: 'draft',
    publishAt: '',
    relatedPosts: '',
    isFeatured: false,
  }), []);

  const startCreate = () => { setCreating(true); setEditing({ ...defaultPost }); setFile(null); setPreview(''); };
  const startEdit = (p) => {
    setCreating(false);
    setEditing({
      id: p.id || p._id,
      title: p.title || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      thumbnail: p.thumbnail || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
      author: (p.author && (p.author._id || p.author.id)) || p.author || '',
      status: p.status || 'draft',
      publishAt: toDatetimeLocalValue(p.publishAt || p.publishedAt || p.createdAt),
      relatedPosts: Array.isArray(p.relatedPosts) ? p.relatedPosts.join(', ') : (p.relatedPosts || ''),
      isFeatured: Boolean(p.isFeatured),
    });
    setFile(null);
    setPreview(p.thumbnail || '');
  };
  const closeModal = () => { setEditing(null); setFile(null); setPreview(''); };

  const onThumbChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(editing?.thumbnail || '');
    }
  };

  const validatePayload = (data) => {
    const errors = [];
    const title = String(data.title||'').trim();
    const excerpt = String(data.excerpt||'').trim();
    const content = String(data.content||'').trim();
    const thumbnail = String(data.thumbnail||'').trim();
    const author = String(data.author||'').trim();
    const status = String(data.status||'').trim();
    const publishAt = data.publishAt ? fromDatetimeLocalValue(data.publishAt) : '';
    const tags = parseCommaList(data.tags);
    const relatedPosts = parseCommaList(data.relatedPosts);
    const isFeatured = Boolean(data.isFeatured);

    if (!title) errors.push('Tiêu đề không được để trống');
    if (!excerpt) errors.push('Tóm tắt không được để trống');
    if (!content) errors.push('Nội dung không được để trống');
    if (author && !isObjectId(author)) errors.push('Author không hợp lệ');
    if (relatedPosts.some((id) => !isObjectId(id))) errors.push('Danh sách relatedPosts có ID không hợp lệ');
    if (status && !['draft','published','archived'].includes(status)) errors.push('Trạng thái không hợp lệ');

    const payload = {
      title, excerpt, content,
      ...(thumbnail ? { thumbnail } : {}),
      ...(tags.length ? { tags } : { tags: [] }),
      ...(author ? { author } : {}),
      status: status || 'draft',
      ...(publishAt ? { publishAt } : {}),
      ...(relatedPosts.length ? { relatedPosts } : { relatedPosts: [] }),
      isFeatured,
    };

    return { errors, payload };
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { errors, payload } = validatePayload(editing);
      if (errors.length) {
        const err = new Error('Dữ liệu không hợp lệ');
        err.errors = errors; throw err;
      }

      if (file) {
        const url = await uploadImage(file);
        if (url) payload.thumbnail = url;
      }

      if (creating) await api.posts.create(payload);
      else await api.posts.update(editing.id, payload);
      closeModal();
      showToast(creating ? 'Tạo bài viết thành công!' : 'Cập nhật bài viết thành công!');
      fetchData();
    } catch (e) {
      showToast((e?.errors?.join(', ') || e.message), 'error');
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Xác nhận xóa bài viết này?')) return;
    try { await api.posts.remove(id); showToast('Xóa bài viết thành công!'); fetchData(); }
    catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
            <p className="text-sm text-gray-500">Hiển thị, tạo, sửa, xóa</p>
          </div>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium shadow">
          <Plus className="w-4 h-4" /> Tạo mới
        </button>
      </div>

      <form onSubmit={(e)=>{e.preventDefault(); setSearch(searchInput); setPage(1);}} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={searchInput} onChange={(e)=>setSearchInput(e.target.value)} placeholder="Tìm theo tiêu đề/slug..." className="w-full pl-9 pr-10 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
          {searchInput && (
            <button type="button" onClick={()=>{setSearchInput(''); setSearch('');}} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">Tìm</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="px-4 py-3 border-b font-medium">Tiêu đề</th>
                <th className="px-4 py-3 border-b font-medium">Slug</th>
                <th className="px-4 py-3 border-b font-medium">Trạng thái</th>
                <th className="px-4 py-3 border-b font-medium">Ngày xuất bản</th>
                <th className="px-4 py-3 border-b font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin inline mb-2" /><div className="text-sm">Đang tải...</div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">Chưa có bài viết</td></tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id || p._id || p.slug} className="text-sm hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium">{p.title}</td>
                    <td className="px-4 py-3 border-b text-gray-600">{p.slug}</td>
                    <td className="px-4 py-3 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (p.status||'draft') === 'published' ? 'bg-green-100 text-green-700' :
                        (p.status||'draft') === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {p.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b text-gray-600">
                      <div className="inline-flex items-center gap-1">
                        <CalendarClock className="w-4 h-4 text-gray-400" />
                        {p.publishAt ? new Date(p.publishAt).toLocaleString('vi-VN') : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(p)} className="px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 inline-flex items-center gap-1"><Pencil className="w-4 h-4" />Sửa</button>
                        <button onClick={() => remove(p.id || p._id)} className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div className="text-sm text-gray-600">Tổng: <span className="font-medium">{total}</span> bài viết</div>
          <div className="flex items-center gap-2">
            <select value={limit} onChange={(e)=>{setLimit(Number(e.target.value)); setPage(1);}} className="border rounded-lg px-3 py-1.5 text-sm">
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}/trang</option>)}
            </select>
            <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1.5 rounded-lg border disabled:opacity-50 hover:bg-gray-100">Trước</button>
            <span className="text-sm px-2"><span className="font-medium">{page}</span> / {pages}</span>
            <button disabled={page===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="px-3 py-1.5 rounded-lg border disabled:opacity-50 hover:bg-gray-100">Sau</button>
          </div>
        </div>
      </div>

      <Modal open={!!editing} onClose={closeModal} title={creating ? 'Tạo bài viết' : 'Sửa bài viết'} maxWidth="max-w-4xl">
        {editing && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input value={editing.title} onChange={(e)=>setEditing({...editing, title:e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
                <textarea rows={3} value={editing.excerpt} onChange={(e)=>setEditing({...editing, excerpt:e.target.value})} className="w-full border rounded-lg px-3 py-2 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onThumbChange}
                    className="hidden"
                    id="file-upload-thumb"
                  />
                  <label
                    htmlFor="file-upload-thumb"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-rose-500 transition-all duration-200 cursor-pointer bg-gray-50 hover:bg-rose-50 group"
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-rose-500 transition-colors mb-2" />
                        <p className="text-sm text-gray-600 group-hover:text-rose-600 font-medium">Click để tải ảnh lên</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                      </>
                    )}
                  </label>
                </div>
                {file && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Check className="w-4 h-4 text-green-500" />
                    {file.name}
                  </p>
                )}
                {!file && editing.thumbnail && (
                  <p className="text-xs text-gray-500 mt-1 break-all">URL hiện tại: {editing.thumbnail}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung (HTML)</label>
              <textarea rows={8} value={editing.content} onChange={(e)=>setEditing({...editing, content:e.target.value})} className="w-full border rounded-lg px-3 py-2 font-mono" />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (phân tách bằng dấu phẩy)</label>
                <input value={editing.tags} onChange={(e)=>setEditing({...editing, tags:e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả (ObjectId)</label>
                <input value={editing.author} onChange={(e)=>setEditing({...editing, author:e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="6704d9cbbd34b2d12f8af932" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select value={editing.status} onChange={(e)=>setEditing({...editing, status:e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="draft">Nháp</option>
                  <option value="published">Xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày xuất bản</label>
                <input type="datetime-local" value={editing.publishAt} onChange={(e)=>setEditing({...editing, publishAt:e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Post IDs (phân tách bằng dấu phẩy)</label>
                <input value={editing.relatedPosts} onChange={(e)=>setEditing({...editing, relatedPosts:e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input id="isFeatured" type="checkbox" checked={!!editing.isFeatured} onChange={(e)=>setEditing({...editing, isFeatured:e.target.checked})} />
              <label htmlFor="isFeatured" className="text-sm text-gray-700">Gắn nổi bật</label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50 inline-flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {saving ? 'Đang lưu...' : (creating ? 'Tạo bài viết' : 'Lưu thay đổi')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
