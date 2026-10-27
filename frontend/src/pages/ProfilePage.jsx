import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authApi';
import { getMyOrders } from '../services/orderApi';
import { formatPrice } from '../utils/currency';

const PHONE_RE = /^\+?[0-9]{7,15}$/;

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    let active = true;
    getMyOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err) => {
        if (active) setOrdersError(err.message);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updatePw = (field) => (e) => {
    setPw({ ...pw, [field]: e.target.value });
    setPwSuccess(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (pw.next !== pw.confirm) {
      return setPwError('New password and confirmation do not match.');
    }

    setPwSaving(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwSuccess(true);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.phone && !PHONE_RE.test(form.phone)) {
      return setError('Please enter a valid phone number.');
    }

    setSaving(true);
    try {
      // This updates the user's stored profile — the cart page reads
      // this same address/phone to prefill the shipping details.
      await updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section auth-page">
      <div className="container auth-container">
        <div className="profile-content">
          <div className="auth-card auth-card-wide">
            <p className="eyebrow">Your account</p>
            <h2>Profile</h2>

            <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" value={user?.email || ''} disabled />
            </label>

            <label>
              Full name
              <input type="text" value={form.name} onChange={update('name')} />
            </label>

            <label>
              Phone
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+94771234567" />
            </label>

            <p className="auth-section-label">Shipping address</p>
            <label>
              Street
              <input type="text" value={form.street} onChange={update('street')} />
            </label>
            <div className="auth-form-row">
              <label>
                City
                <input type="text" value={form.city} onChange={update('city')} />
              </label>
              <label>
                Postal code
                <input type="text" value={form.postalCode} onChange={update('postalCode')} />
              </label>
            </div>
            <label>
              Country
              <input type="text" value={form.country} onChange={update('country')} />
            </label>

            {error && <p className="customize-error">{error}</p>}
            {success && <p className="auth-success">Profile updated.</p>}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            </form>

            <form className="auth-form auth-password-form" onSubmit={handlePasswordSubmit}>
            <p className="auth-section-label">Change password</p>
            <label>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={pw.current}
                onChange={updatePw('current')}
              />
            </label>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={pw.next}
                onChange={updatePw('next')}
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={pw.confirm}
                onChange={updatePw('confirm')}
              />
            </label>
            <p className="auth-hint">
              At least 8 characters, with an uppercase letter, a lowercase letter, a number and a
              special character.
            </p>

            {pwError && <p className="customize-error">{pwError}</p>}
            {pwSuccess && <p className="auth-success">Password changed.</p>}

            <button type="submit" className="btn btn-primary" disabled={pwSaving}>
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
            </form>

            <button type="button" className="btn btn-secondary auth-logout-btn" onClick={logout}>
              Log Out
            </button>
          </div>

          <section className="profile-orders" aria-labelledby="profile-orders-heading">
            <div className="profile-orders-heading">
              <div>
                <p className="eyebrow">Your purchases</p>
                <h2 id="profile-orders-heading">Order history</h2>
              </div>
            </div>

            {ordersLoading ? (
              <p className="profile-orders-message">Loading your orders...</p>
            ) : ordersError ? (
              <p className="community-error" role="alert">Couldn't load your orders: {ordersError}</p>
            ) : orders.length === 0 ? (
              <div className="profile-orders-empty">
                <p>You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="profile-orders-list">
                {orders.map((order) => (
                  <article className="profile-order-card" key={order._id}>
                    <div className="profile-order-heading">
                      <div>
                        <h3>Order {order.orderId}</h3>
                        <time dateTime={order.createdAt}>
                          Placed {new Date(order.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <ul className="profile-order-items">
                      {order.items.map((item, index) => (
                        <li key={`${order._id}-${item.name}-${index}`}>
                          <span>{item.name} × {item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="profile-order-total">
                      <span>{order.status === 'cancelled' ? 'Order total' : 'Total'}</span>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
