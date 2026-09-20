import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;

function checkPasswordStrength(password) {
  if (password.length < 8) return 'Must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Add at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Add at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Add at least one special character.';
  return '';
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!EMAIL_RE.test(form.email)) errors.email = 'Enter a valid email address.';
    if (form.phone && !PHONE_RE.test(form.phone)) {
      errors.phone = 'Enter a valid phone number (7-15 digits).';
    }
    const passwordIssue = checkPasswordStrength(form.password);
    if (passwordIssue) errors.password = passwordIssue;
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: {
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
      });
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <section className="section auth-page">
      <div className="container auth-container">
        <div className="auth-card auth-card-wide">
          <p className="eyebrow">Join Kroma</p>
          <h2>Create your account</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input type="text" value={form.name} onChange={update('name')} required />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </label>

            <label>
              Email
              <input type="email" value={form.email} onChange={update('email')} required />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </label>

            <label>
              Phone (optional)
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+94771234567" />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </label>

            <div className="auth-form-row">
              <label>
                Password
                <input type="password" value={form.password} onChange={update('password')} required />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  required
                />
              </label>
            </div>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
            <p className="customize-note">
              Use 8+ characters with uppercase, lowercase, a number, and a special character.
            </p>

            <p className="auth-section-label">Shipping address (optional — you can add this later)</p>
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

            {serverError && <p className="customize-error">{serverError}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
