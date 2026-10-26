import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // same limit as the quick design pop-up
const LOW_STOCK = 10;

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [variant, setVariant] = useState({}); // e.g. { Size: 'M', Colour: 'Black' }
  const [design, setDesign] = useState(null); // { dataUrl, fileName }
  const [inputKey, setInputKey] = useState(0); // changing it clears the file input
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getProduct(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image is too large — please choose one under 3MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setDesign({ dataUrl: reader.result, fileName: file.name });
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    const groups = product.variants || [];
    const missing = groups.find((g) => !variant[g.name]);
    if (missing) {
      setError(`Please choose a ${missing.name.toLowerCase()}.`);
      return;
    }
    if (!design) {
      setError('Please upload your design before adding to cart.');
      return;
    }
    const added = addToCart({
      ...product,
      customDesign: design.dataUrl,
      customFileName: design.fileName,
      variant,
    });
    if (added) {
      setError('');
      setDesign(null);
      setInputKey((k) => k + 1);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Loading product...</p>
        </div>
      </section>
    );
  }

  if (loadError || !product) {
    return (
      <section className="section">
        <div className="container">
          <h2>{loadError || 'Product not found'}</h2>
          <p>
            <Link to="/#catalog" className="cart-empty-link">
              Back to shop
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const stock = product.stock;
  const soldOut = typeof stock === 'number' && stock <= 0;
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= LOW_STOCK;
  const groups = product.variants || [];

  return (
    <section className="section product-page">
      <div className="container">
        <Link to="/#catalog" className="product-page-back">
          &larr; Back to shop
        </Link>

        <div className="product-page-grid">
          <div className="pd-image">
            {product.image ? (
              <img src={product.image} alt={product.name} className="pd-image-base" />
            ) : (
              <div className="pd-image-empty">No image</div>
            )}
            {design && <img src={design.dataUrl} alt="Your design" className="pd-image-overlay" />}
            {design && <p className="pd-image-caption">Preview of your design on this product</p>}
          </div>

          <div className="pd-info">
            <p className="product-category">{product.category}</p>
            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-price">{formatPrice(product.price)}</p>

            <p className={`pd-stock ${soldOut ? 'pd-stock-out' : lowStock ? 'pd-stock-low' : ''}`}>
              {soldOut ? 'Out of stock' : lowStock ? `Only ${stock} left` : 'In stock'}
            </p>

            {groups.map((g) => (
              <div className="pd-option" key={g.name}>
                <p className="pd-option-label">
                  {g.name}
                  {variant[g.name] && <strong>: {variant[g.name]}</strong>}
                </p>
                <div className="pd-option-choices">
                  {g.options.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      className={variant[g.name] === opt ? 'selected' : ''}
                      onClick={() => setVariant({ ...variant, [g.name]: opt })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pd-option">
              <p className="pd-option-label">
                Your design <span className="pd-required">(required)</span>
              </p>
              <label className="customize-upload-label" htmlFor="pd-design-input">
                {design ? design.fileName : 'Choose an image (JPG, PNG — under 3MB)'}
              </label>
              <input
                key={inputKey}
                id="pd-design-input"
                type="file"
                accept="image/*"
                onChange={handleFile}
              />
            </div>

            {error && <p className="customize-error">{error}</p>}

            <button
              type="button"
              className="btn btn-primary pd-add"
              onClick={handleAdd}
              disabled={soldOut}
            >
              {soldOut ? 'Out of stock' : 'Add to cart'}
            </button>
            <p className="customize-note">
              Every item is printed to order, so a design image is needed before it can go in your
              cart. It is only saved to our servers after checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
