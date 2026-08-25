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

export default function Navbar({ cartCount = 2 }) {
  const [query, setQuery] = useState('');
  const links = ['Home', 'Shop', 'Categories', 'About'];

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>Free shipping on orders over $75</span>
          <span>Design-to-doorstep in 3–5 business days</span>
        </div>
      </div>

      <header className="navbar">
        <div className="container">
          <a href="/" className="logo">
            <DotCluster />
            KROMA
          </a>

          <div className="navbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search products, e.g. custom mug..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <nav className="navbar-links">
            {links.map((link, i) => (
              <a key={link} href="#" className={i === 0 ? 'active' : ''}>
                {link}
              </a>
            ))}
          </nav>

          <div className="navbar-icons">
            <a href="#" className="icon-btn" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
              </svg>
            </a>
            <a href="#" className="icon-btn" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.65-9.5 9-9.5 9z" />
              </svg>
            </a>
            <a href="#" className="icon-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
              </svg>
              {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}