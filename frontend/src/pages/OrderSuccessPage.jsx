import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// PayHere's return_url points here once the sandbox payment is approved.
// The cart is cleared now, at the moment the customer actually comes back
// successful — not earlier, so a cancelled or abandoned payment leaves the
// cart untouched.
export default function OrderSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          Your PayHere sandbox payment went through. Any custom designs you uploaded have
          been saved with your order.{' '}
          <Link to="/#catalog" className="cart-empty-link">
            Continue shopping
          </Link>
        </p>
      </div>
    </section>
  );
}
