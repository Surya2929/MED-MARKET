import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { Pill, Search, Stethoscope, LogOut, Store, ShoppingCart, User, Languages, ShieldAlert, Package } from 'lucide-react'; // 🚀 Added 'Package' icon

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { language, setLanguage, t } = useContext(LanguageContext);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-slate-900 p-1.5 rounded-md"><Pill className="w-5 h-5 text-white" /></div>
          <span className="text-slate-900 font-bold text-xl tracking-tight">MedMarket<span className="text-blue-600">.</span></span>
        </Link>

        <div className="flex items-center gap-5 text-slate-600 font-medium text-sm">
          
          <button onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-bold border border-slate-300">
            <Languages className="w-4 h-4 text-blue-600" /> {language === 'English' ? 'हिंदी' : 'English'}
          </button>

          <Link to="/search" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Search className="w-4 h-4" /> {t('searchMeds')}</Link>
          <Link to="/chat" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Stethoscope className="w-4 h-4" /> {t('aiConsult')}</Link>
          
          {user?.role !== 'admin' && (
            <Link to="/cart" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors relative">
              <ShoppingCart className="w-4 h-4" /> {t('cart')}
              {cart?.length > 0 && <span className="absolute -top-2 -right-2.5 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cart.length}</span>}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4 border-l pl-5 border-slate-200 ml-2">
              
              {/* 🚀 NEW: MY ORDERS BUTTON FOR CUSTOMERS */}
              {user.role === 'customer' && (
                <Link to="/myorders" className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                   <Package className="w-4 h-4 text-emerald-500" />
                   <span className="font-bold">My Orders</span>
                </Link>
              )}
              
              {user.role === 'admin' ? (
                <Link to="/admin" className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold transition-colors bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <ShieldAlert className="w-4 h-4" /> Admin Panel
                </Link>
              ) : (
                <Link to="/profile" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                   <User className="w-4 h-4 text-blue-500" />
                   <span className="font-bold">{user?.name?.split(' ')[0]}</span>
                </Link>
              )}
              
              {user.role === 'vendor' && (
                <Link to="/vendor-dashboard" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"><Store className="w-4 h-4" /> Dashboard</Link>
              )}
              
              <button onClick={logout} className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors font-semibold"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l pl-5 border-slate-200 ml-2">
              <Link to="/login" className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors">{t('login')}</Link>
              <Link to="/register" className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 transition-all shadow-sm">{t('signup')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;