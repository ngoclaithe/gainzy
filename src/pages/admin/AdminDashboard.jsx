import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/apiClient';
import { Sparkles, ShoppingBag, Layers, Package, Users, Receipt, DollarSign, TrendingUp } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function SimpleTable({ title, columns, rows, emptyText }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500">
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 border-b">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-500">{emptyText}</td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="text-sm">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 border-b">{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [s, ro, ts, ls] = await Promise.all([
          api.admin.stats().catch(() => ({})),
          api.admin.recentOrders().catch(() => []),
          api.admin.topSelling().catch(() => []),
          api.admin.lowStock().catch(() => []),
        ]);
        if (!mounted) return;
        setStats(s?.data || s);
        setRecentOrders(ro?.data || ro);
        setTopSelling(ts?.data || ts);
        setLowStock(ls?.data || ls);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const derived = useMemo(() => {
    const s = stats || {};
    const extract = (val) => {
      if (val == null) return undefined;
      if (typeof val === 'object') {
        // common shapes: { total, newThisMonth, growth } or { total: X }
        return val.total ?? val.count ?? val.value ?? val.number ?? undefined;
      }
      return val;
    };
    const pick = (keys, fallback = 0) => {
      for (const k of keys) {
        const v = s[k];
        const ex = extract(v);
        if (ex !== undefined) return ex;
      }
      return fallback;
    };
    return {
      totalUsers: pick(['totalUsers', 'usersCount', 'users']),
      totalOrders: pick(['totalOrders', 'ordersCount', 'orders']),
      totalRevenue: pick(['totalRevenue', 'revenue']),
      totalProducts: pick(['totalProducts', 'productsCount', 'products']),
    };
  }, [stats]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tổng quan</h1>
            <p className="text-sm text-gray-500">Bảng điều khiển hệ thống</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Người dùng" value={derived.totalUsers} color="from-sky-500 to-blue-600" />
        <StatCard icon={Receipt} label="Đơn hàng" value={derived.totalOrders} color="from-emerald-500 to-teal-600" />
        <StatCard icon={DollarSign} label="Doanh thu" value={new Intl.NumberFormat('vi-VN').format(derived.totalRevenue)} color="from-amber-500 to-orange-600" />
        <StatCard icon={ShoppingBag} label="Sản phẩm" value={derived.totalProducts} color="from-violet-500 to-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SimpleTable
            title="Đơn hàng gần đây"
            columns={["Mã", "Khách", "Tổng", "Trạng thái"]}
            rows={(recentOrders || []).slice(0, 5).map((o) => [
              o.code || o.id,
              o.customerName || o.user?.name || o.user?.email || 'N/A',
              new Intl.NumberFormat('vi-VN').format(o.total || o.amount || 0),
              o.status || o.paymentStatus || 'N/A',
            ])}
            emptyText="Chưa có dữ liệu đơn hàng"
          />
          <SimpleTable
            title="Sản phẩm bán chạy"
            columns={["Tên", "Đã bán", "Doanh thu"]}
            rows={(topSelling || []).slice(0, 5).map((p) => [
              p.name,
              p.sold || p.totalSold || 0,
              new Intl.NumberFormat('vi-VN').format(p.revenue || 0),
            ])}
            emptyText="Chưa có dữ liệu bán chạy"
          />
        </div>
        <div className="space-y-4">
          <SimpleTable
            title="Sắp hết hàng"
            columns={["Tên", "Tồn kho"]}
            rows={(lowStock || []).slice(0, 8).map((p) => [
              p.name,
              p.stock,
            ])}
            emptyText="Không có sản phẩm sắp hết"
          />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng doanh thu</p>
                <p className="text-xl font-bold">{new Intl.NumberFormat('vi-VN').format(derived.totalRevenue)} đ</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Số liệu tổng hợp từ hệ thống</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
      )}
    </div>
  );
}
