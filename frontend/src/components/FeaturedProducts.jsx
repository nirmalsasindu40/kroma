import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { getPopularProducts, resolveImageUrl } from '../services/api';

export default function FeaturedProducts({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPopularProducts()
      .then((data) => {
        const normalized = data
          .map((p) => ({ ...p, id: p._id, image: resolveImageUrl(p.image) }));
        setProducts(normalized);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section" id="featured">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Bestsellers</p>
            <h2>Popular customizations</h2>
          </div>
          <a href="#catalog" className="view-all">
            View all products
          </a>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p>Couldn't load popular products: {error}</p>
        ) : (
          products.length ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
            </div>
          ) : (
            <p>No products are available yet.</p>
          )
        )}
      </div>
    </section>
  );
}