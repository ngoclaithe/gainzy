import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { api } from '../lib/apiClient';
import { toArray } from '../lib/normalize';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const data = await api.cart.get().catch(() => ({ items: [] }));
    const items = toArray(data?.items ?? data);
    setCart({ ...(data || {}), items });
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    await api.cart.update(productId, quantity);
    refresh();
  };

  const removeItem = async (productId) => {
    await api.cart.remove(productId);
    refresh();
  };

  const clear = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      await api.cart.clear();
      refresh();
    }
  };

  const items = toArray(cart.items);
  const total = items.reduce((s, it) => {
    const product = it.product || it;
    const price = product.finalPrice || product.price || it.price || 0;
    const quantity = it.quantity || 0;
    return s + price * quantity;
  }, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
          {items.length > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {items.length} sản phẩm
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h3>
            <p className="text-gray-500">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => {
                const product = it.product || it;
                const productId = product._id || product.id || it.productId;
                const name = product.name || it.name;
                const images = toArray(product.images || it.images);
                const price = product.finalPrice || product.price || it.price || 0;
                const quantity = it.quantity || 0;

                return (
                  <div key={productId} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-5">
                    <div className="flex gap-5">

                      {images[0] && (
                        <div className="flex-shrink-0">
                          <img
                            className="w-28 h-28 object-cover rounded-lg border-2 border-gray-100"
                            src={images[0]}
                            alt={name}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                          {name}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600 mb-4">
                          {formatPrice(price)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(productId, quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 text-xl font-bold rounded-md transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                              disabled={quantity <= 1}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => updateQty(productId, Number(e.target.value) || 1)}
                              className="w-16 h-9 text-center border-2 border-gray-200 rounded-lg font-semibold focus:border-blue-500 focus:outline-none"
                            />
                            <button
                              onClick={() => updateQty(productId, quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(productId)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="font-medium">Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-100">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t-2 border-gray-100 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                      <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/checkout')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mb-3">
                  Tiếp tục
                </button>

                <button
                  onClick={clear}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Xóa toàn bộ giỏ hàng
                </button>

                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
