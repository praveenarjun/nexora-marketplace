import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StockBadge from './StockBadge';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const inStock = product.quantity > 0 && product.status === 'ACTIVE';

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-img-link">
        <div className="product-card-img">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-card-img-placeholder">No Image</div>
          )}
        </div>
      </Link>
      <div className="product-card-body">
        <Link to={`/products/${product.id}`} className="product-card-title">
          {product.name}
        </Link>
        <p className="product-card-brand">{product.brand}</p>
        <div className="product-card-footer">
          <span className="product-card-price">${product.price?.toFixed(2)}</span>
          <StockBadge inStock={inStock} quantity={product.quantity} />
        </div>
        <button
          className="btn btn-primary mt-1"
          disabled={!inStock}
          onClick={() => addItem(product)}
        >
          {inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
