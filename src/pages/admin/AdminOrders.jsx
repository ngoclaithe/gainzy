import { useEffect, useMemo, useState, useCallback } from 'react';
import { ClipboardList, RefreshCcw, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { toArray, ORDER_STATUS_KEYS, PAYMENT_STATUS_KEYS, orderStatusLabel, paymentStatusLabel, paymentMethodLabel } from '../../lib/normalize';
import Toast from '../../components/Toast.jsx';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState({});
  const [viewOrder, setViewOrder] = useState(null);
  const [edits, setEdits] = useState({});
  const [savingStatus, setSavingStatus] = useState({});
  const [savingPayment, setSavingPayment] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.orders.list();
      const root = res?.data ?? res ?? {};
      const list = toArray(root);
      setOrders(list);
      const init = {};
      for (const o of list) {
        const id = o.id || o._id;
        init[id] = {
          status: o.status || 'pending',
          paymentStatus: o.paymentStatus || (o.paid ? 'paid' : 'pending'),
        };
      }
      setEdits(init);
    } catch (e) {
      setError(e.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setEdit = (id, patch) => setEdits((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const onView = async (id) => {
    try {
      setViewing((s) => ({ ...s, [id]: true }));
      const res = await api.orders.get(id);
      const ord = res?.data || res || null;
      setViewOrder(ord);
    } catch (e) {
      alert(e.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setViewing((s) => ({ ...s, [id]: false }));
    }
  };

  const onChangeStatus = async (id, next) => {
    const prev = edits[id]?.status;
    setEdit(id, { status: next });
    setSavingStatus((s) => ({ ...s, [id]: true }));
    try {
      await api.orders.updateStatus(id, next);
      showToast('Cập nhật trạng thái đơn hàng thành công!');
      await load();
    } catch (e) {
      setEdit(id, { status: prev });
      showToast(e.message || 'Cập nhật trạng thái thất bại', 'error');
    } finally {
      setSavingStatus((s) => ({ ...s, [id]: false }));
    }
  };

  const onChangePayment = async (id, next) => {
    const prev = edits[id]?.paymentStatus;
    setEdit(id, { paymentStatus: next });
    setSavingPayment((s) => ({ ...s, [id]: true }));
    try {
      // Gửi paymentStatus đúng chuẩn
      await api.orders.updatePayment(id, { paymentStatus: next });
      showToast('Cập nhật trạng thái thanh toán thành công!');
      await load();
    } catch (e) {
      setEdit(id, { paymentStatus: prev });
      showToast(e.message || 'Cập nhật thanh toán thất bại', 'error');
    } finally {
      setSavingPayment((s) => ({ ...s, [id]: false }));
    }
  };

  const formatter = useMemo(() => new Intl.NumberFormat('vi-VN'), []);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
            <p className="text-sm text-gray-500">Xem và cập nhật trạng thái/ thanh toán</p>
          </div>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm">
          <RefreshCcw className="w-4 h-4" /> Tải lại
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="px-4 py-3 border-b">Mã</th>
                <th className="px-4 py-3 border-b">Khách</th>
                <th className="px-4 py-3 border-b">Tổng</th>
                <th className="px-4 py-3 border-b">Trạng thái</th>
                <th className="px-4 py-3 border-b">Thanh toán</th>
                <th className="px-4 py-3 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Đang tải...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Chưa có đơn hàng</td></tr>
              ) : (
                orders.map((o) => {
                  const id = o.id || o._id;
                  return (
                    <tr key={id} className="text-sm hover:bg-gray-50">
                      <td className="px-4 py-3 border-b font-medium">{o.orderNumber || o.code || id}</td>
                      <td className="px-4 py-3 border-b">{o.customerName || o.user?.name || o.user?.email || 'N/A'}</td>
                      <td className="px-4 py-3 border-b">{formatter.format(o.totalPrice || o.total || o.amount || 0)}</td>
                      <td className="px-4 py-3 border-b">
                        <select 
                          value={edits[id]?.status || ''} 
                          onChange={(e) => onChangeStatus(id, e.target.value)} 
                          disabled={!!savingStatus[id]}
                          className="border rounded-lg px-2 py-1 text-sm disabled:opacity-50"
                        >
                          {ORDER_STATUS_KEYS.map(s => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <select 
                          value={edits[id]?.paymentStatus || ''} 
                          onChange={(e) => onChangePayment(id, e.target.value)} 
                          disabled={!!savingPayment[id]}
                          className="border rounded-lg px-2 py-1 text-sm disabled:opacity-50"
                        >
                          {PAYMENT_STATUS_KEYS.map(s => <option key={s} value={s}>{paymentStatusLabel(s)}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <button onClick={() => onView(id)} disabled={!!viewing[id]} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-50">
                          {viewing[id] ? 'Đang mở...' : (<><Eye className="w-4 h-4" /> Xem</>)}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewOrder(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full m-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Đơn hàng</div>
                <div className="text-xl font-bold">{viewOrder.orderNumber || viewOrder._id || viewOrder.id}</div>
                <div className="text-xs text-gray-500">{viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString('vi-VN') : ''}</div>
              </div>
              <button onClick={() => setViewOrder(null)} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm">Đóng</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Khách hàng</div>
                <div className="font-medium">{viewOrder.user?.name || viewOrder.user?.email || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
                <div className="font-medium">{orderStatusLabel(viewOrder.status)}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Thanh toán</div>
                <div className="font-medium">{paymentStatusLabel(viewOrder.paymentStatus)}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Phương thức</div>
                <div className="font-medium">{paymentMethodLabel(viewOrder.paymentMethod)}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-2">Địa chỉ giao hàng</div>
              {viewOrder.shippingAddress ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Người nhận: {viewOrder.shippingAddress.fullName} - {viewOrder.shippingAddress.phone}</div>
                  <div>Địa chỉ: {`${viewOrder.shippingAddress.street}, ${viewOrder.shippingAddress.ward}, ${viewOrder.shippingAddress.district}, ${viewOrder.shippingAddress.city}`}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">N/A</div>
              )}
            </div>

            <div>
              <div className="font-semibold mb-2">Sản phẩm</div>
              <div className="divide-y">
                {(viewOrder.items || []).map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-sm">
                    <div className="font-medium">{it.name || it.product?.name || `Sản phẩm ${idx+1}`}</div>
                    <div className="text-gray-600">SL: {it.quantity || 1}</div>
                    <div className="font-semibold">{formatter.format((it.price || it.product?.price || 0) * (it.quantity || 1))}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right text-sm text-gray-700">
              <div>Tiền hàng: <span className="font-semibold">{formatter.format(viewOrder.itemsPrice || 0)}</span></div>
              <div>Phí vận chuyển: <span className="font-semibold">{formatter.format(viewOrder.shippingPrice || 0)}</span></div>
              <div className="text-base">Tổng: <span className="font-bold">{formatter.format(viewOrder.totalPrice || 0)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
