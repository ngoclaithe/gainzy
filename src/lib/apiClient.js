import axios from 'axios';

function joinUrl(base, path) {
  const b = (base || '').replace(/\/?$/, '');
  const p = (path || '').replace(/^\//, '');
  return `${b}/${p}`;
}

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = joinUrl(VITE_API_BASE_URL, '/api/v1');

function getToken() {
  return localStorage.getItem('token') || '';
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Request error';
    const err = new Error(message);
    err.response = error?.response;
    err.data = error?.response?.data;
    return Promise.reject(err);
  }
);

async function request(method, url, { data, params, headers } = {}) {
  const res = await client.request({ method, url, data, params, headers });
  return res.data;
}

function emitCartCountFromData(data) {
  try {
    const root = data?.data ?? data;
    const items = Array.isArray(root?.items) ? root.items : Array.isArray(root) ? root : [];
    const ids = new Set();
    for (const it of items) {
      const pid =
        it?.product?._id ??
        it?.product?.id ??
        it?.productId ??
        (typeof it?.product === 'string' ? it.product : undefined) ??
        it?._id;
      ids.add(String(pid ?? JSON.stringify(it)));
    }
    const count = ids.size;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cart:count', { detail: count }));
    }
  } catch (_) { /* noop */ }
}

export const api = {
  auth: {
    register: (payload) => request('post', '/auth/register', { data: payload }),
    login: async (payload) => {
      const data = await request('post', '/auth/login', { data: payload });
      const token = data?.token || data?.accessToken || data?.access_token || data?.data?.token || data?.data?.accessToken || '';
      if (token) localStorage.setItem('token', token);
      return data;
    },
    me: async () => {
      const res = await request('get', '/auth/me');
      return res?.data || res?.user || res?.profile || res;
    },
    logout: async () => { await request('post', '/auth/logout'); localStorage.removeItem('token'); },
  },
  users: {
    profile: () => request('get', '/users/profile'),
    updateProfile: (payload) => request('put', '/users/profile', { data: payload }),
    updateAvatar: (imageUrl) => request('put', '/users/avatar', { data: { avatar: imageUrl } }),
    changePassword: (payload) => request('put', '/users/change-password', { data: payload }),
    list: (q = '') => request('get', `/users${q}`),
    get: (id) => request('get', `/users/${id}`),
    update: (id, payload) => request('put', `/users/${id}`, { data: payload }),
    remove: (id) => request('delete', `/users/${id}`),
  },
  categories: {
    list: (q = '') => request('get', `/categories${q}`),
    get: (id) => request('get', `/categories/${id}`),
    getBySlug: (slug) => request('get', `/categories/slug/${slug}`),
    productsBySlug: (slug, params) => request('get', `/categories/slug/${slug}`, { params }),
    create: (payload) => request('post', '/categories', { data: payload }),
    update: (id, payload) => request('put', `/categories/${id}`, { data: payload }),
    updateImage: (id, imageUrl) => request('put', `/categories/${id}/image`, { data: { image: imageUrl } }),
    remove: (id) => request('delete', `/categories/${id}`),
  },
  brands: {
    list: (q = '') => request('get', `/brands${q}`),
    get: (id) => request('get', `/brands/${id}`),
    getBySlug: (slug) => request('get', `/brands/slug/${slug}`),
    create: (payload) => request('post', '/brands', { data: payload }),
    update: (id, payload) => request('put', `/brands/${id}`, { data: payload }),
    updateImage: (id, imageUrl) => request('put', `/brands/${id}/image`, { data: { image: imageUrl } }),
    remove: (id) => request('delete', `/brands/${id}`),
  },
  products: {
    list: (q = '') => request('get', `/products${q}`),
    featured: () => request('get', '/products/featured'),
    get: (id) => request('get', `/products/${id}`),
    getBySlug: (slug) => request('get', `/products/slug/${slug}`),
    related: (id) => request('get', `/products/${id}/related`),
    byEffect: (effect, params = '') => request('get', `/products/effect/${encodeURIComponent(effect)}${params}`),
    create: (payload) => request('post', '/products', { data: payload }),
    update: (id, payload) => request('put', `/products/${id}`, { data: payload }),
    addImages: (id, urls) => request('post', `/products/${id}/images`, { data: { images: urls } }),
    deleteImages: (id, urls) => request('delete', `/products/${id}/images`, { data: { images: urls } }),
    remove: (id) => request('delete', `/products/${id}`),
  },
  cart: {
    get: async () => {
      const res = await request('get', '/cart');
      emitCartCountFromData(res);
      return res?.data ?? res;
    },
    add: async (productId, quantity = 1) => {
      const res = await request('post', '/cart', { data: { productId, quantity } });
      try { await api.cart.get(); } catch (_) {}
      return res;
    },
    update: async (productId, quantity) => {
      const res = await request('put', `/cart/${productId}`, { data: { quantity } });
      try { await api.cart.get(); } catch (_) {}
      return res;
    },
    remove: async (productId) => {
      const res = await request('delete', `/cart/${productId}`);
      try { await api.cart.get(); } catch (_) {}
      return res;
    },
    clear: async () => {
      const res = await request('delete', '/cart');
      try { await api.cart.get(); } catch (_) {}
      return res;
    },
  },
  orders: {
    create: (payload) => request('post', '/orders', { data: payload }),
    mine: () => request('get', '/orders/my-orders'),
    get: (id) => request('get', `/orders/${id}`),
    cancel: (id) => request('put', `/orders/${id}/cancel`),
    list: () => request('get', '/orders/all'),
    updateStatus: (id, status) => request('put', `/orders/${id}/status`, { data: { status } }),
    updatePayment: (id, payload) => request('put', `/orders/${id}/payment`, { data: payload }),
  },
  reviews: {
    create: (payload) => request('post', '/reviews', { data: payload }),
    byProduct: async (productId) => {
      const res = await request('get', `/reviews/product/${productId}`);
      return res?.data?.reviews ?? res?.reviews ?? res;
    },
    mine: () => request('get', '/reviews/my-reviews'),
    update: (id, payload) => request('put', `/reviews/${id}`, { data: payload }),
    remove: (id) => request('delete', `/reviews/${id}`),
    listAll: () => request('get', '/reviews'),
    adminRemove: (id) => request('delete', `/reviews/${id}/admin`),
  },
  admin: {
    stats: () => request('get', '/admin/dashboard/stats'),
    revenueByMonth: () => request('get', '/admin/dashboard/revenue-by-month'),
    topSelling: () => request('get', '/admin/dashboard/top-selling-products'),
    lowStock: () => request('get', '/admin/dashboard/low-stock-products'),
    recentOrders: () => request('get', '/admin/dashboard/recent-orders'),
    orderStatusStats: () => request('get', '/admin/dashboard/order-status-stats'),
    topCustomers: () => request('get', '/admin/dashboard/top-customers'),
    ratingStats: () => request('get', '/admin/dashboard/rating-stats'),
  },
  posts: {
    list: (q = '') => request('get', `/blogs${q}`),
    getBySlug: (slug) => request('get', `/blogs/${slug}`),
    create: (payload) => request('post', '/blogs', { data: payload }),
    update: (id, payload) => request('put', `/blogs/${id}`, { data: payload }),
    remove: (id) => request('delete', `/blogs/${id}`),
  },
};

export default api;
