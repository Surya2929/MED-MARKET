import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, User, Store, Mail, Lock, ShieldPlus } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    if (res.success) {
      const userData = JSON.parse(localStorage.getItem('userInfo'));
      if (userData.role !== role) {
        logout();
        setError(`Access Denied! You are registered as a ${userData.role}.`);
        setLoading(false);
        return;
      }
      navigate(role === 'vendor' ? '/vendor-dashboard' : '/search');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] bg-slate-200">
      
      {/* 🌟 LEFT SIDE: Professional Medical Image */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900">
        <img 
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop" 
          alt="Friendly Doctor" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-end p-16 text-slate-100 w-full h-full">
          <ShieldPlus className="w-16 h-16 text-blue-300 mb-6" />
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your Trusted Healthcare Partner.
          </h1>
          <p className="text-lg text-blue-200 max-w-md">
            Find the right medicines at the right price. Verified pharmacies and easy AI assistance at your fingertips.
          </p>
        </div>
      </div>

      {/* 🌟 RIGHT SIDE: Soft Eye-Comfort Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-300/30">
        <div className="w-full max-w-md bg-slate-100 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-300">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-600 mt-2 text-lg">Please sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Soft Toggle Buttons (No White) */}
            <div className="flex p-1 bg-slate-300 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                  role === 'customer' ? 'bg-slate-100 text-blue-700 shadow-sm border border-slate-300' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <User className="w-5 h-5" /> Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                  role === 'vendor' ? 'bg-slate-100 text-teal-700 shadow-sm border border-slate-300' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Store className="w-5 h-5" /> Pharmacy/Vendor
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500" />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full text-slate-100 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg ${
                role === 'vendor' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <LogIn className="w-6 h-6" /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-600 text-lg mt-8 border-t border-slate-300 pt-6">
            New to MedMarket?{' '}
            <Link to="/register" className={`font-bold hover:underline ${role === 'vendor' ? 'text-teal-700' : 'text-blue-700'}`}>
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;