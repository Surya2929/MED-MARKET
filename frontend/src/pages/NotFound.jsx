import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { PackageX, Home } from 'lucide-react';

const NotFound = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <PackageX className="w-20 h-20 text-slate-300 mb-6" />
      <h1 className="text-6xl font-black text-slate-800 mb-2">404</h1>
      <p className="text-slate-500 mb-8">{t('pageNotFoundMsg')}</p>
      <Link to="/search" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
        <Home size={18}/> {t('backToHome')}
      </Link>
    </div>
  );
};

export default NotFound;