import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Nexora Marketplace</Link>
      <div className="navbar-links">
        <Link to="/">Products</Link>
        {user ? (
          <>
            <Link to="/account">Account</Link>
            {user.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
            <button onClick={handleLogout} className="btn-link">Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
        <Link to="/cart" className="cart-link">
          🛒 {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
      </div>
    </nav>
  );
}
