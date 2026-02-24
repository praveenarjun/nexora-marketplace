import { useState, useEffect, useCallback } from 'react';
import { getProducts, getInventory, restockProduct, updateProductStatus, getLowStockProducts } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminStockPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [restockQtys, setRestockQtys] = useState({});
  const [messages, setMessages] = useState({});
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const productsRes = tab === 'low-stock'
        ? await getLowStockProducts()
        : await getProducts({ size: 50, page: 0 });

      const list = productsRes.data?.content ?? productsRes.data ?? [];
      setProducts(list);

      const invEntries = await Promise.allSettled(
        list.map((p) => getInventory(p.id).then((r) => [p.id, r.data]))
      );
      const map = {};
      invEntries.forEach((r) => {
        if (r.status === 'fulfilled') {
          const [id, inv] = r.value;
          map[id] = inv;
        }
      });
      setInventoryMap(map);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (user?.role === 'ADMIN') loadData();
  }, [tab, loadData, user]);

  const setMsg = (productId, msg) => {
    setMessages((prev) => ({ ...prev, [productId]: msg }));
    setTimeout(() => setMessages((prev) => ({ ...prev, [productId]: '' })), 3000);
  };

  const handleRestock = async (product) => {
    const qty = parseInt(restockQtys[product.id] || 0);
    if (!qty || qty <= 0) {
      setMsg(product.id, 'Enter a valid quantity');
      return;
    }
    try {
      await restockProduct({ productId: product.id, quantity: qty });
      setMsg(product.id, `✓ Added ${qty} units`);
      setRestockQtys((prev) => ({ ...prev, [product.id]: '' }));
      loadData();
    } catch {
      setMsg(product.id, '✗ Restock failed');
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateProductStatus(product.id, newStatus);
      setMsg(product.id, `✓ Status set to ${newStatus}`);
      loadData();
    } catch {
      setMsg(product.id, '✗ Status update failed');
    }
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="admin-page">
      <h2>Admin Stock Panel</h2>
      <div className="account-tabs">
        <button
          className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          All Products
        </button>
        <button
          className={`tab-btn ${tab === 'low-stock' ? 'active' : ''}`}
          onClick={() => setTab('low-stock')}
        >
          Low Stock
        </button>
      </div>
      {loading ? (
        <p className="loading-text">Loading inventory...</p>
      ) : products.length === 0 ? (
        <p className="empty-text">No products found.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Status</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Restock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const inv = inventoryMap[product.id];
                const available = inv?.availableQuantity ?? product.quantity ?? 0;
                const reserved = inv?.reservedQuantity ?? 0;
                const isLow = inv ? inv.lowStock : product.quantity <= (product.lowStockThreshold ?? 5);
                return (
                  <tr key={product.id} className={isLow ? 'row-low-stock' : ''}>
                    <td><code>{product.sku}</code></td>
                    <td>{product.name}</td>
                    <td>
                      <span className={`status-pill status-${product.status?.toLowerCase()}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className={available === 0 ? 'text-danger' : ''}>
                      {available}
                      {isLow && available > 0 && <span className="low-stock-warn"> ⚠</span>}
                    </td>
                    <td>{reserved}</td>
                    <td>
                      <div className="restock-row">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={restockQtys[product.id] || ''}
                          onChange={(e) =>
                            setRestockQtys((prev) => ({ ...prev, [product.id]: e.target.value }))
                          }
                          className="restock-input"
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleRestock(product)}
                        >
                          Add Stock
                        </button>
                      </div>
                      {messages[product.id] && (
                        <small className="action-msg">{messages[product.id]}</small>
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${product.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(product)}
                      >
                        {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
