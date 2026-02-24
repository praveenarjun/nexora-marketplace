import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address.');
      return;
    }
    setPlacing(true);
    setError('');
    try {
      const orderData = {
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: shippingAddress.trim(),
      };
      const res = await placeOrder(orderData);
      clearCart();
      setSuccess(`Order #${res.data.orderNumber} placed successfully!`);
      setTimeout(() => navigate('/account'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart</h2>
        {success && <p className="success-msg">{success}</p>}
        <p>Your cart is empty.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <span className="cart-item-name">{item.name}</span>
                <span className="cart-item-price">${item.price?.toFixed(2)} each</span>
              </div>
              <div className="cart-item-controls">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <span className="cart-item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button className="btn-remove" onClick={() => removeItem(item.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-total-row">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <div className="form-group mt-1">
            <label>Shipping Address</label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your shipping address"
            />
          </div>
          <button
            className="btn btn-primary btn-full mt-1"
            onClick={handleCheckout}
            disabled={placing}
          >
            {placing ? 'Placing Order...' : 'Checkout'}
          </button>
          <button
            className="btn btn-secondary btn-full mt-1"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
