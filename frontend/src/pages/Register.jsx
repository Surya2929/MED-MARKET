import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, User, Store, ShieldCheck, Mail, Lock, Phone, UserCircle } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [storeData, setStoreData] = useState({ storeName: '', address: '', licenseNumber: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
      
      {/* 🌟 RIGHT SIDE: Medical Pharmacy Image */}
      <div className="hidden lg:flex w-5/12 relative bg-teal-900">
        <img 
          src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop" 
          alt="Pharmacy Details" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-slate-100 w-full h-full">
          <h2 className="text-4xl font-bold leading-tight mb-4 mt-auto">
            Join the Healthiest Network.
          </h2>
          <p className="text-lg text-teal-100">
            Sign up to order medicines safely or register your pharmacy to reach more customers.
          </p>
        </div>
      </div>

      {/* 🌟 LEFT SIDE: Soft Eye-Comfort Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 bg-slate-300/30">
        <div className="w-full max-w-2xl bg-slate-100 p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-300">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Create an Account</h2>
            <p className="text-slate-600 mt-2 text-lg">It takes less than a minute.</p>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Soft Toggle */}
            <div className="flex p-1 bg-slate-300 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                  role === 'customer' ? 'bg-slate-100 text-blue-700 shadow-sm border border-slate-300' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <User className="w-5 h-5" /> I am a Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                  role === 'vendor' ? 'bg-slate-100 text-teal-700 shadow-sm border border-slate-300' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Store className="w-5 h-5" /> I am a Pharmacy
              </button>
            </div>

            {/* Basic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><UserCircle className="w-5 h-5 text-slate-500" /></div>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="w-5 h-5 text-slate-500" /></div>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="w-5 h-5 text-slate-500" /></div>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-slate-500" /></div>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Create a strong password" className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500" />
              </div>
            </div>

            {/* Vendor Details */}
            {role === 'vendor' && (
              <div className="mt-6 p-6 bg-teal-100/50 border border-teal-200 rounded-2xl space-y-4">
                <h3 className="font-bold text-teal-800 flex items-center gap-2 mb-4 text-lg">
                  <ShieldCheck className="w-6 h-6" /> Pharmacy Details
                </h3>
                
                <div>
                  <label className="block text-teal-900 font-semibold mb-2">Pharmacy Name</label>
                  <input type="text" required value={storeData.storeName} onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })} placeholder="E.g. Apollo Pharmacy" className="w-full px-4 py-3.5 bg-slate-200 border border-teal-300 rounded-xl text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/20 transition-all text-lg placeholder-slate-500" />
                </div>
                
                <div>
                  <label className="block text-teal-900 font-semibold mb-2">Full Address</label>
                  <input type="text" required value={storeData.address} onChange={(e) => setStoreData({ ...storeData, address: e.target.value })} placeholder="Shop 12, Main Market, Delhi" className="w-full px-4 py-3.5 bg-slate-200 border border-teal-300 rounded-xl text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/20 transition-all text-lg placeholder-slate-500" />
                </div>
                
                <div>
                  <label className="block text-teal-900 font-semibold mb-2">Drug License Number</label>
                  <input type="text" required value={storeData.licenseNumber} onChange={(e) => setStoreData({ ...storeData, licenseNumber: e.target.value })} placeholder="E.g. DL-98765" className="w-full px-4 py-3.5 bg-slate-200 border border-teal-300 rounded-xl text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/20 transition-all text-lg placeholder-slate-500" />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full text-slate-100 mt-6 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg ${
                role === 'vendor' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <UserPlus className="w-6 h-6" /> {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-600 text-lg mt-8 border-t border-slate-300 pt-6">
            Already have an account?{' '}
            <Link to="/login" className={`font-bold hover:underline ${role === 'vendor' ? 'text-teal-700' : 'text-blue-700'}`}>
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;