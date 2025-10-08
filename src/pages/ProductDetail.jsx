import { useEffect, useState } from 'react';
import Toast from '../components/Toast.jsx';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { toArray } from '../lib/normalize';
import { ShoppingCart, Star, Package, TrendingUp, Users, Heart, Share2, Shield, Truck, Undo } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const effectQuery = new URLSearchParams(location.search).get('effect');
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productData, relatedData, reviewsData] = await Promise.all([
          api.products.get(id),
          api.products.related(id).catch(() => []),
          api.reviews.byProduct(id).catch(() => [])
        ]);
        
        if (mounted) {
          const p = productData?.data || productData?.product || productData?.data?.product || productData;
          setProduct(p);
          setRelated(toArray(relatedData));
          setReviews(toArray(reviewsData));
          setSelectedImage(0);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => { mounted = false; };
  }, [id]);

  const addToCart = async () => {
    if (!product || product.stock === 0) return;
    
    try {
      setIsAddingToCart(true);
      await api.cart.add(product.id || product._id, qty);
      try { await api.cart.get(); } catch (_) {}
      showToast('Đã thêm vào giỏ hàng thành công!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Không thể thêm vào giỏ hàng', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      const productId = product?.id || product?._id;
      const payload = {
        productId,
        rating: Number(rating),
        comment: reviewText
      };

      // Debug logs to help backend validation issues
      console.log('[DEBUG] Submitting review payload:', payload);

      const newReview = await api.reviews.create(payload);

      console.log('[DEBUG] Review created response:', newReview);

      setReviews([newReview, ...reviews]);
      setReviewText('');
      setRating(5);
      setShowReviewForm(false);
      showToast('Đã gửi đánh giá thành công!');
    } catch (error) {
      // Log extended error info for debugging
      console.error('Error submitting review:', error);
      console.error('Error.response:', error?.response || null);
      console.error('Error.data:', error?.data || null);
      const msg = error?.message || 'Không thể gửi đánh giá';
      showToast(msg, 'error');
    }
  };

  const handleQuantityChange = (value) => {
    const newQty = Math.max(1, Math.min(product.stock, value));
    setQty(newQty);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-4">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const images = toArray(product?.images);
  const effectiveItems = toArray(product?.effective);
  const hasDiscount = Number(product?.discount ?? 0) > 0;
  const finalPrice = (product?.finalPrice ?? product?.price) ?? 0;
  const originalPrice = hasDiscount ? Number(product?.price ?? 0) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
          {effectQuery ? (
            <>
              <span>›</span>
              <Link to={`/products?effect=${encodeURIComponent(effectQuery)}`} className="hover:text-blue-600 transition-colors">
                {effectQuery}
              </Link>
            </>
          ) : product.category ? (
            <>
              <span>›</span>
              <Link
                to={`/products?category=${product.category.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          ) : null}
          <span>›</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden aspect-square group">
                {images[selectedImage] && (
                  <img 
                    className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" 
                    src={images[selectedImage]} 
                    alt={product.name}
                    loading="eager"
                  />
                )}
                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full font-bold shadow-lg transform rotate-12">
                    -{product.discount}%
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                  <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110">
                    <Share2 className="w-5 h-5 text-gray-600 hover:text-blue-500" />
                  </button>
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === idx 
                          ? 'border-blue-500 shadow-lg scale-105 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        className="w-full h-full object-cover" 
                        src={src} 
                        alt={`${product.name} ${idx + 1}`} 
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Link 
                    to={`/products?category=${product.category.slug}`}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}
                {product.brand && (
                  <Link 
                    to={`/products?brand=${product.brand.slug}`}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    {product.brand.name}
                  </Link>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < Math.round(product.rating || 0) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-blue-700 font-semibold">
                    {product.rating?.toFixed?.(1) || '0.0'}
                  </span>
                </div>
                <span className="text-gray-600 text-sm">
                  ({product.numReviews || 0} Đánh giá)
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                </span>
                {hasDiscount && originalPrice && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm font-bold">
                      Tiết kiệm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice - finalPrice)}
                    </span>
                  </>
                )}
              </div>

              {effectiveItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Công dụng chính:</h3>
                  <div className="flex flex-wrap gap-3">
                    {effectiveItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                      >
                        {item.icon && (
                          <img src={item.icon} alt={item.label} className="w-5 h-5 object-contain" />
                        )}
                        <span className="text-green-700 font-medium text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Miễn phí vận chuyển</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Undo className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Đổi trả trong 7 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Package className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Giao hàng toàn quốc</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className={`flex items-center gap-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <Package className="w-5 h-5" />
                  <span>
                    {product.stock > 0 ? (
                      <>Còn <strong>{product.stock}</strong> sản phẩm</>
                    ) : (
                      <strong>Hết hàng</strong>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-5 h-5" />
                  <span>Đã bán <strong className="text-gray-900">{product.sold || 0}</strong></span>
                </div>
              </div>

              {product.stock > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (product.sold / (product.sold + product.stock)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {product.sold} sản phẩm đã được bán
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button 
                    onClick={() => handleQuantityChange(qty - 1)}
                    disabled={qty <= 1}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input 
                    className="w-16 text-center font-semibold focus:outline-none bg-transparent" 
                    type="number" 
                    min={1} 
                    max={product.stock}
                    value={qty} 
                    onChange={(e) => handleQuantityChange(Number(e.target.value) || 1)} 
                  />
                  <button 
                    onClick={() => handleQuantityChange(qty + 1)}
                    disabled={qty >= product.stock}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={addToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Bảo đảm chính hãng</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Giao hàng nhanh</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Undo className="w-4 h-4 text-orange-500" />
                  <span>Đổi trả dễ dàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Đánh giá của khách hàng</h2>
          </div>

          {user ? (
            <>
              {!showReviewForm ? (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Viết đánh giá của bạn
                  </button>
                </div>
              ) : (
                <form onSubmit={submitReview} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Viết đánh giá của bạn</h3>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Thu gọn</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chấm điểm</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {[5,4,3,2,1].map(n => (
                          <option key={n} value={n}>
                            {'⭐'.repeat(n)} {n} sao{n === 5 ? ' (Tuyệt vời)' : n === 4 ? ' (Tốt)' : n === 3 ? ' (Bình thường)' : n === 2 ? ' (Không hài lòng)' : ' (Rất tệ)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét của bạn</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      rows="4"
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={!reviewText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Gửi đánh giá
                    </button>
                    <button type="button" onClick={() => { setShowReviewForm(false); setReviewText(''); }} className="text-sm text-gray-600 hover:text-gray-800">Hủy</button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-center">
              <p className="text-yellow-800 mb-3">
                Đăng nhập để viết đánh giá về sản phẩm này
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Chưa có đánh giá nào</p>
                <p className="text-sm">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id || r._id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {(r.user?.name || r.user?.email || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <strong className="text-gray-900 block">
                          {r.user?.name || r.user?.email || 'Ẩn danh'}
                        </strong>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < (Number(r.rating) || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-gray-500 text-sm ml-2">
                            {new Date(r.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sản phẩm liên quan</h2>
              <Link 
                to="/products" 
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id || p._id}
                  to={`/products/${p.id || p._id}`}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <div className="relative">
                    {toArray(p.images)[0] && (
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        <img 
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300" 
                          src={toArray(p.images)[0]} 
                          alt={p.name} 
                          loading="lazy"
                        />
                      </div>
                    )}
                    {p.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{p.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 text-sm leading-tight">
                      {p.name}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <p className="text-blue-600 font-bold text-lg">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((p.finalPrice ?? p.price) ?? 0)}
                      </p>
                      {p.discount > 0 && p.price && (
                        <p className="text-gray-400 text-sm line-through">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
