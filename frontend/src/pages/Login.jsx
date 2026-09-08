import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { User, Store, ShieldAlert, Mail, Lock, Eye, EyeOff, LogIn, X } from 'lucide-react';

const Login = () => {
  const { login, googleLogin, sendResetOtp, resetPassword } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [roleTab, setRoleTab] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState('phone');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const googleBtnRef = useRef(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/search');
    else alert(result.message);
  };

  useEffect(() => {
    if (roleTab !== 'customer' || !window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const result = await googleLogin(response.credential);
        if (result.success) navigate('/search');
        else alert(result.message);
      }
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: 320 });
  }, [roleTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendResetOtp = async () => {
    if (!/^\d{10}$/.test(resetPhone)) return alert('Enter a valid 10-digit phone number.');
    setResetLoading(true);
    const result = await sendResetOtp(resetPhone);
    setResetLoading(false);
    if (result.success) { setResetStep('otp'); alert('OTP sent to your registered phone number.'); }
    else alert(result.message);
  };

  const handleResetPassword = async () => {
    if (!resetOtp || !newPassword) return alert('Enter the OTP and a new password.');
    setResetLoading(true);
    const result = await resetPassword(resetPhone, resetOtp, newPassword);
    setResetLoading(false);
    if (result.success) {
      alert(result.message);
      setShowForgot(false); setResetStep('phone'); setResetPhone(''); setResetOtp(''); setNewPassword('');
    } else alert(result.message);
  };

  const roleTabs = [
    { key: 'customer', label: 'Customer', icon: User },
    { key: 'vendor', label: 'Pharmacy', icon: Store },
    { key: 'admin', label: 'Admin', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-[85vh] bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-black text-slate-900 text-center">Welcome Back</h1>
        <p className="text-sm text-slate-500 text-center mt-1 mb-6">Please sign in to your account</p>

        <div className="grid grid-cols-3 bg-slate-100 rounded-xl p-1 mb-6">
          {roleTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setRoleTab(key)}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${roleTab === key ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-600 block">Password</label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" className="w-full pl-9 pr-9 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:bg-slate-300">
            <LogIn size={16} /> {loading ? 'Signing In...' : 'Sign In securely'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          New to MedMarket? <a href="/register" className="text-blue-600 font-bold hover:underline">Create an account</a>
        </p>

        {roleTab === 'customer' && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400 font-bold">OR</span><div className="flex-1 h-px bg-slate-200" />
            </div>
            <div ref={googleBtnRef} className="flex justify-center" />
          </>
        )}
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Reset Password</h3>
              <button onClick={() => setShowForgot(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            {resetStep === 'phone' ? (
              <>
                <p className="text-xs text-slate-500 mb-3">We'll verify it's you using an OTP sent to your registered phone.</p>
                <input type="tel" value={resetPhone} onChange={e => setResetPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Registered phone number" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 mb-3" />
                <button onClick={handleSendResetOtp} disabled={resetLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm disabled:bg-slate-300">
                  {resetLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <input type="text" value={resetOtp} onChange={e => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Enter 4-digit OTP" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 mb-3" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 mb-3" />
                <button onClick={handleResetPassword} disabled={resetLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm disabled:bg-slate-300">
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;