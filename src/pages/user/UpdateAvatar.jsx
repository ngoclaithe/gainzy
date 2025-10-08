import { useState, useEffect } from 'react';
import { Upload, Camera, User, Check, X, FileImage, Mail, Shield, Calendar, Lock } from 'lucide-react';
import Toast from '../../components/Toast.jsx';
import { api } from '../../lib/apiClient';
import { uploadImage } from '../../lib/cloudinary';

export default function UpdateAvatar() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.auth.me();
        const user = response.data || response;
        setUserInfo(user);
      } catch (err) {
        setError('Không thể tải thông tin người dùng');
        console.error('Failed to fetch user info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    
    if (!selectedFile.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      if (!file) throw new Error('Vui lòng chọn ảnh');
      
      const url = await uploadImage(file);
      // Use updateProfile API to update avatar field
      await api.users.updateProfile({ avatar: url });

      showToast('Cập nhật avatar thành công!');
      setFile(null);
      setPreview(null);

      const response = await api.auth.me();
      const user = response.data || response;
      setUserInfo(user);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setPreview(null);
    setError('');
  };

  const resetPwdForm = () => {
    setOldPassword('');
    setNewPassword1('');
    setNewPassword2('');
    setPwdError('');
    setPwdSuccess('');
  };

  const submitChangePassword = async () => {
    setPwdError('');
    setPwdSuccess('');
    if (!oldPassword) return setPwdError('Vui lòng nhập mật khẩu cũ');
    if (!newPassword1 || !newPassword2) return setPwdError('Vui lòng nhập mật khẩu mới ở cả 2 ô');
    if (newPassword1 !== newPassword2) return setPwdError('Mật khẩu mới không khớp');
    if (newPassword1.length < 6) return setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự');

    setPwdSubmitting(true);
    try {
      await api.users.changePassword({ oldPassword, newPassword: newPassword1 });
      setPwdSuccess('Đổi mật khẩu thành công');
      showToast('Đổi mật khẩu thành công');
      resetPwdForm();
      setShowPwdModal(false);
    } catch (err) {
      setPwdError(err?.message || 'Không thể đổi mật khẩu');
    } finally {
      setPwdSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin và avatar của bạn</p>
          <div className="mt-3">
            <a href="/profile/orders" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm">Quản lý đơn hàng</a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-100">
              Thông tin tài khoản
            </h2>

            {userInfo ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                      {userInfo.avatar ? (
                        <img 
                          src={userInfo.avatar} 
                          alt={userInfo.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{userInfo.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">ID: {userInfo._id}</p>
                    <div className="mt-3">
                      <button
                        onClick={() => setShowPwdModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
                      >
                        <Lock className="w-4 h-4" />
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-base font-semibold text-gray-800">{userInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vai trò</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-gray-800 capitalize">{userInfo.role}</p>
                        {userInfo.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Không hoạt động
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Ngày tạo tài khoản</p>
                      <p className="text-base font-semibold text-gray-800">{formatDate(userInfo.createdAt)}</p>
                    </div>
                  </div>

                  {userInfo.updatedAt && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Cập nhật lần cuối</p>
                        <p className="text-base font-semibold text-gray-800">{formatDate(userInfo.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Không thể tải thông tin người dùng</p>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-100">
                Đổi avatar
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {!preview ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Kéo thả ảnh
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      hoặc click chọn
                    </p>
                    <p className="text-xs text-gray-400">
                      Max 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="aspect-square rounded-xl overflow-hidden border-4 border-gray-200">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={cancelUpload}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {file && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <FileImage className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-gray-400 flex-shrink-0">
                        ({(file.size / 1024).toFixed(0)}KB)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={onSubmit}
                      disabled={submitting}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="text-sm">Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Cập nhật</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelUpload}
                      className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
                      disabled={submitting}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showPwdModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => { setShowPwdModal(false); resetPwdForm(); }} />
            <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-lg z-[210]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
                <button onClick={() => { setShowPwdModal(false); resetPwdForm(); }} className="p-1 rounded hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pwdError && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded">{pwdError}</div>}
              {pwdSuccess && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded">{pwdSuccess}</div>}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword1}
                    onChange={(e) => setNewPassword1(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Nhập lại mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={submitChangePassword}
                    disabled={pwdSubmitting}
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
                  >
                    {pwdSubmitting ? 'Đang xử lý...' : 'Lưu'}
                  </button>
                  <button
                    onClick={() => { setShowPwdModal(false); resetPwdForm(); }}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                    disabled={pwdSubmitting}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
