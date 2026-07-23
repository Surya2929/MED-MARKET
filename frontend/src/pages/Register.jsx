import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { UserPlus, User, Store, ShieldCheck, Mail, Lock, Phone, UserCircle, Eye, EyeOff, MapPin, Globe } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [storeData, setStoreData] = useState({ storeName: '', address: '', licenseNumber: '', storeType: 'offline' }); // 🚀 DEFAULT LOCAL
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.phone.length !== 10) {
      setError("Please enter exactly a 10-digit mobile number.");
      setLoading(false); return;
    }

    try {
      const payload = role === 'vendor' ? { ...formData, ...storeData, role } : { ...formData, role };
      await API.post('/auth/register', payload);
      await login(formData.email, formData.password);
      navigate(role === 'vendor' ? '/vendor-dashboard' : '/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] bg-slate-200 flex-row-reverse">
      <div className="hidden lg:flex w-5/12 relative bg-teal-900">
        <img src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop" alt="Pharmacy" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-slate-100 w-full h-full">
          <h2 className="text-4xl font-bold leading-tight mb-4 mt-auto">{t('joinNetwork')}</h2>
          <p className="text-lg text-teal-100">{t('joinNetworkDesc')}</p>
        </div>
      </div>

      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 bg-slate-300/30">
        <div className="w-full max-w-2xl bg-slate-100 p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-300">
          <div className="mb-8"><h2 className="text-3xl font-bold text-slate-800">{t('createAccountTitle')}</h2><p className="text-slate-600 mt-2 text-lg">{t('takesAMinute')}</p></div>

          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-6 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex p-1 bg-slate-300 rounded-xl mb-6">
              <button type="button" onClick={() => setRole('customer')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${role === 'customer' ? 'bg-slate-100 text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}><User className="w-5 h-5" /> {t('iAmCustomer')}</button>
              <button type="button" onClick={() => setRole('vendor')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${role === 'vendor' ? 'bg-slate-100 text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}><Store className="w-5 h-5" /> {t('iAmPharmacy')}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative"><UserCircle className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t('fullName')} className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500" /></div>
              <div className="relative"><Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="9876543210" className="w-full pl-[3.5rem] pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500" /></div>
            </div>

            <div className="relative"><Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t('emailAddressPlaceholder')} className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500" /></div>
            <div className="relative"><Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><input type={showPassword ? "text" : "password"} required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={t('createPassword')} className="w-full pl-12 pr-12 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>

            {role === 'vendor' && (
              <div className="mt-6 p-6 bg-teal-100/50 border border-teal-200 rounded-2xl space-y-4">
                <h3 className="font-bold text-teal-800 flex items-center gap-2 mb-4 text-lg"><ShieldCheck className="w-6 h-6" /> {t('pharmacyDetailsTitle')}</h3>
                
                {/* 🚀 ONLINE OR LOCAL VENDOR SELECTION */}
                <div className="flex gap-4 mb-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${storeData.storeType === 'offline' ? 'bg-white border-teal-500 text-teal-800 shadow-sm' : 'border-slate-300 text-slate-500'}`}>
                    <input type="radio" name="storeType" value="offline" checked={storeData.storeType === 'offline'} onChange={(e) => setStoreData({...storeData, storeType: e.target.value})} className="hidden" />
                    <MapPin className="w-4 h-4"/> {t('localStore')}
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${storeData.storeType === 'online' ? 'bg-white border-teal-500 text-teal-800 shadow-sm' : 'border-slate-300 text-slate-500'}`}>
                    <input type="radio" name="storeType" value="online" checked={storeData.storeType === 'online'} onChange={(e) => setStoreData({...storeData, storeType: e.target.value})} className="hidden" />
                    <Globe className="w-4 h-4"/> {t('nationalOnline')}
                  </label>
                </div>
                
                <input type="text" required value={storeData.storeName} onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })} placeholder={t('storeNamePlaceholder')} className="w-full px-4 py-3.5 bg-slate-200 rounded-xl outline-none focus:border-teal-600" />
                <input type="text" required value={storeData.address} onChange={(e) => setStoreData({ ...storeData, address: e.target.value })} placeholder={storeData.storeType === 'offline' ? t('fullLocalAddress') : t('warehouseAddress')} className="w-full px-4 py-3.5 bg-slate-200 rounded-xl outline-none focus:border-teal-600" />
                <input type="text" required value={storeData.licenseNumber} onChange={(e) => setStoreData({ ...storeData, licenseNumber: e.target.value })} placeholder={t('drugLicenseNumber')} className="w-full px-4 py-3.5 bg-slate-200 rounded-xl outline-none focus:border-teal-600" />
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full text-slate-100 mt-6 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg ${role === 'vendor' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-blue-700 hover:bg-blue-800'}`}>
              <UserPlus className="w-6 h-6" /> {loading ? t('creatingAccount') : t('createAccountBtn')}
            </button>
          </form>

          <p className="text-center text-slate-600 text-lg mt-8 border-t border-slate-300 pt-6">
            {t('alreadyHaveAccount')} <Link to="/login" className="font-bold text-blue-700 hover:underline">{t('signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;