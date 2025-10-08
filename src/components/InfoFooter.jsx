export default function InfoFooter() {
  const policies = [
    { src: '/images/info_footer/policy_icon_1.webp', label: 'Miễn phí vận chuyển' },
    { src: '/images/info_footer/policy_icon_2.png', label: 'Thương hiệu chính hãng' },
    { src: '/images/info_footer/policy_icon_3.png', label: 'Tư vấn nhiệt tình' },
    { src: '/images/info_footer/policy_icon_4.png', label: 'Tích điểm thành viên' },
    { src: '/images/info_footer/policy_icon_5.png', label: 'Thanh toán tiện lợi' },
  ]

  return (
    <div className="mt-10">
      <section className="bg-white/90 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {policies.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={p.src} alt={p.label} className="w-12 h-12 object-contain" />
              <span className="text-sm font-semibold text-slate-700 uppercase leading-tight">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-3 uppercase">Giới thiệu GAINZY</h4>
            <ul className="space-y-2 text-sm">
              <li>Giới thiệu công ty</li>
              <li>Hệ thống cửa hàng</li>
              <li>Thương hiệu nổi bật</li>
              <li>Liên hệ</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 uppercase">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              <li>Hướng dẫn thanh toán</li>
              <li>Hướng dẫn mua hàng Online</li>
              <li>Chính sách khách hàng</li>
              <li>Góp ý, khiếu nại</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 uppercase">Chính sách chung</h4>
            <ul className="space-y-2 text-sm">
              <li>Chính sách, quy định chung</li>
              <li>Chính sách đổi trả và hoàn tiền</li>
              <li>Chính sách vận chuyển hàng</li>
              <li>Bảo mật thông tin khách hàng</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 uppercase">Sản phẩm nổi bật</h4>
            <ul className="space-y-2 text-sm">
              <li>Whey Protein</li>
              <li>Sữa Tăng Cân</li>
              <li>Creatine</li>
              <li>Vitamin D3 K2</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-400">
            <p>© Bản quyền thuộc về GAINZY. Sản phẩm trên website không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
