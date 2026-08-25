import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import FeaturedProducts from './components/FeaturedProducts';
import TrustSection from './components/TrustSection';
import Footer from './components/Footer';
import './App.css';

function App() {
  const handleAddToCart = (product) => {
    console.log('Added to cart:', product.name);
  };

  return (
    <div className="app">
      <Navbar cartCount={2} />
      <Hero />
      <CategorySection />
      <FeaturedProducts onAddToCart={handleAddToCart} />
      <TrustSection />
      <Footer />
    </div>
  );
}

export default App;