import { useState } from 'react';
import { api } from '../../lib/apiClient';
import { uploadImage } from '../../lib/cloudinary';
import { Package, Upload, Loader2, Check } from 'lucide-react';

export default function AdminCreateBrand() {
  const [form, setForm] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const errors = [];
      const name = (form.name || '').trim();
      const description = (form.description || '').trim();

      if (!name) {
        errors.push('Tên thương hiệu không được để trống');
      } else if (name.length < 2) {
        errors.push('Tên thương hiệu phải có ít nhất 2 ký tự');
      } else if (name.length > 100) {
        errors.push('Tên thương hiệu không được vượt quá 100 ký tự');
      }

      if (description && description.length > 500) {
        errors.push('Mô tả không được vượt quá 500 ký tự');
      }

      if (errors.length > 0) {
        const error = new Error('Dữ liệu không hợp lệ');
        error.errors = errors;
        throw error;
      }

      let imageUrl = '';
      if (file) imageUrl = await uploadImage(file);

      const payload = {
        name,
        ...(description ? { description } : {}),
        ...(imageUrl ? { image: imageUrl.trim() } : {}),
      };

      await api.brands.create(payload);

      setSuccess(true);
      setForm({ name: '', description: '' });
      setFile(null);
      setPreview('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err?.errors?.join(', ') || err.message || 'Đã xảy ra lỗi';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Tạo Thương Hiệu Mới
          </h1>
          <p className="text-gray-600">Thêm thương hiệu mới vào hệ thống của bạn</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <p className="text-green-800 font-medium">Tạo thương hiệu thành công! 🎉</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tên Thương Hiệu
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="Nhập tên thương hiệu..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Mô tả (tùy chọn)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Nhập mô tả thương hiệu (tối đa 500 ký tự)..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 bg-white min-h-[100px] resize-y"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">Tối đa 500 ký tự</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Hình Ảnh
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-all duration-200 cursor-pointer bg-gray-50 hover:bg-indigo-50 group"
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                      <p className="text-sm text-gray-600 group-hover:text-indigo-600 font-medium">
                        Click để tải ảnh lên
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                    </>
                  )}
                </label>
              </div>
              {file && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Tạo Thương Hiệu
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
