import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Pill, Search, Bot, LogOut, Store, ShoppingCart, UserCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  return (
    <nav className="bg-white/70 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center flex-wrap gap-y-3">
        
        {/* 🌟 Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-900 font-extrabold text-xl sm:text-2xl tracking-tight">
            Med<span className="text-blue-600">Market</span>
          </span>
        </Link>

        {/* 🌟 Links */}
        <div className="flex items-center gap-3 sm:gap-5 text-gray-600 font-medium text-xs sm:text-sm shrink-0 overflow-x-auto pb-1 sm:pb-0">
          <Link to="/search" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Search className="w-4 h-4" /> <span className="hidden md:inline">Search</span>
          </Link>
          
          <Link to="/chat" className="flex items-center gap-1 hover:text-teal-600 transition-colors">
            <Bot className="w-4 h-4" /> <span className="hidden md:inline">AI Assistant</span>
          </Link>

          {/* Cart Link */}
          <Link to="/cart" className="flex items-center gap-1 hover:text-green-600 transition-colors relative group">
            <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" /> <span className="hidden md:inline">Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2.5 -right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                {cart.length}
              </span>
            )}
          </Link>

          {/* 🌟 Auth State */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4 border-l pl-3 sm:pl-5 border-gray-200 ml-1">
              <div className="flex items-center gap-1.5 text-gray-800 bg-gray-100/80 px-2 sm:px-3 py-1.5 rounded-full border border-gray-200">
                 <UserCircle className="w-4 h-4 text-blue-600" />
                 <span className="font-semibold truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
              </div>
              
              {user.role === 'vendor' && (
                <Link to="/vendor-dashboard" className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold bg-orange-50 px-2 sm:px-3 py-1.5 rounded-md transition-colors border border-orange-100">
                  <Store className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
              
              <button onClick={logout} className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 py-1.5 rounded-md transition-all font-semibold cursor-pointer">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 sm:gap-3 border-l pl-3 sm:pl-5 border-gray-200 ml-1">
              <Link to="/login" className="px-3 sm:px-4 py-2 text-gray-700 hover:text-blue-600 font-bold transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-3 sm:px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;