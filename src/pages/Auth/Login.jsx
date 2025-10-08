import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const me = await login(email, password);
      if (me?.role === 'admin') navigate('/admin/products/create');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <img src="/images/gainzy.png" alt="Gainzy" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Gainzy</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-800">Đăng nhập</h2>
            <p className="text-gray-500 text-sm mt-2">Chào mừng bạn trở lại!</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Email field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                  required 
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(s => !s)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button 
              disabled={submitting} 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/80 text-xs mt-6">
          © 2025 Gainzy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
