import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import LateReturnWarning from './components/LateReturnWarning';

// Page Components
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Customers from './pages/Customers';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './components/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TipsChooseEquipment from './pages/TipsChooseEquipment';
import TipsRentVsBuy from './pages/TipsRentVsBuy';
import TipsSafety from './pages/TipsSafety';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { settings, syncStatus, isMaintenanceMode } = useSettings();

  useEffect(() => {
    // Listen for settings updates
    const handleSettingsUpdate = (event) => {
      toast.success('Settings updated!', {
        position: "top-right",
        autoClose: 3000,
      });
    };

    window.addEventListener('customerSettingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('customerSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  // Show maintenance mode if enabled
  if (isMaintenanceMode()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Maintenance Mode</h1>
          <p className="text-gray-600 mb-4">
            {settings.companyName} is currently undergoing maintenance. 
            We'll be back soon!
          </p>
          <div className="text-sm text-gray-500">
            Please check back later or contact support if urgent.
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Sync Status Indicator */}
          {syncStatus === 'connected' && (
            <div className="bg-green-50 border-b border-green-200 px-4 py-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700">Live sync with admin portal active</span>
              </div>
            </div>
          )}
          
          <Header />
          <main className="main-content">
            <div className="container mx-auto px-4">
              <LateReturnWarning />
            </div>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/booking/:productId" element={<Booking />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              {/* Tips & Guides */}
              <Route path="/tips/choose-equipment" element={<TipsChooseEquipment />} />
              <Route path="/tips/rent-vs-buy" element={<TipsRentVsBuy />} />
              <Route path="/tips/safety" element={<TipsSafety />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;