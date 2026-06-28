import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, Lock, Store, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [storeData, setStoreData] = useState({ storeName: '', address: '', licenseNumber: '' });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/users/profile');
        setFormData({ name: data.name, phone: data.phone, password: '' });
        if (data.store) {
          setStoreData({
            storeName: data.store.storeName,
            address: data.store.address,
            licenseNumber: data.store.licenseNumber
          });
        }
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);
    setError(null);

    try {
      const payload = user.role === 'vendor' ? { ...formData, ...storeData } : formData;
      const { data } = await API.put('/users/profile', payload);
      setMessage(data.message);
      setFormData({ ...formData, password: '' }); 
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-500 font-bold">Loading Profile...</div>;

  return (
    <div className="bg-slate-50 min-h-[90vh] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 flex items-center gap-6 text-white">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-slate-800">
              {formData.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black">{formData.name}</h1>
              <p className="text-slate-400 font-medium flex items-center gap-2 mt-1">
                {user?.email} <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{user?.role}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {message && <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> {message}</div>}
            {error && <div className="bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> {error}</div>}

            <div>
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {user?.role === 'vendor' && (
              <div>
                <h3 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-6 flex items-center gap-2"><Store className="w-5 h-5 text-teal-600"/> Pharmacy Details</h3>
                <div className="space-y-4">
                  <input type="text" value={storeData.storeName} onChange={(e) => setStoreData({...storeData, storeName: e.target.value})} placeholder="Store Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium" />
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input type="text" value={storeData.address} onChange={(e) => setStoreData({...storeData, address: e.target.value})} placeholder="Store Address" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-slate-800 font-medium" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2 mb-6 text-rose-600">Security</h3>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password (Optional)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Leave blank to keep current password" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-800 font-medium" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-black text-lg transition-all shadow-md">
              {updating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;