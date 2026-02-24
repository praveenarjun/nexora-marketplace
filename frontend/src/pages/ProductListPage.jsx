import { useState, useEffect } from 'react';
import { getCategories, filterProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    featured: false,
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = {
      page,
      size: 12,
      ...(filters.keyword && { keyword: filters.keyword }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.inStock && { inStock: true }),
      ...(filters.featured && { featured: true }),
    };
    filterProducts(params)
      .then((res) => {
        const data = res.data;
        setProducts(data.content ?? data);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoading(true);
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setPage(0);
  };

  const handlePrevPage = () => {
    setLoading(true);
    setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    setLoading(true);
    setPage((p) => p + 1);
  };

  return (
    <div className="page-layout">
      <aside className="sidebar">
        <h3>Filters</h3>
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            name="keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
            placeholder="Search products..."
          />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Min Price</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="filter-group">
          <label>Max Price</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Any"
            min="0"
          />
        </div>
        <div className="filter-group filter-checkbox">
          <label>
            <input
              type="checkbox"
              name="inStock"
              checked={filters.inStock}
              onChange={handleFilterChange}
            />
            In Stock Only
          </label>
        </div>
        <div className="filter-group filter-checkbox">
          <label>
            <input
              type="checkbox"
              name="featured"
              checked={filters.featured}
              onChange={handleFilterChange}
            />
            Featured Only
          </label>
        </div>
      </aside>

      <main className="product-grid-container">
        <h2>Products</h2>
        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="empty-text">No products found.</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 0} onClick={handlePrevPage}>
              &laquo; Prev
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={handleNextPage}>
              Next &raquo;
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
