import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import FeaturedProducts from './components/FeaturedProducts';
import ProductCatalog from './components/ProductCatalog';
import TrustSection from './components/TrustSection';
import Footer from './components/Footer';
import Reveal from './components/Reveal';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderCancelledPage from './pages/OrderCancelledPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './App.css';

function HomePage() {
  const { addToCart } = useCart();
  // Lifted here because CategorySection and ProductCatalog are siblings —
  // clicking a category tile needs to tell the catalog below which
  // category to pre-filter to.
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      <Hero />
      <Reveal>
        <CategorySection onSelectCategory={setSelectedCategory} />
      </Reveal>
      <Reveal>
        <FeaturedProducts onAddToCart={addToCart} />
      </Reveal>
      <Reveal>
        <ProductCatalog onAddToCart={addToCart} selectedCategory={selectedCategory} />
      </Reveal>
      <Reveal>
        <TrustSection />
      </Reveal>
      <Reveal>
        <Footer />
      </Reveal>
    </>
  );
}

function AppShell() {
  const { cartCount } = useCart();

  return (
    <div className="app">
      <Navbar cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-cancelled" element={<OrderCancelledPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;