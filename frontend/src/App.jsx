
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
import CommunitySections from './components/CommunitySections';
import Footer from './components/Footer';
import Reveal from './components/Reveal';

import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import CartToast from './components/CartToast';
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

// 3D T-shirt test page
import Test3DPage from './pages/Test3DPage';

import './App.css';

function HomePage() {
  const { addToCart } = useCart();

  // Selected category is shared between category tiles and product catalog.
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
        <ProductCatalog
          onAddToCart={addToCart}
          selectedCategory={selectedCategory}
        />
      </Reveal>

      <CommunitySections />

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
        {/* Home page */}
        <Route path="/" element={<HomePage />} />

        {/* 3D T-shirt customizer */}
        <Route
          path="/test-3d"
          element={
            <ProtectedRoute>
              <Test3DPage />
            </ProtectedRoute>
          }
        />

        {/* Products and cart */}
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/reset-password/:token"
          element={<ResetPasswordPage />}
        />

        {/* Orders */}
        <Route
          path="/order-success"
          element={<OrderSuccessPage />}
        />
        <Route
          path="/order-cancelled"
          element={<OrderCancelledPage />}
        />

        {/* Customer profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>

      <CartToast />
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
