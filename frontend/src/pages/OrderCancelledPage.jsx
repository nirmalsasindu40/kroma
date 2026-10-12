import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cancelPayment } from '../services/paymentApi';

// PayHere's cancel_url points here if the customer backs out of payment.
// The cart was never cleared, so everything is still there. The pending
// order record is marked cancelled so it doesn't sit around indefinitely
// looking unresolved in the admin dashboard.
export default function OrderCancelledPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !orderId) return;
    ran.current = true;
    cancelPayment(orderId).catch(() => {});
  }, [orderId]);

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
