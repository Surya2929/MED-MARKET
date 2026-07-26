import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { Pill, Search, Stethoscope, LogOut, Store, ShoppingCart, User, Languages, ShieldAlert, Package, MessageSquare, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setMobileOpen(false);
  const go = (path) => { close(); navigate(path); };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">

        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={close}>
          <div className="bg-slate-900 p-1.5 rounded-md"><Pill className="w-5 h-5 text-white" /></div>
          <span className="text-slate-900 font-bold text-xl tracking-tight">MedMarket<span className="text-blue-600">.</span></span>
        </Link>

        {/* 🚀 DESKTOP NAV — hidden on mobile, everything in one row like before */}
        <div className="hidden md:flex items-center gap-5 text-slate-600 font-medium text-sm">

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

              {user.role === 'customer' && (
                <Link to="/myorders" className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                   <Package className="w-4 h-4 text-emerald-500" />
                   <span className="font-bold">{t('myOrdersNav')}</span>
                </Link>
              )}

              {(user.role === 'customer' || user.role === 'vendor') && (
                <Link to="/complaints" className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 transition-colors" title={t('myComplaintsNav')}>
                   <MessageSquare className="w-4 h-4" />
                </Link>
              )}

              {user.role === 'admin' ? (
                <Link to="/admin" className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold transition-colors bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <ShieldAlert className="w-4 h-4" /> {t('adminPanel')}
                </Link>
              ) : (
                <Link to="/profile" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                   <User className="w-4 h-4 text-blue-500" />
                   <span className="font-bold">{user?.name?.split(' ')[0]}</span>
                </Link>
              )}

              {user.role === 'vendor' && (
                <Link to="/vendor-dashboard" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"><Store className="w-4 h-4" /> {t('vendorDashboardNav')}</Link>
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

        {/* 🚀 MOBILE: only Cart + Hamburger visible, everything else moves into the dropdown */}
        <div className="flex md:hidden items-center gap-3">
          {user?.role !== 'admin' && (
            <Link to="/cart" className="relative text-slate-600" onClick={close}>
              <ShoppingCart className="w-5 h-5" />
              {cart?.length > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cart.length}</span>}
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-700 p-1.5 bg-slate-100 rounded-lg" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 🚀 MOBILE DROPDOWN PANEL — stacked vertically, never causes horizontal overflow */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">

          <button onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')} className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm mb-2">
            <Languages className="w-4 h-4 text-blue-600" /> {language === 'English' ? 'हिंदी में देखें' : 'View in English'}
          </button>

          <button onClick={() => go('/search')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Search className="w-4 h-4" /> {t('searchMeds')}</button>
          <button onClick={() => go('/chat')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Stethoscope className="w-4 h-4" /> {t('aiConsult')}</button>

          {user ? (
            <>
              {user.role === 'customer' && (
                <button onClick={() => go('/myorders')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Package className="w-4 h-4 text-emerald-500" /> {t('myOrdersNav')}</button>
              )}
              {(user.role === 'customer' || user.role === 'vendor') && (
                <button onClick={() => go('/complaints')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><MessageSquare className="w-4 h-4" /> {t('myComplaintsNav')}</button>
              )}
              {user.role === 'admin' ? (
                <button onClick={() => go('/admin')} className="w-full flex items-center gap-2 px-3 py-3 text-rose-600 font-bold text-sm border-b border-slate-100"><ShieldAlert className="w-4 h-4" /> {t('adminPanel')}</button>
              ) : (
                <button onClick={() => go('/profile')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><User className="w-4 h-4 text-blue-500" /> {user?.name?.split(' ')[0]}</button>
              )}
              {user.role === 'vendor' && (
                <button onClick={() => go('/vendor-dashboard')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Store className="w-4 h-4" /> {t('vendorDashboardNav')}</button>
              )}
              <button onClick={() => { close(); logout(); }} className="w-full flex items-center gap-2 px-3 py-3 text-rose-600 font-bold text-sm mt-2"><LogOut className="w-4 h-4" /> Logout</button>
            </>
          ) : (
            <div className="flex gap-3 pt-3">
              <button onClick={() => go('/login')} className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 font-bold rounded-lg text-sm">{t('login')}</button>
              <button onClick={() => go('/register')} className="flex-1 px-4 py-2.5 bg-slate-900 text-white font-bold rounded-lg text-sm">{t('signup')}</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;