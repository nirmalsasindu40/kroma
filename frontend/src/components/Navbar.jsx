import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DotCluster() {
  return (
    <span className="dot-cluster">
      <span className="dot-cyan"></span>
      <span className="dot-magenta"></span>
      <span className="dot-yellow"></span>
    </span>
  );
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/#featured' },
  { label: 'Categories', href: '/#categories' },
  { label: 'About', href: '/#trust' },
];

export default function Navbar({ cartCount = 0 }) {
  const [query, setQuery] = useState('');
  const location = useLocation();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  const currentTarget = `${location.pathname}${location.hash}`;

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
          <Link to="/" className="logo">
            <DotCluster />
            KROMA
          </Link>

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
            {navLinks.map((link) => {
              const isActive =
                currentTarget === link.href ||
                (link.href === '/' && location.pathname === '/' && !location.hash);
              return (
                <a key={link.label} href={link.href} className={isActive ? 'active' : ''}>
                  {link.label}
                </a>
              );
            })}
            {isAdmin && (
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                Admin
              </Link>
            )}
          </nav>

          <div className="navbar-icons">
            {isAuthenticated ? (
              <div className="navbar-account">
                <Link to="/profile" className="icon-btn" aria-label="Profile">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
                  </svg>
                </Link>
                <button type="button" className="navbar-logout" onClick={logout} title={`Log out (${user?.name})`}>
                  Log out
                </button>
              </div>
            ) : (
              <Link to="/login" className="icon-btn" aria-label="Log in">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
                </svg>
              </Link>
            )}

            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
              </svg>
              {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
