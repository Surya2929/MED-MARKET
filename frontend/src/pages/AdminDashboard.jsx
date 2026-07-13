import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ShieldAlert, Users, Store, ShieldCheck, Ban, AlertTriangle, MapPin, FileText, Phone, Mail, Clock, Check, X, CheckCircle2, PackageOpen, Package, AlertOctagon, MessageSquare, ArrowUpDown, RotateCcw } from 'lucide-react';
import ComplaintChat from '../components/ComplaintChat';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors'); 
  const [openReport, setOpenReport] = useState(null); // 🚀 report currently open in the chat modal

  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [modalStoreId, setModalStoreId] = useState(null);
  const [modalStoreName, setModalStoreName] = useState('');
  const [storeInventory, setStoreInventory] = useState([]);
  const [invLoading, setInvLoading] = useState(false);

  // 🚀 NEW: Customers tab filter/sort state
  const [customerSort, setCustomerSort] = useState('none'); // none | orders | returns
  const [onlyWithReturns, setOnlyWithReturns] = useState(false);

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
      setUsersList(data || []); 
      
      const reportRes = await API.get('/reports/admin/all');
      setReportsList(reportRes.data || []);
    } catch (err) {
      console.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (userId) => {
    if(!window.confirm("Are you sure you want to change this user's account access?")) return;
    try {
      await API.put(`/users/admin/block/${userId}`);
      fetchData(); 
    } catch(e) { alert("Error updating user status"); }
  };

  const handleVerifyToggle = async (storeId) => {
    if(!storeId) return;
    try {
      await API.put(`/users/admin/verify-store/${storeId}`);
      fetchData(); 
    } catch(e) { alert("Error verifying store"); }
  };

  const handleRejectVendor = async (userId) => {
    if(!window.confirm("WARNING: This will permanently delete this Vendor's registration request. Continue?")) return;
    try {
      await API.delete(`/users/admin/reject-vendor/${userId}`);
      fetchData(); 
    } catch(e) { alert("Error rejecting vendor"); }
  };

  const handleViewInventory = async (storeId, storeName) => {
    setInventoryModalOpen(true);
    setModalStoreId(storeId);
    setModalStoreName(storeName);
    setInvLoading(true);
    setStoreInventory([]);
    try {
      const { data } = await API.get(`/users/admin/store-inventory/${storeId}`);
      setStoreInventory(data);
    } catch (error) {
      alert("Failed to load inventory");
    } finally {
      setInvLoading(false);
    }
  };

  // 🚀 NEW: block/unblock one specific medicine listing (without touching the whole store)
  const handleToggleInventoryBlock = async (inventoryId) => {
    try {
      await API.put(`/users/admin/inventory/${inventoryId}/block`);
      handleViewInventory(modalStoreId, modalStoreName); // refresh the modal's list
    } catch (e) { alert("Failed to update listing"); }
  };

  const handleReportAction = async (reportId, status) => {
    try {
      await API.put(`/reports/admin/${reportId}/status`, { status });
      fetchData();
    } catch(e) { alert("Failed to update report"); }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-bold">Loading Command Center...</div>;

  const customers = usersList?.filter(u => u?.role === 'customer') || [];
  const vendors = usersList?.filter(u => u?.role === 'vendor') || [];
  const verifiedStores = vendors.filter(v => v?.store?.isVerified === true).length;
  const pendingStores = vendors.length - verifiedStores;
  const pendingReports = reportsList.filter(r => r.status === 'Pending').length;

  // 🚀 NEW: filtered/sorted customer list for the Customers tab
  const filteredCustomers = customers
    .filter(c => !onlyWithReturns || (c.totalReturns || 0) > 0)
    .sort((a, b) => {
      if (customerSort === 'orders') return (b.totalOrders || 0) - (a.totalOrders || 0);
      if (customerSort === 'returns') return (b.totalReturns || 0) - (a.totalReturns || 0);
      return 0;
    });

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">

      {/* 🚀 INVENTORY MODAL (Restored) */}
      {inventoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-3xl max-h-[85vh] flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Package className="w-6 h-6 text-blue-600" /> {modalStoreName}'s Live Inventory</h3>
              <button onClick={() => setInventoryModalOpen(false)} className="bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {invLoading ? (
                <div className="py-20 text-center text-slate-500 font-bold">Fetching Live Data...</div>
              ) : storeInventory.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center"><PackageOpen className="w-16 h-16 text-slate-200 mb-4" /><h4 className="text-lg font-bold text-slate-600">Inventory is Empty</h4></div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200">
                    <tr><th className="p-4">Medicine Info</th><th className="p-4 text-center">Listed Price</th><th className="p-4 text-center">Current Stock</th><th className="p-4 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeInventory.map(item => (
                      <tr key={item._id} className={`hover:bg-slate-50 transition-colors ${item.isBlocked ? 'bg-rose-50/40' : ''}`}>
                        <td className="p-4">
                          <p className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-2">
                            {item.medicineId?.name || 'Unknown'}
                            {item.isBlocked && <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded uppercase">Blocked</span>}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.medicineId?.composition || 'No Salt Info'}</p>
                        </td>
                        <td className="p-4 text-center font-black text-slate-800 text-base">₹{item.price}</td>
                        <td className="p-4 text-center">{item.stock > 0 ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md font-bold text-xs">{item.stock}</span> : <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md font-bold text-xs">Out of Stock</span>}</td>
                        <td className="p-4 text-right">
                          {item.isBlocked ? (
                            <button onClick={() => handleToggleInventoryBlock(item._id)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md text-xs font-bold border border-emerald-200 transition-colors inline-flex items-center gap-1"><RotateCcw size={12}/> Unblock</button>
                          ) : (
                            <button onClick={() => handleToggleInventoryBlock(item._id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-md text-xs font-bold border border-rose-200 transition-colors inline-flex items-center gap-1"><Ban size={12}/> Block</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 ADMIN HEADER */}
      <div className="bg-slate-900 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-luminosity"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500 p-3.5 rounded-2xl shadow-lg"><ShieldAlert className="w-8 h-8 text-white" /></div>
            <div><h1 className="text-3xl font-black text-white tracking-tight">Command Center</h1></div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" /> Live Data Sync Active
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        
        <div className="flex gap-3 mb-6 bg-slate-200/50 p-1.5 rounded-xl w-fit overflow-x-auto">
          <button onClick={() => setActiveTab('vendors')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'vendors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Store className="w-4 h-4" /> Pharmacies</button>
          <button onClick={() => setActiveTab('customers')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'customers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Users className="w-4 h-4" /> Customers</button>
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${activeTab === 'reports' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <AlertOctagon className="w-4 h-4"/> Complaints
            {pendingReports > 0 && <span className={`px-1.5 rounded-full text-[10px] ${activeTab === 'reports' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'}`}>{pendingReports}</span>}
          </button>
        </div>

        {/* 🚀 TAB 1: VENDORS */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[900px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr><th className="p-5 w-1/4">Vendor Profile</th><th className="p-5 w-1/3">Pharmacy Info & License</th><th className="p-5 text-center">Store Inventory</th><th className="p-5 text-right w-1/4">Admin Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map(v => (
                    <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shadow-sm border border-indigo-200">{v?.name?.charAt(0) || '?'}</div>
                          <div><p className="font-extrabold text-slate-900 text-[15px]">{v?.name || 'Unknown'}</p><p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3"/> {v?.phone || 'N/A'}</p><p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Mail className="w-3 h-3"/> {v?.email || 'N/A'}</p></div>
                        </div>
                      </td>
                      <td className="p-5">
                        {v?.store?.storeName ? (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="font-bold text-slate-800 text-[14px] flex items-center gap-1.5 mb-1.5">{v.store.storeName}{v.store.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" title="Verified"/>}</p>
                            <p className="text-xs text-slate-500 flex items-start gap-1 mb-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400"/> {v.store.address || 'Address not provided'}</p>
                            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md"><FileText className="w-3 h-3 text-blue-500" /><span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">DL: <span className="text-slate-900">{v.store.licenseNumber || 'Not Provided'}</span></span></div>
                          </div>
                        ) : (<div className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Store Setup Incomplete</div>)}
                      </td>
                      <td className="p-5 text-center">
                        {v?.store ? (
                          <button onClick={() => handleViewInventory(v.store._id, v.store.storeName)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border border-blue-200 shadow-sm mx-auto"><Package className="w-4 h-4" /> View Stock</button>
                        ) : (<span className="text-slate-400 text-xs">-</span>)}
                      </td>
                      <td className="p-5 text-right">
                        {v?.store && !v.store.isVerified ? (
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded border border-amber-100">Pending Approval</span>
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => handleVerifyToggle(v.store._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"><Check className="w-4 h-4"/> Approve</button>
                              <button onClick={() => handleRejectVendor(v._id)} className="bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-slate-200 hover:border-rose-200"><X className="w-4 h-4"/> Reject</button>
                            </div>
                          </div>
                        ) : v?.store?.isVerified ? (
                          <div className="flex flex-col items-end gap-2">
                             {v?.isBlocked ? (
                                <button onClick={() => handleBlockToggle(v._id)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm border border-emerald-200"><ShieldCheck className="w-4 h-4"/> Reactivate Store</button>
                              ) : (
                                <button onClick={() => handleBlockToggle(v._id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm border border-rose-200"><Ban className="w-4 h-4"/> Suspend Store</button>
                              )}
                              <span className={`text-[10px] font-black uppercase tracking-widest ${v.isBlocked ? 'text-rose-500' : 'text-emerald-500'}`}>{v.isBlocked ? 'Store Suspended' : 'Live on MedMarket'}</span>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🚀 TAB 2: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="max-w-4xl">
            {/* 🚀 NEW: Filter/Sort toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400"/>
                <label className="text-xs font-bold text-slate-600">Sort by:</label>
                <select value={customerSort} onChange={e => setCustomerSort(e.target.value)} className="text-xs font-bold border border-slate-300 rounded-md px-2 py-1.5 outline-none focus:border-blue-500 bg-white">
                  <option value="none">Default</option>
                  <option value="orders">Most Orders Placed</option>
                  <option value="returns">Most Returns</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={onlyWithReturns} onChange={e => setOnlyWithReturns(e.target.checked)} className="w-4 h-4 accent-rose-600 cursor-pointer" />
                Only show customers with returns
              </label>
              <span className="text-xs text-slate-400 ml-auto">{filteredCustomers.length} of {customers.length} customers</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-5">Customer Profile</th>
                    <th className="p-5">Contact Details</th>
                    <th className="p-5 text-center">Orders Placed</th>
                    <th className="p-5 text-center">Returns</th>
                    <th className="p-5 text-right">Account Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr><td colSpan="5" className="text-center p-8 font-bold text-slate-400">No customers match this filter.</td></tr>
                  ) : filteredCustomers.map(c => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 font-bold text-slate-900 text-base flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200">{c?.name?.charAt(0) || '?'}</div>{c?.name || 'Unknown'}
                      </td>
                      <td className="p-5"><p className="font-bold text-slate-700 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {c?.email || 'N/A'}</p><p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {c?.phone || 'N/A'}</p></td>
                      <td className="p-5 text-center"><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold text-xs">{c.totalOrders || 0}</span></td>
                      <td className="p-5 text-center">
                        {c.totalReturns > 0 ? <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-bold text-xs">{c.totalReturns}</span> : <span className="text-slate-300 text-xs">0</span>}
                      </td>
                      <td className="p-5 text-right">
                        {c?.isBlocked ? (
                          <button onClick={() => handleBlockToggle(c._id)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm border border-emerald-200"><CheckCircle2 className="w-4 h-4"/> Unblock</button>
                        ) : (
                          <button onClick={() => handleBlockToggle(c._id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm border border-rose-200"><Ban className="w-4 h-4"/> Suspend</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🚀 TAB 3: REPORTS & COMPLAINTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
                <thead className="bg-rose-50 text-rose-800 font-bold uppercase tracking-wider text-[10px] border-b border-rose-100">
                  <tr><th className="p-5">Reported By</th><th className="p-5">Accused (Against)</th><th className="p-5 w-1/3">Issue Description</th><th className="p-5 text-right">Admin Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportsList.length === 0 ? <tr><td colSpan="4" className="text-center p-8 font-bold text-slate-400">No complaints found.</td></tr> : null}
                  {reportsList.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="p-5 font-bold text-slate-900 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest block w-fit mb-1 ${r.reportedBy?.role === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{r.reportedBy?.role}</span>
                        {r.reportedBy?.name} <br/><span className="font-normal text-slate-500">{r.reportedBy?.phone}</span>
                      </td>
                      <td className="p-5 font-bold text-slate-900 text-xs">
                        {r.reportedStore ? <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Store: {r.reportedStore.storeName}</span> : <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">User: {r.reportedUser?.name}</span>}
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-rose-600 text-sm mb-1">{r.reason}</p>
                        <p className="text-xs text-slate-500">{r.description}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Order ID: {r.orderId?._id?.slice(-6) || 'N/A'}</p>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => setOpenReport(r)} className="text-slate-600 hover:text-slate-800 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"><MessageSquare size={12}/> View Chat</button>
                          {r.status === 'Pending' ? (
                            <>
                              <button onClick={() => handleBlockToggle(r.reportedStore ? r.reportedStore.vendorId : r.reportedUser?._id)} className="bg-rose-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm hover:bg-rose-700 transition-colors">Suspend Accused</button>
                              <button onClick={() => handleReportAction(r._id, 'Resolved')} className="text-emerald-600 text-xs font-bold hover:underline transition-colors">Mark Resolved</button>
                            </>
                          ) : (
                            <span className="text-emerald-500 font-black text-xs uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-200">RESOLVED</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

      </div>

      {/* 🚀 COMPLAINT CHAT MODAL (Admin can view & reply to any thread) */}
      {openReport && (
        <ComplaintChat
          reportId={openReport._id}
          otherPartyLabel={openReport.reportedBy?.name}
          onClose={() => { setOpenReport(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;