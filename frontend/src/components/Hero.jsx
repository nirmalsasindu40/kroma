function DotCluster() {
  return (
    <span className="dot-cluster">
      <span className="dot-cyan"></span>
      <span className="dot-magenta"></span>
      <span className="dot-yellow"></span>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-copy anim-fade-up">
          <p className="eyebrow">
            <DotCluster /> Custom print, made yours
          </p>
          <h1>
            Your ideas, <em>printed to order.</em>
          </h1>
          <p>
            Upload a photo, add your own text, and preview it on real
            products before you buy — no design skills, no shop visit,
            no back-and-forth.
          </p>
          <div className="hero-actions">
            <a href="#featured" className="btn btn-primary">
              Start Designing
            </a>
            <a href="#categories" className="btn btn-secondary">
              Browse Products
            </a>
          </div>

          <div className="hero-badge anim-float anim-fade-up anim-delay-1">
            <DotCluster />
            Full-colour print, every order
          </div>
        </div>
      </div>
    </section>
  );
}
