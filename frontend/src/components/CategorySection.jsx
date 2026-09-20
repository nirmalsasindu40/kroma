const categories = [
  {
    name: 'T-Shirts',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 4 3 7v3h3v10h12V10h3V7l-5-3-3 2-3-2z" />
      </svg>
    ),
  },
  {
    name: 'Mugs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h11v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z" />
        <path d="M15 8h2a3 3 0 0 1 0 6h-2" />
      </svg>
    ),
  },
  {
    name: 'Phone Cases',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <line x1="10.5" y1="18.3" x2="13.5" y2="18.3" />
      </svg>
    ),
  },
  {
    name: 'Hoodies',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4c1.2 1 3 1.4 5 1.4S15.8 5 17 4l4 4-3 2v10H6V10L3 8z" />
      </svg>
    ),
  },
  {
    name: 'Tote Bags',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 8h12l1 13H5z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    ),
  },
  {
    name: 'Caps',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 14c0-4.5 4-8 9-8s9 3.5 9 8" />
        <path d="M3 14h13.5a4 4 0 0 0 4-3.4" />
      </svg>
    ),
  },
];

export default function CategorySection() {
  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Shop by product</p>
            <h2>What are you printing today?</h2>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <a href="#" className="category-tile" key={cat.name}>
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}