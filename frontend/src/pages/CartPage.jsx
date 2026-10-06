import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { uploadDesign } from '../services/api';
import { initiatePayment } from '../services/paymentApi';
import { formatLKR, SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../utils/currency';

const PHONE_RE = /^\+?[0-9]{7,15}$/;

export default function CartPage() {
  const { items, removeFromCart, increaseQty, decreaseQty, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Shipping details prefill from the user's saved profile — editable
  // here for this order only. Saving changes back to the profile is
  // done separately on the Profile page.
  const [shipping, setShipping] = useState({
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [shippingError, setShippingError] = useState('');

  useEffect(() => {
    if (user) {
      setShipping({
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || '',
      });
    }
  }, [user]);

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const orderTotal = cartTotal + (cartTotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE);

  // Builds a real <form> in memory, fills it with the signed fields the
  // backend returned, adds it to the page, and submits it — this is the
  // standard way to redirect the browser to PayHere's hosted checkout
  // with a POST request (a plain link/fetch can't POST a full-page
  // navigation the way an actual form submit can).
  const redirectToPayHere = ({ action, fields }) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const handleCheckout = async () => {
    setCheckoutError('');

    if (!isAuthenticated) {
      setCheckoutError('Please log in to complete checkout.');
      return;
    }
    if (!shipping.phone || !PHONE_RE.test(shipping.phone)) {
      setShippingError('Enter a valid phone number to continue.');
      return;
    }
    if (!shipping.street || !shipping.city || !shipping.country) {
      setShippingError('Please fill in your shipping address.');
      return;
    }
    setShippingError('');
    setCheckingOut(true);

    try {
      const designItems = items.filter((item) => item.customDesign);

      await Promise.all(
        designItems.map((item) =>
          uploadDesign({
            dataUrl: item.customDesign,
            fileName: item.customFileName,
            productId: item.baseProductId || item.id,
            productName: item.name,
          })
        )
      );

      // Cart intentionally isn't cleared here — only once PayHere actually
      // confirms the payment and the customer lands back on the success
      // page. If they cancel partway through, their cart is still intact.
      const itemsSummary = items.map((item) => `${item.name} x${item.quantity}`).join(', ');
      const payment = await initiatePayment({
        amount: orderTotal,
        items: itemsSummary,
        shipping,
      });
      redirectToPayHere(payment);
    } catch (err) {
      setCheckoutError(err.message || 'Something went wrong starting checkout. Please try again.');
      console.error(err);
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="section cart-page">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Your cart</p>
              <h2>Cart is empty</h2>
            </div>
          </div>
          <p className="cart-empty-text">
            You haven't added anything yet.{' '}
            <Link to="/#catalog" className="cart-empty-link">
              Browse products
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section cart-page">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Your cart</p>
            <h2>
              {items.reduce((n, i) => n + i.quantity, 0)} item
              {items.reduce((n, i) => n + i.quantity, 0) !== 1 ? 's' : ''} in your cart
            </h2>
          </div>
          <button type="button" className="view-all cart-clear-btn" onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <div className="cart-layout">
          <div>
            <ul className="cart-list">
              {items.map((item) => (
                <li className="cart-row" key={item.id}>
                  <div className="cart-row-thumb">
                    {item.customDesign ? (
                      <img src={item.customDesign} alt="Your uploaded design" />
                    ) : item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="9" r="1.5" />
                        <path d="M21 15l-5-5-9 9" />
                      </svg>
                    )}
                  </div>

                  <div className="cart-row-info">
                    <p className="cart-row-category">{item.category}</p>
                    <h4 className="cart-row-name">{item.name}</h4>
                    <span className="cart-row-price">{formatLKR(item.price)} each</span>
                    {item.customDesign && (
                      <span className="cart-row-custom-badge">Custom design attached</span>
                    )}
                  </div>

                  <div className="cart-row-qty">
                    <button type="button" className="qty-btn" onClick={() => decreaseQty(item.id)}>
                      &minus;
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button type="button" className="qty-btn" onClick={() => increaseQty(item.id)}>
                      +
                    </button>
                  </div>

                  <div className="cart-row-subtotal">
                    {formatLKR(item.price * item.quantity)}
                  </div>

                  <button
                    type="button"
                    className="cart-row-remove"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeFromCart(item.id)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 7h16" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-shipping">
              <h4>Shipping details</h4>
              {!isAuthenticated ? (
                <p className="cart-empty-text">
                  <Link to="/login" state={{ from: { pathname: '/cart' } }}>
                    Log in
                  </Link>{' '}
                  to use your saved address, or register a new account.
                </p>
              ) : (
                <>
                  <label>
                    Phone
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    />
                  </label>
                  <label>
                    Street
                    <input
                      type="text"
                      value={shipping.street}
                      onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                    />
                  </label>
                  <div className="auth-form-row">
                    <label>
                      City
                      <input
                        type="text"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      />
                    </label>
                    <label>
                      Postal code
                      <input
                        type="text"
                        value={shipping.postalCode}
                        onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      />
                    </label>
                  </div>
                  <label>
                    Country
                    <input
                      type="text"
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    />
                  </label>
                  {shippingError && <p className="customize-error">{shippingError}</p>}
                  <p className="customize-note">
                    This uses your saved profile info by default. Changes here apply to this
                    order only — update your <Link to="/profile">profile</Link> to change it
                    permanently.
                  </p>
                </>
              )}
            </div>
          </div>

          <aside className="cart-summary">
            <h4>Order summary</h4>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatLKR(cartTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>{cartTotal >= SHIPPING_THRESHOLD ? 'Free' : formatLKR(STANDARD_SHIPPING_FEE)}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>{formatLKR(orderTotal)}</span>
            </div>

            {checkoutError && <p className="customize-error">{checkoutError}</p>}

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing...' : 'Checkout'}
            </button>
            <Link to="/#catalog" className="cart-continue-link">
              &larr; Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}