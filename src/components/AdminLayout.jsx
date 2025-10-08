import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Package,
  Layers,
  ShoppingBag,
  Home,
  LogOut,
  ChevronLeft,
  Sparkles,
  Receipt,
  FileText
} from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin', icon: Sparkles, label: 'Dashboard', short: 'Dashboard', color: 'indigo' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Quản lý sản phẩm', short: 'Sản phẩm', color: 'violet' },
    { path: '/admin/categories', icon: Layers, label: 'Quản lý danh mục', short: 'Danh mục', color: 'teal' },
    { path: '/admin/brands', icon: Package, label: 'Quản lý thương hiệu', short: 'Thương hiệu', color: 'blue' },
    { path: '/admin/orders', icon: Receipt, label: 'Quản lý đơn hàng', short: 'Đơn hàng', color: 'emerald' },
    { path: '/admin/posts', icon: FileText, label: 'Quản lý bài viết', short: 'Bài viết', color: 'rose' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <aside 
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out z-40 border-r border-white/10 shadow-2xl ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        <div className="px-4 py-6 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Admin Panel</h1>
                  <p className="text-xs text-gray-400">Quản lý hệ thống</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors mx-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <div className={`${sidebarOpen ? 'px-3' : 'px-0'} py-2`}>
            {sidebarOpen && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản lý</p>}
          </div>
          
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-white/15 shadow-lg' 
                  : 'hover:bg-white/10'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                isActive(item.path)
                  ? `bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 shadow-lg`
                  : `bg-${item.color}-500/20`
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              {sidebarOpen && (
                <span className={`font-medium group-hover:translate-x-1 transition-transform ${
                  isActive(item.path) ? 'text-white' : 'text-gray-300'
                }`}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}


          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="font-medium group-hover:translate-x-1 transition-transform text-gray-300">
                Về trang chủ
              </span>
            )}
          </Link>

          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 group ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <LogOut className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="font-medium group-hover:translate-x-1 transition-transform">
                Đăng xuất
              </span>
            )}
          </button>
        </nav>

        
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-4 flex items-center justify-between z-50 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">Quản lý hệ thống</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
        >
          Đăng xuất
        </button>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around z-50 shadow-lg">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              isActive(item.path) ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isActive(item.path)
                ? `bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 shadow-md`
                : `bg-${item.color}-100`
            }`}>
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : `text-${item.color}-600`}`} />
            </div>
            <span className={`text-xs font-medium ${
              isActive(item.path) ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {item.short || item.label}
            </span>
          </Link>
        ))}
        <Link
          to="/"
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-500">Home</span>
        </Link>
      </nav>

      <main 
        className={`transition-all duration-300 ease-in-out pt-20 md:pt-0 pb-20 md:pb-0 ${
          sidebarOpen ? 'md:ml-72' : 'md:ml-20'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
