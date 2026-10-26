import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Small pop-up in the corner confirming an add-to-cart (or explaining why
// one was refused). Driven by the notice state in CartContext.
export default function CartToast() {
  const { notice, dismissNotice } = useCart();
  if (!notice) return null;

  return (
    <div className={`cart-toast cart-toast-${notice.type}`} role="status" key={notice.key}>
      <span>{notice.text}</span>
      {notice.type === 'success' && (
        <Link to="/cart" onClick={dismissNotice}>
          View cart
        </Link>
      )}
      <button type="button" aria-label="Dismiss" onClick={dismissNotice}>
        &times;
      </button>
    </div>
  );
}
