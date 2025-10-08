import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import MyReviews from './pages/MyReviews'
import AdminCreateProduct from './pages/admin/AdminCreateProduct'
import AdminCreateCategory from './pages/admin/AdminCreateCategory'
import AdminCreateBrand from './pages/admin/AdminCreateBrand'
import UpdateAvatar from './pages/user/UpdateAvatar'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBrands from './pages/admin/AdminBrands'
import Category from './pages/Category'
import Tool from './pages/Tool'
import Brand from './pages/Brand'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPosts from './pages/admin/AdminPosts'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Checkout from './pages/Checkout'
import UserOrders from './pages/user/UserOrders'
import UserOrderDetail from './pages/user/UserOrderDetail'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/brands" element={<Brand />} />
            <Route path="/tinh-bmi-online" element={<Tool />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/reviews/my" element={<MyReviews />} />
              <Route path="/profile" element={<UpdateAvatar />} />
              <Route path="/profile/orders" element={<UserOrders />} />
              <Route path="/profile/orders/:id" element={<UserOrderDetail />} />
            </Route>

            <Route path=":slug" element={<Category />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="posts" element={<AdminPosts />} />

              <Route path="products/create" element={<AdminCreateProduct />} />
              <Route path="categories/create" element={<AdminCreateCategory />} />
              <Route path="brands/create" element={<AdminCreateBrand />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
