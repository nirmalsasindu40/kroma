import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authApi';

function checkPasswordStrength(password) {
  if (password.length < 8) return 'Must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Add at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Add at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Add at least one special character.';
  return '';
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const strengthIssue = checkPasswordStrength(password);
    if (strengthIssue) return setError(strengthIssue);
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
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
          <h2>Choose a new password</h2>

          {success ? (
            <p className="cart-empty-text">Password reset! Redirecting you to login...</p>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                New password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>

              {error && <p className="customize-error">{error}</p>}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Saving...' : 'Reset Password'}
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
