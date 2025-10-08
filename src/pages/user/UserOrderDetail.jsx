import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/apiClient';
import { ArrowLeft, Package, Receipt, Truck } from 'lucide-react';
import { orderStatusLabel, paymentStatusLabel } from '../../lib/normalize';

function formatCurrency(v) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
}

export default function UserOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.orders.get(id);
      setOrder(res?.data || res || null);
    } catch (e) {
      setError(e.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const cancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      setCancelling(true);
      await api.orders.cancel(order.id || order._id);
      await load();
      window.alert('Đã yêu cầu hủy đơn hàng');
    } catch (e) {
      window.alert(e.message || 'Hủy đơn thất bại');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="mb-4 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">Không tìm thấy đơn hàng</div>
        </div>
      </div>
    );
  }

  const total = order.totalPrice || 0;
  const paymentStatus = order.paymentStatus || (order.paid ? 'paid' : 'pending');
  const status = order.status || '';
  const items = order.items || [];
  const canCancel = String(order.status || '').toLowerCase() === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng {order.orderNumber || order._id || order.id}</h1>
            <p className="text-sm text-gray-500">Ngày: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2"><Receipt className="w-4 h-4 text-indigo-600" /><span className="font-semibold">Tổng tiền</span></div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(total)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2"><Package className="w-4 h-4 text-emerald-600" /><span className="font-semibold">Trạng thái</span></div>
            <div className="font-semibold">{orderStatusLabel(status)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2"><Truck className="w-4 h-4 text-blue-600" /><span className="font-semibold">Thanh toán</span></div>
            <div className="font-semibold">{paymentStatusLabel(paymentStatus)}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="font-bold text-gray-900 mb-3">Thông tin giao hàng</h2>
          <div className="text-sm text-gray-700">
            {order.shippingAddress ? (
              <div className="space-y-1">
                <div>Người nhận: {order.shippingAddress.fullName} - {order.shippingAddress.phone}</div>
                <div>Địa chỉ: {`${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}</div>
                <div>Phí vận chuyển: {formatCurrency(order.shippingPrice ?? 0)}</div>
              </div>
            ) : (
              <div>N/A</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="font-bold text-gray-900 mb-3">Sản phẩm</h2>
          {items.length === 0 ? (
            <div className="text-sm text-gray-500">Không có sản phẩm</div>
          ) : (
            <div className="divide-y">
              {items.map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="font-medium">{it.name || it.product?.name || `Sản phẩm ${idx+1}`}</div>
                  <div className="text-gray-600">SL: {it.quantity || 1}</div>
                  <div className="font-semibold">{formatCurrency((it.price || it.product?.price || 0) * (it.quantity || 1))}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button onClick={() => navigate('/profile/orders')} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">Danh sách đơn hàng</button>
          {canCancel && (
            <button onClick={cancelOrder} disabled={cancelling} className="px-3 py-2 rounded-lg border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50">{cancelling ? 'Đang hủy...' : 'Hủy đơn'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
