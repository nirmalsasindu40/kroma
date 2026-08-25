const items = [
  {
    title: 'Free Shipping',
    desc: 'On all orders over $75',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="7" width="14" height="10" rx="1" />
        <path d="M15 10h4l3 3v4h-7z" />
        <circle cx="6" cy="19" r="1.6" />
        <circle cx="17.5" cy="19" r="1.6" />
      </svg>
    ),
  },
  {
    title: 'Print Quality Guarantee',
    desc: 'Free reprint if it\u2019s not right',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: '24/7 Support',
    desc: 'Real help with your order',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
        <rect x="2" y="15" width="5" height="6" rx="1.5" />
        <rect x="17" y="15" width="5" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    title: 'Secure Payment',
    desc: 'Encrypted checkout, every time',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
];

export default function TrustSection() {
  return (
    <section className="trust">
      <div className="container">
        {items.map((item) => (
          <div className="trust-item" key={item.title}>
            <span className="trust-icon">{item.icon}</span>
            <div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}