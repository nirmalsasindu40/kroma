import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <p className="eyebrow">Account recovery</p>
          <h2>Forgot your password?</h2>

          {sent ? (
            <p className="cart-empty-text">
              If that email is registered, a reset link has been sent. Check your inbox
              (and spam folder) — the link expires in 15 minutes.
            </p>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {error && <p className="customize-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to="/login">&larr; Back to login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
