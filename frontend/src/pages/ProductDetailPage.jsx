import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getInventory } from '../api';
import { useCart } from '../context/CartContext';
import StockBadge from '../components/StockBadge';

function ProductDetailContent({ id }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    Promise.all([getProduct(id), getInventory(id)])
      .then(([prodRes, invRes]) => {
        setProduct(prodRes.data);
        setInventory(invRes.data);
      })
      .catch(() => {
        getProduct(id)
          .then((res) => setProduct(res.data))
          .catch(() => navigate('/'));
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <p className="loading-text">Loading product...</p>;
  if (!product) return null;

  const availableQty = inventory?.availableQuantity ?? product.quantity ?? 0;
  const inStock = availableQty > 0 && product.status === 'ACTIVE';

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-detail">
      <button className="btn btn-secondary mb-2" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <div className="product-detail-layout">
        <div className="product-detail-image">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-detail-img-placeholder">No Image</div>
          )}
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          {product.brand && <p className="product-brand">Brand: {product.brand}</p>}
          <div className="product-price-row">
            <span className="product-price">${product.price?.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="product-compare-price">
                ${product.compareAtPrice?.toFixed(2)}
              </span>
            )}
          </div>
          <StockBadge inStock={inStock} quantity={availableQty} />
          {inStock && (
            <p className="stock-quantity">{availableQty} available</p>
          )}
          {product.shortDescription && (
            <p className="product-short-desc">{product.shortDescription}</p>
          )}
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              {product.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
          {product.category && (
            <p className="product-category">Category: {product.category.name}</p>
          )}
          {inStock && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max={availableQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          )}
          <button
            className="btn btn-primary mt-1"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            {added ? '✓ Added to Cart!' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetailContent key={id} id={id} />;
}
