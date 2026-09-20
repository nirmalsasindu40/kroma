import { useState } from 'react';
import CustomizeModal from './CustomizeModal';

export default function ProductCard({ product, onAddToCart }) {
  const { name, category, price, image, tag } = product;
  const [showCustomize, setShowCustomize] = useState(false);

  const handleConfirmDesign = (design) => {
    onAddToCart?.({ ...product, ...design });
    setShowCustomize(false);
  };

  return (
    <div className="product-card">
      <div className="product-thumb">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="9" r="1.5" />
            <path d="M21 15l-5-5-9 9" />
          </svg>
        )}

        {tag && <span className="product-tag">{tag}</span>}

        <button className="product-wishlist" aria-label={`Save ${name}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.65-9.5 9-9.5 9z" />
          </svg>
        </button>
      </div>

      <div className="product-body">
        <p className="product-category">{category}</p>
        <h3 className="product-name">{name}</h3>

        <button
          type="button"
          className="product-customize-btn"
          onClick={() => setShowCustomize(true)}
        >
          Upload your design
        </button>

        <div className="product-footer">
          <span className="product-price">${price.toFixed(2)}</span>
          <button
            className="product-cart-btn"
            aria-label={`Add ${name} to cart`}
            onClick={() => onAddToCart?.(product)}
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
