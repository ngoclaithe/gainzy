import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function pickPost(res){
  if (!res) return null;
  const candidates = [res?.data, res?.post, res?.blog, res];
  for (const c of candidates){
    if (c && typeof c === 'object' && (c.title || c.slug || c._id)) return c;
  }
  return null;
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function BlogDetail(){
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.posts.getBySlug(slug);
        const p = pickPost(res);
        if (mounted) setPost(p || null);
      } catch (_) { if (mounted) setPost(null); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy bài viết</p>
          <Link 
            to="/blog" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-transform no-underline"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link 
        to="/blog" 
        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium mb-6 no-underline transition-colors"
      >
        <span>←</span> Quay lại danh sách
      </Link>

      <article className="bg-white rounded-xl shadow-lg overflow-hidden">
        {post.thumbnail && (
          <div className="w-full h-64 md:h-96 overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900">
            <img 
              src={post.thumbnail} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            {post.publishAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">📅</span>
                <span>{formatDateTime(post.publishAt)}</span>
              </div>
            )}
            {post.viewCount !== undefined && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">👁️</span>
                <span>{post.viewCount} lượt xem</span>
              </div>
            )}
            {post.author?.name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">✍️</span>
                <span>{post.author.name}</span>
              </div>
            )}
          </div>

          {post.excerpt && (
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-6 rounded-r-lg">
              <p className="text-gray-700 italic leading-relaxed">{post.excerpt}</p>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
            prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
            prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
            prose-li:mb-2 prose-li:text-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-purple-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-purple-600
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
            prose-hr:border-gray-300 prose-hr:my-8
            prose-table:border-collapse prose-table:w-full
            prose-th:bg-purple-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold
            prose-td:border prose-td:border-gray-300 prose-td:p-3"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {post.relatedPosts.map((related) => (
              <Link
                key={related._id || related.slug}
                to={`/blog/${related.slug}`}
                className="flex gap-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-4 no-underline text-inherit"
              >
                {related.thumbnail && (
                  <img
                    src={related.thumbnail}
                    alt={related.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  {related.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {related.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link 
          to="/blog" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-transform no-underline"
        >
          ← Xem thêm bài viết khác
        </Link>
      </div>
    </div>
  );
}