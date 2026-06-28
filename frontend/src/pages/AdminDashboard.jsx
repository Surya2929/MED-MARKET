import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ShieldAlert, Users, Store, ShieldCheck, Ban, CheckCircle2, AlertTriangle, MapPin, FileText, Phone, Mail, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors'); 

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const { data } = await API.get('/users/admin/all');
      setUsersList(data);
    } catch (err) {
      console.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (userId) => {
    try {
      await API.put(`/users/admin/block/${userId}`);
      fetchData(); 
    } catch(e) { alert("Error updating user status"); }
  };

  const handleVerifyToggle = async (storeId) => {
    try {
      await API.put(`/users/admin/verify-store/${storeId}`);
      fetchData(); 
    } catch(e) { alert("Error verifying store"); }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-bold flex items-center justify-center gap-2"><div className="w-5 h-5 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div> Loading Command Center...</div>;

  const customers = usersList.filter(u => u.role === 'customer');
  const vendors = usersList.filter(u => u.role === 'vendor');
  const verifiedStores = vendors.filter(v => v.store?.isVerified).length;
  const pendingStores = vendors.length - verifiedStores;

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      
      {/* 🌟 PREMIUM ADMIN HEADER */}
      <div className="bg-slate-900 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-luminosity"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500 p-3.5 rounded-2xl shadow-lg shadow-rose-500/30">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Command Center</h1>
              <p className="text-slate-400 font-medium text-sm mt-1">System Oversight & Partner Verification</p>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" /> Live Data Sync Active
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        
        {/* 🌟 ANALYTICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customers</p>
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users className="w-5 h-5" /></div>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{customers.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Vendors</p>
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Store className="w-5 h-5" /></div>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{vendors.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Pharmacies</p>
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><ShieldCheck className="w-5 h-5" /></div>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{verifiedStores}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 relative overflow-hidden">
            {pendingStores > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-amber-400 animate-pulse"></div>}
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Action</p>
              <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><AlertTriangle className="w-5 h-5" /></div>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{pendingStores} <span className="text-sm font-bold text-slate-400">awaiting</span></h3>
          </div>
        </div>

        {/* 🌟 TAB SWITCHER */}
        <div className="flex gap-3 mb-6 bg-slate-200/50 p-1.5 rounded-xl w-fit">
          <button onClick={() => setActiveTab('vendors')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'vendors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Store className="w-4 h-4" /> Pharmacies/Vendors
          </button>
          <button onClick={() => setActiveTab('customers')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'customers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Users className="w-4 h-4" /> Users/Customers
          </button>
        </div>

        {/* 🌟 VENDOR DATA TABLE */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-5 w-1/4">Vendor Profile</th>
                    <th className="p-5 w-1/3">Pharmacy Info & License</th>
                    <th className="p-5 text-center w-1/5">Live Status</th>
                    <th className="p-5 text-right w-1/5">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map(v => (
                    <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* VENDOR PROFILE */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shadow-sm border border-indigo-200">
                            {v.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-[15px]">{v.name}</p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3"/> {v.phone}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Mail className="w-3 h-3"/> {v.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* PHARMACY & LICENSE INFO */}
                      <td className="p-5">
                        {v.store ? (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="font-bold text-slate-800 text-[14px] flex items-center gap-1.5 mb-1.5">
                              {v.store.storeName}
                              {v.store.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </p>
                            <p className="text-xs text-slate-500 flex items-start gap-1 mb-2">
                              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400"/> {v.store.address}
                            </p>
                            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md">
                              <FileText className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">DL: <span className="text-slate-900">{v.store.licenseNumber || 'Not Provided'}</span></span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 inline-flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" /> Store Setup Incomplete
                          </div>
                        )}
                      </td>
                      
                      {/* VERIFICATION STATUS */}
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <button 
                            disabled={!v.store}
                            onClick={() => handleVerifyToggle(v.store._id)} 
                            className={`relative inline-flex items-center h-6 rounded-full w-12 transition-all focus:outline-none shadow-inner border border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${v.store?.isVerified ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-300 border-slate-400'}`}
                          >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-md ${v.store?.isVerified ? 'translate-x-7' : 'translate-x-1'}`}/>
                          </button>
                          <div className="text-[10px] font-black tracking-widest uppercase">
                            {v.store?.isVerified ? <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span> : <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded">Pending Auth</span>}
                          </div>
                        </div>
                      </td>

                      {/* ACCOUNT ACCESS (BLOCK/UNBLOCK) */}
                      <td className="p-5 text-right">
                         <div className="flex flex-col items-end gap-2">
                           <button 
                            onClick={() => handleBlockToggle(v._id)} 
                            className={`relative inline-flex items-center h-6 rounded-full w-12 transition-all focus:outline-none shadow-inner border border-transparent ${v.isBlocked ? 'bg-rose-500 border-rose-600' : 'bg-blue-500 border-blue-600'}`}
                           >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-md ${v.isBlocked ? 'translate-x-1' : 'translate-x-7'}`}/>
                           </button>
                           <div className="text-[10px] font-black tracking-widest uppercase">
                            {v.isBlocked ? <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1"><Ban className="w-3 h-3"/> Suspended</span> : <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Access Granted</span>}
                           </div>
                         </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🌟 CUSTOMERS DATA TABLE */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-5">Customer Profile</th>
                  <th className="p-5">Contact Details</th>
                  <th className="p-5 text-right">System Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold text-slate-900 text-base flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200">
                        {c.name.charAt(0)}
                      </div>
                      {c.name}
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-slate-700 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {c.email}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {c.phone}</p>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end gap-2">
                         <button onClick={() => handleBlockToggle(c._id)} className={`relative inline-flex items-center h-6 rounded-full w-12 transition-all focus:outline-none shadow-inner border border-transparent ${c.isBlocked ? 'bg-rose-500 border-rose-600' : 'bg-emerald-500 border-emerald-600'}`}>
                          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-md ${c.isBlocked ? 'translate-x-1' : 'translate-x-7'}`}/>
                         </button>
                         <div className="text-[10px] font-black tracking-widest uppercase">
                          {c.isBlocked ? <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1"><Ban className="w-3 h-3"/> Blocked</span> : <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>}
                         </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;