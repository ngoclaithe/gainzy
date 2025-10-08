import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, ArrowLeft, Package, Banknote } from 'lucide-react';
import { api } from '../lib/apiClient';
import Toast from '../components/Toast';
import { toArray } from '../lib/normalize';

const PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Hải Phòng',
  'Đà Nẵng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Dương',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: 'Hà Nội',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await api.cart.get();
      const items = toArray(data?.items ?? data);
      setCart({ ...(data || {}), items });
    } catch (e) {
      setError(e.message || 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshCart(); }, []);

  const items = toArray(cart.items);
  const subtotal = useMemo(() => items.reduce((s, it) => {
    const p = it.product || it;
    const price = p.finalPrice || p.price || it.price || 0;
    const quantity = it.quantity || 0;
    return s + price * quantity;
  }, 0), [items]);

  const shippingFee = (form.city || '').trim() === 'Hà Nội' ? 0 : 50000;
  const total = subtotal + shippingFee;

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const phoneOk = /^(0|\+84)[0-9]{9}$/.test(form.phone.trim());
    if (!form.fullName.trim()) return 'Họ tên người nhận là bắt buộc';
    if (!phoneOk) return 'Số điện thoại không hợp lệ';
    if (!form.street.trim()) return 'Địa chỉ đường/phố là bắt buộc';
    if (!form.city.trim()) return 'Tỉnh/thành phố là bắt buộc';
    return '';
  };

  const placeOrder = async () => {
    try {
      setSubmitting(true);
      setError('');
      if (items.length === 0) throw new Error('Giỏ hàng trống');
      const v = validate();
      if (v) throw new Error(v);
      const payload = {
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          street: form.street.trim(),
          ward: form.ward.trim() || undefined,
          district: form.district.trim() || undefined,
          city: form.city.trim(),
        },
        paymentMethod: 'cod',
        shippingPrice: shippingFee,
        note: form.note?.trim() || undefined,
      };
      const res = await api.orders.create(payload);
      const order = res?.data || res;
      setToast({ message: 'Tạo đơn hàng thành công!', type: 'success' });
      setTimeout(() => {
        navigate(`/profile/orders${order?.id || order?._id ? `/${order.id || order._id}` : ''}`);
      }, 800);
    } catch (e) {
      setError(e.message || 'Không thể tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white border hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông tin giao hàng</h1>
            <p className="text-sm text-gray-500">Hà Nội miễn phí vận chuyển, tỉnh khác phí 50.000đ</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Địa chỉ nhận hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Nguyễn Văn A" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input name="phone" value={form.phone} onChange={onChange} placeholder="0xxxxxxxxx" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đường / Số nhà</label>
                  <input name="street" value={form.street} onChange={onChange} placeholder="Số 1 Tràng Tiền" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã</label>
                  <input name="ward" value={form.ward} onChange={onChange} placeholder="Phường/Xã" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
                  <input name="district" value={form.district} onChange={onChange} placeholder="Quận/Huyện" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
                  <select name="city" value={form.city} onChange={onChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tuỳ chọn)</label>
                  <textarea name="note" value={form.note} onChange={onChange} rows={3} placeholder="Giao giờ hành chính, gọi trước khi giao..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Sản phẩm trong đơn
              </h2>
              {items.length === 0 ? (
                <div className="text-sm text-gray-500">Giỏ hàng trống</div>
              ) : (
                <div className="space-y-3">
                  {items.map((it) => {
                    const p = it.product || it;
                    const name = p.name || it.name;
                    const price = p.finalPrice || p.price || it.price || 0;
                    const quantity = it.quantity || 0;
                    const img = toArray(p.images || it.images)[0];
                    return (
                      <div key={p._id || p.id || it.productId} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100">
                        {img && <img src={img} alt={name} className="w-14 h-14 rounded-lg object-cover border" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 line-clamp-2">{name}</p>
                          <p className="text-sm text-gray-500">SL: {quantity}</p>
                        </div>
                        <div className="font-semibold text-gray-900">{formatPrice(price * quantity)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Phương thức thanh toán: <strong>COD</strong></span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>
              <button onClick={placeOrder} disabled={submitting || items.length === 0} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Đang tạo đơn...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
