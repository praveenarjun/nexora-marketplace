export default function StockBadge({ inStock, quantity }) {
  if (inStock && quantity > 0) {
    return <span className="badge badge-in-stock">In Stock</span>;
  }
  return <span className="badge badge-out-of-stock">Out of Stock</span>;
}
