import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { confirmPayment } from '../services/paymentApi';

// PayHere's return_url points here once the sandbox payment is approved,
// carrying the order id as a query param (?order=KROMA-...). Confirming
// here — rather than relying on PayHere's server-to-server notify_url — is
// what actually marks the order paid and deducts stock, since PayHere's
// sandbox cannot reach a plain localhost address during development.
export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [status, setStatus] = useState(orderId ? 'confirming' : 'done');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!orderId) {
      clearCart();
      return;
    }

    confirmPayment(orderId)
      .then(() => {
        clearCart();
        setStatus('done');
      })
      .catch(() => {
        // Even if confirmation fails (e.g. network hiccup), the cart is
        // still cleared — the payment itself already went through on
        // PayHere's side, so leaving old items in the cart would be
        // misleading regardless of whether our own record updated.
        clearCart();
        setStatus('done');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <section className="section cart-page">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Payment successful</p>
            <h2>Thanks — your order is confirmed!</h2>
          </div>
        </div>
        <p className="cart-empty-text">
          {status === 'confirming'
            ? 'Confirming your order...'
            : 'Your PayHere sandbox payment went through. Any custom designs you uploaded have been saved with your order.'}{' '}
          <Link to="/#catalog" className="cart-empty-link">
            Continue shopping
          </Link>
        </p>
      </div>
    </section>
  );
}
