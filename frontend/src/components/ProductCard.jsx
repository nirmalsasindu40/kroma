import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomizeModal from './CustomizeModal';
import { formatPrice } from '../utils/currency';

export default function ProductCard({ product, onAddToCart }) {
  const { id, name, category, price, image, tag, stock, variants } = product;
  const [showCustomize, setShowCustomize] = useState(false);
  const navigate = useNavigate();

  const soldOut = typeof stock === 'number' && stock <= 0;
  // Products with Size/Colour options need those chosen too, which happens
  // on the product page rather than in the quick-design pop-up.
  const needsOptions = Array.isArray(variants) && variants.length > 0;
  const productUrl = `/product/${id}`;

  const handleStart = () => {
    if (soldOut) return;
    if (needsOptions) navigate(productUrl);
    else setShowCustomize(true);
  };

  const handleConfirmDesign = (design) => {
    const added = onAddToCart?.({ ...product, ...design });
    if (added !== false) setShowCustomize(false);
  };

  return (
    <div className="product-card">
      <Link to={productUrl} className="product-thumb" aria-label={`View ${name}`}>
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="9" r="1.5" />
            <path d="M21 15l-5-5-9 9" />
          </svg>
        )}

        {soldOut ? (
          <span className="product-tag product-tag-soldout">Out of stock</span>
        ) : (
          tag && <span className="product-tag">{tag}</span>
        )}
      </Link>

      <div className="product-body">
        <p className="product-category">{category}</p>
        <h3 className="product-name">
          <Link to={productUrl}>{name}</Link>
        </h3>

        <button
          type="button"
          className="product-customize-btn"
          onClick={handleStart}
          disabled={soldOut}
        >
          {needsOptions ? 'Choose options & design' : 'Upload your design'}
        </button>

        <div className="product-footer">
          <span className="product-price">{formatPrice(price)}</span>
          <button
            type="button"
            className="product-cart-btn"
            aria-label={`Customize and add ${name} to cart`}
            onClick={handleStart}
            disabled={soldOut}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
          </button>
        </div>
      </div>

      {showCustomize && (
        <CustomizeModal
          product={product}
          onClose={() => setShowCustomize(false)}
          onConfirm={handleConfirmDesign}
        />
      )}
    </div>
  );
}
