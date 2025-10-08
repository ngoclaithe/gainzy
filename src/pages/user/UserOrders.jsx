import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/apiClient';
import { toArray, orderStatusLabel, paymentStatusLabel } from '../../lib/normalize';

function formatCurrency(v) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
}

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState({});
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.orders.mine();
      setOrders(toArray(res));
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancelOrder = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      setCancelling((s) => ({ ...s, [id]: true }));
      await api.orders.cancel(id);
      await load();
    } catch (e) {
      window.alert(e.message || 'Hủy đơn thất bại');
    } finally {
      setCancelling((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <button onClick={load} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm">Tải lại</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 border-b">Mã</th>
                  <th className="px-4 py-3 border-b">Tổng</th>
                  <th className="px-4 py-3 border-b">Trạng thái</th>
                  <th className="px-4 py-3 border-b">Thanh toán</th>
                  <th className="px-4 py-3 border-b">Ngày</th>
                  <th className="px-4 py-3 border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Đang tải...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Chưa có đơn hàng</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id || o._id} className="text-sm hover:bg-gray-50">
                      <td className="px-4 py-3 border-b font-medium">{o.orderNumber || o._id || o.id}</td>
                      <td className="px-4 py-3 border-b">{formatCurrency(o.totalPrice)}</td>
                      <td className="px-4 py-3 border-b">{orderStatusLabel(o.status)}</td>
                      <td className="px-4 py-3 border-b">{paymentStatusLabel(o.paymentStatus)}</td>
                      <td className="px-4 py-3 border-b">{o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</td>
                      <td className="px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/profile/orders/${o.id || o._id}`)} className="px-2.5 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50">Xem</button>
                          {String(o.status || '').toLowerCase() === 'pending' && (
                            <button onClick={() => cancelOrder(o.id || o._id)} disabled={!!cancelling[o.id || o._id]} className="px-2.5 py-1.5 rounded-lg border text-sm bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">
                              {cancelling[o.id || o._id] ? 'Đang hủy...' : 'Hủy'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
