import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { LanguageContext } from '../context/LanguageContext';
import { LocationContext } from '../context/LocationContext';
import { Pill, Search, Stethoscope, LogOut, Store, ShoppingCart, User, Languages, ShieldAlert, Package, MessageSquare, Menu, X, Wallet, MapPin, ArrowUpRight } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { userLocation } = useContext(LocationContext) || {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const close = () => setMobileOpen(false);
  const go = (path) => { close(); navigate(path); };

  // The search page has its own big search bar (with suggestions + location), so skip the navbar one there
  const showNavSearch = pathname !== '/search';
  const city = userLocation?.city?.split(',').pop()?.trim() || 'Select location';

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (!navQuery.trim()) return;
    close();
    navigate(`/search?q=${encodeURIComponent(navQuery.trim())}`);
    setNavQuery('');
  };

  const iconBtn = "relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors";

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-200/70 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={close}>
          <div className="bg-brand-600 p-1.5 rounded-lg"><Pill className="w-5 h-5 text-lime-accent" /></div>
          <span className="text-slate-900 font-extrabold text-xl tracking-tight">MedMarket<span className="text-brand-500">.</span></span>
        </Link>

        {showNavSearch ? (
          <form onSubmit={handleNavSearch} className="hidden lg:flex flex-1 max-w-md items-center bg-slate-100 rounded-full px-4 h-10 ml-4 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:bg-white border border-transparent focus-within:border-brand-100 transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input value={navQuery} onChange={(e) => setNavQuery(e.target.value)} placeholder={t('searchPlaceholder')} className="flex-1 bg-transparent outline-none text-sm px-2.5 text-slate-800 placeholder-slate-400" />
          </form>
        ) : <div className="hidden lg:block flex-1" />}

        <div className="hidden lg:flex items-center gap-1 text-sm ml-auto">

          <div className="flex items-center gap-2 pr-3 mr-1 border-r border-slate-200">
            <MapPin className="w-4 h-4 text-brand-600" />
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400 font-medium">{t('deliverTo')}</p>
              <p className="text-xs font-bold text-slate-800 max-w-[110px] truncate">{city}</p>
            </div>
          </div>

          <button onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')} className="flex items-center gap-1 px-2.5 h-9 rounded-full text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors font-semibold text-xs" title="Language">
            <Languages className="w-4 h-4" /> {language === 'English' ? 'हिंदी' : 'EN'}
          </button>

          {user?.role !== 'admin' && (
            <Link to="/cart" className={iconBtn} title={t('cart')}>
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cart?.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-lime-accent text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cart.length}</span>}
            </Link>
          )}

          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <Link to="/myorders" className={iconBtn} title={t('myOrdersNav')}><Package className="w-[18px] h-[18px]" /></Link>
                  <Link to="/wallet" className={iconBtn} title="Wallet"><Wallet className="w-[18px] h-[18px]" /></Link>
                </>
              )}
              {(user.role === 'customer' || user.role === 'vendor') && (
                <Link to="/complaints" className={iconBtn} title={t('myComplaintsNav')}><MessageSquare className="w-[18px] h-[18px]" /></Link>
              )}
              {user.role === 'vendor' && (
                <Link to="/vendor-dashboard" className={iconBtn} title={t('vendorDashboardNav')}><Store className="w-[18px] h-[18px]" /></Link>
              )}
              {user.role === 'admin' ? (
                <Link to="/admin" className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-3 h-9 rounded-full border border-rose-100 mx-1">
                  <ShieldAlert className="w-4 h-4" /> {t('adminPanel')}
                </Link>
              ) : (
                <Link to="/profile" className="flex items-center gap-2 text-slate-700 hover:text-brand-700 px-2 h-9 rounded-full hover:bg-brand-50 transition-colors mx-1">
                  <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center"><User className="w-4 h-4" /></span>
                  <span className="font-semibold">{user?.name?.split(' ')[0]}</span>
                </Link>
              )}
              <button onClick={logout} className={`${iconBtn} hover:!bg-rose-50 hover:!text-rose-600`} title="Logout"><LogOut className="w-[18px] h-[18px]" /></button>
            </>
          ) : (
            <Link to="/login" className="px-3 h-9 flex items-center text-slate-700 hover:text-brand-700 font-semibold">{t('login')}</Link>
          )}

          <Link to={user ? '/chat' : '/register'} className="ml-2 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs pl-4 pr-1 h-9 rounded-full transition-colors">
            {user ? t('aiConsult') : t('signup')}
            <span className="w-7 h-7 rounded-full bg-lime-accent text-brand-800 flex items-center justify-center">
              {user ? <Stethoscope className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-2 ml-auto">
          {user?.role !== 'admin' && (
            <Link to="/cart" className={iconBtn} onClick={close}>
              <ShoppingCart className="w-5 h-5" />
              {cart?.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-lime-accent text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cart.length}</span>}
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-700 w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">

          {showNavSearch && (
            <form onSubmit={handleNavSearch} className="flex items-center bg-slate-100 rounded-full px-4 h-11 mb-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input value={navQuery} onChange={(e) => setNavQuery(e.target.value)} placeholder={t('searchPlaceholder')} className="flex-1 bg-transparent outline-none text-sm px-2.5" />
            </form>
          )}

          <button onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')} className="w-full flex items-center gap-2 px-3 py-2.5 bg-brand-50 text-brand-700 rounded-xl font-bold text-sm mb-2">
            <Languages className="w-4 h-4" /> {language === 'English' ? 'हिंदी में देखें' : 'View in English'}
          </button>

          <button onClick={() => go('/search')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Search className="w-4 h-4" /> {t('searchMeds')}</button>
          <button onClick={() => go('/chat')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Stethoscope className="w-4 h-4" /> {t('aiConsult')}</button>

          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <button onClick={() => go('/myorders')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Package className="w-4 h-4 text-brand-600" /> {t('myOrdersNav')}</button>
                  <button onClick={() => go('/wallet')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Wallet className="w-4 h-4 text-brand-600" /> MedMarket Wallet</button>
                </>
              )}
              {(user.role === 'customer' || user.role === 'vendor') && (
                <button onClick={() => go('/complaints')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><MessageSquare className="w-4 h-4" /> {t('myComplaintsNav')}</button>
              )}
              {user.role === 'admin' ? (
                <button onClick={() => go('/admin')} className="w-full flex items-center gap-2 px-3 py-3 text-rose-600 font-bold text-sm border-b border-slate-100"><ShieldAlert className="w-4 h-4" /> {t('adminPanel')}</button>
              ) : (
                <button onClick={() => go('/profile')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><User className="w-4 h-4 text-brand-600" /> {user?.name?.split(' ')[0]}</button>
              )}
              {user.role === 'vendor' && (
                <button onClick={() => go('/vendor-dashboard')} className="w-full flex items-center gap-2 px-3 py-3 text-slate-700 font-medium text-sm border-b border-slate-100"><Store className="w-4 h-4" /> {t('vendorDashboardNav')}</button>
              )}
              <button onClick={() => { close(); logout(); }} className="w-full flex items-center gap-2 px-3 py-3 text-rose-600 font-bold text-sm mt-2"><LogOut className="w-4 h-4" /> Logout</button>
            </>
          ) : (
            <div className="flex gap-3 pt-3">
              <button onClick={() => go('/login')} className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 font-bold rounded-full text-sm">{t('login')}</button>
              <button onClick={() => go('/register')} className="flex-1 px-4 py-2.5 bg-brand-600 text-white font-bold rounded-full text-sm">{t('signup')}</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
