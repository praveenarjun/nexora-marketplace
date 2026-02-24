import { useState, useEffect } from 'react';
import { getProfile, updateProfile, getOrders } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ORDER_STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

export default function AccountDashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getProfile().then((res) => {
      setProfile(res.data);
      setForm({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
      });
    }).catch(() => {});
    getOrders().then((res) => setOrders(res.data)).catch(() => {});
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      setEditing(false);
      setMsg('Profile updated successfully.');
    } catch {
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <p className="loading-text">Loading account...</p>;

  return (
    <div className="account-page">
      <div className="account-header">
        <h2>My Account</h2>
        <button
          className="btn btn-secondary"
          onClick={() => { logoutUser(); navigate('/login'); }}
        >
          Logout
        </button>
      </div>
      <div className="account-tabs">
        <button
          className={`tab-btn ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          Orders ({orders.length})
        </button>
      </div>

      {tab === 'profile' && (
        <div className="account-section">
          {msg && <p className={msg.includes('success') ? 'success-msg' : 'error-msg'}>{msg}</p>}
          {!editing ? (
            <div className="profile-view">
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone || '—'}</p>
              <p><strong>Address:</strong> {profile.address || '—'}</p>
              <p><strong>Role:</strong> {profile.role}</p>
              <button className="btn btn-primary mt-1" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="auth-form">
              <div className="form-group">
                <label>First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="btn-row">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="account-section">
          {orders.length === 0 ? (
            <p className="empty-text">No orders yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span
                      className="order-status"
                      style={{ color: ORDER_STATUS_COLORS[order.status] || '#6b7280' }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <p>
                      <strong>Items:</strong>{' '}
                      {order.items?.map((i) => `${i.quantity}× ${i.productName}`).join(', ') || '—'}
                    </p>
                    <p><strong>Total:</strong> ${order.totalAmount?.toFixed(2)}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
