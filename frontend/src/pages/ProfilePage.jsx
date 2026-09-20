import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

          <button type="button" className="btn btn-secondary auth-logout-btn" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
}
