import { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import CursorEffect from './components/CursorEffect';

// Pages
import Landing from './pages/Landing';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';

// Smart root: Landing for guests, Home for logged-in users, OAuthCallback if token present
function RootRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const hasToken = new URLSearchParams(location.search).has('token');

  if (hasToken) return <OAuthCallback />;
  return isAuthenticated() ? <Navigate to="/home" replace /> : <Landing />;
}

function App() {
  return (
    <>
      {/* Custom cursor trail — desktop only */}
      <div className="hidden lg:block">
        <CursorEffect />
      </div>

      <Routes>
        {/* ── Public full-screen routes (no navbar) ── */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login/oauth2-success" element={<OAuthCallback />} />

        {/* ── App routes (dark navbar layout) ── */}
        <Route path="/*" element={
          <div className="flex flex-col min-h-screen" style={{ background: '#000000' }}>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;
