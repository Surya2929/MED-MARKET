import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import All Real Components
import Navbar from './components/Navbar';
import SearchPage from './pages/SearchPage';
import ChatbotPage from './pages/ChatbotPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/CartPage';
import VendorDashboard from './pages/VendorDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <main>
              <Routes>
                {/* Default route redirects to search page */}
                <Route path="/" element={<Navigate to="/search" />} />
                
                {/* Real Pages */}
                <Route path="/search" element={<SearchPage />} />
                <Route path="/chat" element={<ChatbotPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;