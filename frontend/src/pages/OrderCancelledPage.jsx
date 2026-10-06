import { Link } from 'react-router-dom';

// PayHere's cancel_url points here if the customer backs out of payment.
// The cart was never cleared, so everything is still there.
export default function OrderCancelledPage() {
  return (
    <section className="section cart-page">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Payment cancelled</p>
            <h2>No charge was made</h2>
          </div>
        </div>
        <p className="cart-empty-text">
          Your payment was cancelled, and your cart is still saved.{' '}
          <Link to="/cart" className="cart-empty-link">
            Return to cart
          </Link>
        </p>
      </div>
    </section>
  );
}
