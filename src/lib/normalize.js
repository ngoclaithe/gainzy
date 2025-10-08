export function toArray(v) {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  const candidates = [
    v.data,
    v.reviews,
    v.categories,
    v.brands,
    v.products,
    v.items,
    v.orders,
    v.results,
    v.list,
    v.rows,
    v.records,
    v.blogs,
    v.data?.data,
    v.data?.reviews,
    v.data?.categories,
    v.data?.brands,
    v.data?.products,
    v.data?.items,
    v.data?.orders,
    v.data?.results,
    v.data?.list,
    v.data?.rows,
    v.data?.records,
    v.data?.blogs,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function normalizeKey(v) {
  return String(v ?? '').toLowerCase();
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
};

export const PAYMENT_METHOD = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
};

export const ORDER_STATUS_KEYS = Object.values(ORDER_STATUS);
export const PAYMENT_STATUS_KEYS = Object.values(PAYMENT_STATUS);
export const PAYMENT_METHOD_KEYS = Object.values(PAYMENT_METHOD);

const ORDER_STATUS_VI = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đã gửi hàng',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const PAYMENT_STATUS_VI = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán thất bại',
};

const PAYMENT_METHOD_VI = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản',
  credit_card: 'Thẻ tín dụng',
};

export function orderStatusLabel(v) {
  const k = normalizeKey(v);
  return ORDER_STATUS_VI[k] || v || '';
}

export function paymentStatusLabel(v) {
  const k = normalizeKey(v);
  return PAYMENT_STATUS_VI[k] || v || '';
}

export function paymentMethodLabel(v) {
  const k = normalizeKey(v);
  return PAYMENT_METHOD_VI[k] || v || '';
}
