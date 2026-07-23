import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api'; // 🚀 FIX: Imported API for sending OTP
import { LogIn, User, Store, Mail, Lock, ShieldPlus, Phone, KeyRound, ShieldAlert, Eye, EyeOff, X } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('customer');
  const [loginMethod, setLoginMethod] = useState('email'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🚀 Forgot Password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [fpPhone, setFpPhone] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpOtpSent, setFpOtpSent] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState(null);
  const [fpSuccess, setFpSuccess] = useState(null);
  
  const { login, otpLogin, googleLogin, sendResetOtp, resetPassword, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const handleSendOTP = async () => {
    if (phone.length < 10) return setError("Please enter a valid 10-digit phone number.");
    setLoading(true);
    setError(null);
    try {
      await API.post('/auth/send-otp', { phone });
      setOtpSent(true);
      alert("📲 OTP sent! (No SMS gateway is configured yet, so check the backend server console/logs for the code.)");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (loginMethod === 'otp') {
      const res = await otpLogin(phone, otp);
      if (res.success) {
        navigate('/search');
      } else {
        setError(res.message);
        setLoading(false);
      }
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const userData = JSON.parse(localStorage.getItem('userInfo'));
      if (userData.role !== role) {
        logout();
        setError(`Access Denied! You are registered as a ${userData.role}, not an ${role}.`);
        setLoading(false);
        return;
      }
      if (role === 'admin') navigate('/admin');
      else if (role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/search');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  const handleForgotSendOtp = async () => {
    if (fpPhone.length < 10) return setFpError("Please enter a valid 10-digit phone number.");
    setFpLoading(true); setFpError(null);
    const res = await sendResetOtp(fpPhone);
    if (res.success) {
      setFpOtpSent(true);
      alert("📲 OTP sent! (No SMS gateway is configured yet, so check the backend server console/logs for the code.)");
    } else { setFpError(res.message); }
    setFpLoading(false);
  };

  const handleForgotReset = async () => {
    if (fpNewPassword.length < 6) return setFpError("New password must be at least 6 characters.");
    setFpLoading(true); setFpError(null);
    const res = await resetPassword(fpPhone, fpOtp, fpNewPassword);
    if (res.success) {
      setFpSuccess(res.message);
    } else { setFpError(res.message); }
    setFpLoading(false);
  };

  const closeForgotModal = () => {
    setShowForgot(false);
    setFpPhone(''); setFpOtp(''); setFpNewPassword(''); setFpOtpSent(false); setFpError(null); setFpSuccess(null);
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || role !== 'customer' || loginMethod !== 'email') return;
    if (!window.google || !googleBtnRef.current) return;

    const handleGoogleResponse = async (response) => {
      setLoading(true); setError(null);
      const res = await googleLogin(response.credential);
      if (res.success) { navigate('/search'); } else { setError(res.message); setLoading(false); }
    };

    window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleResponse });
    window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' });
  }, [role, loginMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-[90vh] bg-slate-200">
      
      <div className="hidden lg:flex w-1/2 relative bg-blue-900">
        <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop" alt="Friendly Doctor" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-16 text-slate-100 w-full h-full">
          <ShieldPlus className="w-16 h-16 text-blue-300 mb-6" />
          <h1 className="text-4xl font-bold leading-tight mb-4">{t('heroTitle')}</h1>
          <p className="text-lg text-blue-200 max-w-md">{t('heroSub')}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-300/30">
        <div className="w-full max-w-md bg-slate-100 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-300">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">{t('welcomeBack')}</h2>
            <p className="text-slate-600 mt-2 text-lg">{t('pleaseSignIn')}</p>
          </div>

          {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-6 font-medium">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="flex p-1 bg-slate-300 rounded-xl">
              <button type="button" onClick={() => {setRole('customer'); setLoginMethod('email');}} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${role === 'customer' ? 'bg-slate-100 text-blue-700 shadow-sm border border-slate-300' : 'text-slate-600 hover:text-slate-800'}`}>
                <User className="w-4 h-4" /> {t('customerTab')}
              </button>
              <button type="button" onClick={() => {setRole('vendor'); setLoginMethod('email');}} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${role === 'vendor' ? 'bg-slate-100 text-teal-700 shadow-sm border border-slate-300' : 'text-slate-600 hover:text-slate-800'}`}>
                <Store className="w-4 h-4" /> {t('pharmacyTab')}
              </button>
              <button type="button" onClick={() => {setRole('admin'); setLoginMethod('email');}} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-slate-100 text-rose-700 shadow-sm border border-slate-300' : 'text-slate-600 hover:text-slate-800'}`}>
                <ShieldAlert className="w-4 h-4" /> {t('adminTab')}
              </button>
            </div>

            {role === 'customer' && (
              <div className="flex border-b border-slate-300 pb-2 gap-4">
                <button type="button" onClick={() => setLoginMethod('email')} className={`pb-2 font-bold text-sm transition-all ${loginMethod === 'email' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-500'}`}>{t('emailLogin')}</button>
                <button type="button" onClick={() => setLoginMethod('otp')} className={`pb-2 font-bold text-sm transition-all ${loginMethod === 'otp' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-slate-500'}`}>{t('phoneOtpLogin')}</button>
              </div>
            )}

            {loginMethod === 'email' || role === 'vendor' || role === 'admin' ? (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">{t('emailAddress')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="w-5 h-5 text-slate-500" /></div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('enterEmail')} className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-slate-700 font-semibold">{t('password')}</label>
                    {role === 'customer' && (
                      <button type="button" onClick={() => setShowForgot(true)} className="text-blue-700 text-sm font-bold hover:underline">{t('forgotPassword')}</button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-slate-500" /></div>
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('enterPassword')} className="w-full pl-12 pr-12 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg placeholder-slate-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">{t('phoneNumber')}</label>
                  <div className="relative flex">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="w-5 h-5 text-slate-500" /></div>
                    <span className="absolute inset-y-0 left-10 flex items-center pl-2 text-slate-700 font-bold border-r border-slate-300 pr-2">+91</span>
                    <input type="tel" required disabled={otpSent} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} placeholder={t('enter10DigitNumber')} className="w-full pl-[5.5rem] pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg font-bold tracking-wider placeholder-slate-500" />
                  </div>
                </div>

                {otpSent ? (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">{t('enterOtp')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="w-5 h-5 text-slate-500" /></div>
                      <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder={t('enter4DigitOtp')} className="w-full pl-12 pr-4 py-3.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg font-black tracking-widest text-center placeholder-slate-500" />
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={handleSendOTP} disabled={loading || phone.length < 10} className="w-full text-blue-800 bg-blue-100 hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-400 border border-blue-300 py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm">
                    {loading ? t('sendingOtp') : t('getOtp')}
                  </button>
                )}
              </div>
            )}

            {(loginMethod === 'email' || otpSent || role === 'vendor' || role === 'admin') && (
              <button type="submit" disabled={loading} className={`w-full text-slate-100 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-md hover:shadow-lg ${role === 'vendor' ? 'bg-teal-700 hover:bg-teal-800' : role === 'admin' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-blue-700 hover:bg-blue-800'}`}>
                <LogIn className="w-6 h-6" /> {loading ? t('verifying') : t('signInSecurely')}
              </button>
            )}
          </form>

          {/* 🚀 Google Sign-In (Customer + Email tab only) */}
          {role === 'customer' && loginMethod === 'email' && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-300"></div>
                <span className="text-xs font-bold text-slate-400 uppercase">or</span>
                <div className="flex-1 h-px bg-slate-300"></div>
              </div>
              <div ref={googleBtnRef} className="flex justify-center"></div>
              {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                <p className="text-[10px] text-slate-400 text-center mt-2">Google login isn't configured yet.</p>
              )}
            </div>
          )}

          <p className="text-center text-slate-600 text-lg mt-8 border-t border-slate-300 pt-6">
            {t('newToMedMarket')} <Link to="/register" className={`font-bold hover:underline ${role === 'vendor' ? 'text-teal-700' : 'text-blue-700'}`}>{t('createAccount')}</Link>
          </p>

        </div>
      </div>

      {/* 🚀 FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={closeForgotModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={20}/></button>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{t('resetPasswordTitle')}</h3>
            <p className="text-sm text-slate-500 mb-5">{t('resetPasswordDesc')}</p>

            {fpError && <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-3 rounded-md mb-4 text-sm font-medium">{fpError}</div>}

            {fpSuccess ? (
              <div className="text-center py-4">
                <p className="text-emerald-600 font-bold mb-4">{fpSuccess}</p>
                <button onClick={closeForgotModal} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-bold">{t('backToLogin')}</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 text-sm">{t('phoneNumber')}</label>
                  <div className="relative flex">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="w-4 h-4 text-slate-500" /></div>
                    <span className="absolute inset-y-0 left-8 flex items-center pl-2 text-slate-700 font-bold border-r border-slate-300 pr-2 text-sm">+91</span>
                    <input type="tel" disabled={fpOtpSent} value={fpPhone} onChange={(e) => setFpPhone(e.target.value.replace(/\D/g, '').slice(0,10))} placeholder={t('enter10DigitNumber')} className="w-full pl-[4.5rem] pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500 text-sm font-bold tracking-wider" />
                  </div>
                </div>

                {!fpOtpSent ? (
                  <button onClick={handleForgotSendOtp} disabled={fpLoading || fpPhone.length < 10} className="w-full text-blue-800 bg-blue-100 hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-400 border border-blue-300 py-2.5 rounded-lg font-bold text-sm transition-all">
                    {fpLoading ? t('sendingOtp') : t('sendOtp')}
                  </button>
                ) : (
                  <>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1.5 text-sm">{t('enterOtp')}</label>
                      <input type="text" value={fpOtp} onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder={t('enter4DigitOtp')} className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500 text-sm font-black tracking-widest text-center" />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1.5 text-sm">{t('newPassword')}</label>
                      <input type="password" minLength={6} value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500 text-sm" />
                    </div>
                    <button onClick={handleForgotReset} disabled={fpLoading || !fpOtp || fpNewPassword.length < 6} className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white py-2.5 rounded-lg font-bold text-sm transition-all">
                      {fpLoading ? t('resetting') : t('resetPasswordBtn')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;