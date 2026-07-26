import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { LanguageProvider } from './context/LanguageContext'; 
import { useContext } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import ChatbotPage from './pages/ChatbotPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/CartPage';
import VendorDashboard from './pages/VendorDashboard';
import ProfilePage from './pages/ProfilePage'; 
import AdminDashboard from './pages/AdminDashboard'; 
import MedicineDetails from './pages/MedicineDetails'; 
import MyOrders from './pages/MyOrders'; // 🚀 NAYA IMPORT
import MyComplaints from './pages/MyComplaints';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <LocationProvider> 
            <Router>
              {/* 🚀 FIX: overflow-x-hidden here is a safety net — if any child element ever
                  becomes wider than the viewport (e.g. a non-responsive component), this
                  stops the WHOLE page from scrolling sideways on mobile. */}
              <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Navigate to="/search" />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/medicine-details" element={<MedicineDetails />} />
                    
                    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> 
                    <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} /> {/* 🚀 NAYA ROUTE */}
                    <Route path="/complaints" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
                    <Route path="/vendor-dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </LocationProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;