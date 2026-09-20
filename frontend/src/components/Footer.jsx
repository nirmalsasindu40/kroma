import { useState } from 'react';

function DotCluster() {
  return (
    <span className="dot-cluster">
      <span className="dot-cyan"></span>
      <span className="dot-magenta"></span>
      <span className="dot-yellow"></span>
    </span>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">
          <a href="/" className="logo">
            <DotCluster />
            KROMA
          </a>
          <p>
            Custom-printed products made from your own photos, text and
            designs — previewed before you order, printed after you approve.
          </p>
        </div>

        <div className="footer-col">
          <h5>Shop</h5>
          <ul>
            <li><a href="#">T-Shirts</a></li>
            <li><a href="#">Mugs</a></li>
            <li><a href="#">Phone Cases</a></li>
            <li><a href="#">Hoodies</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Support</h5>
          <ul>
            <li><a href="#">Track Order</a></li>
            <li><a href="#">Shipping &amp; Returns</a></li>
            <li><a href="#">Design Guidelines</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h5>Stay in the loop</h5>
          <p>Get notified about new products and print offers.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>&copy; 2026 KROMA. All rights reserved.</span>
          <span>Faculty of Technology, University of Ruhuna</span>
        </div>
      </div>
    </footer>
  );
}