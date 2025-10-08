import { useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { toArray } from '../lib/normalize';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);

  const refresh = async () => {
    const data = await api.reviews.mine().catch(() => []);
    setReviews(toArray(data));
  };

  useEffect(() => { refresh(); }, []);

  const remove = async (id) => { await api.reviews.remove(id); refresh(); };

  return (
    <div className="page-container">
      <h2 className="section-title">Đánh giá của tôi</h2>
      <ul className="review-list">
        {reviews.map((r)=> (
          <li key={r.id} className="review-item">
            <div className="review-head">
              <strong>{r.product?.name || 'Sản phẩm'}</strong>
              <span className="review-rating">{Array.from({ length: r.rating }).map(() => '★').join('')}</span>
            </div>
            <p className="review-comment">{r.comment}</p>
            <button onClick={()=>remove(r.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
