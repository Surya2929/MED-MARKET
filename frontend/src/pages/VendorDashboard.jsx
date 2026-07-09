import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Store, Package, ShoppingBag, PlusSquare, UploadCloud, X, LayoutDashboard, Database, PieChart, CheckSquare, Trash2, Edit3, Droplets, User, Phone, MapPin, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory'); 
  
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [myInventory, setMyInventory] = useState([]);
  const [myOrders, setMyOrders] = useState([]); 
  const [storeStatus, setStoreStatus] = useState(null); 
  
  const [selectedMeds, setSelectedMeds] = useState({});
  const [isCustomMedicine, setIsCustomMedicine] = useState(false);
  
  // Custom Med State
  const [customMed, setCustomMed] = useState({ 
    name: '', composition: '', uses: '', price: '', stock: '', 
    manufacturer: '', manufactureDate: '', expiryDate: '', imageUrl: null 
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [medImages, setMedImages] = useState({}); // 🚀 NEW: base64 images for master-dictionary rows { [medicineId]: base64 }
  const [medImagePreviews, setMedImagePreviews] = useState({}); // 🚀 NEW: local preview URLs for the same
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const checkLiquidType = (name, composition, dosage) => {
    const combined = `${name} ${composition} ${dosage}`.toLowerCase();
    return combined.includes('drop') || combined.includes('syrup') || combined.includes('liquid');
  };

  const fetchDashboardData = async () => {
    try {
      const profileRes = await API.get('/users/profile');
      setStoreStatus(profileRes.data.store); 
      const masterRes = await API.get('/medicines/master');
      setMasterMedicines(masterRes.data);
      const inventoryRes = await API.get('/medicines/vendor-inventory');
      setMyInventory(inventoryRes.data);
      if (profileRes.data.store?.isVerified) {
        const ordersRes = await API.get('/orders/vendor');
        setMyOrders(ordersRes.data);
      }
      const initialSelection = {};
      inventoryRes.data.forEach(inv => {
        initialSelection[inv.medicineId._id] = { selected: true, price: inv.price, stock: inv.stock, inventoryId: inv._id };
      });
      setSelectedMeds(initialSelection);
    } catch (err) { console.error(err); } finally { setPageLoading(false); }
  };

  useEffect(() => {
    if (!user || user.role !== 'vendor') { navigate('/'); return; }
    fetchDashboardData();
  }, [user, navigate]);

  const applyDefaultPrice = (medId) => {
    const med = masterMedicines.find(m => m._id === medId);
    handleInputChange(medId, 'price', med.defaultPrice || 50);
  };

  const handleCheckboxChange = (medId) => {
    setSelectedMeds(prev => {
      const current = prev[medId] || { price: '', stock: '', selected: false }; 
      return { ...prev, [medId]: { ...current, selected: !current.selected } };
    });
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = { ...selectedMeds };
    masterMedicines.forEach(med => {
      if (!newSelection[med._id]) newSelection[med._id] = { price: '', stock: '' }; 
      newSelection[med._id].selected = isChecked;
    });
    setSelectedMeds(newSelection);
  };

  const handleInputChange = (medId, field, value) => {
    setSelectedMeds(prev => ({ ...prev, [medId]: { ...prev[medId], [field]: value, selected: true } }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Image too large (Max 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => { setCustomMed({ ...customMed, imageUrl: reader.result }); setPreviewUrl(URL.createObjectURL(file)); };
      reader.readAsDataURL(file);
    }
  };

  // 🚀 NEW: Image upload directly from the Master Dictionary table row
  const handleDictImageUpload = (medId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Image too large (Max 5MB)");
    const reader = new FileReader();
    reader.onloadend = () => {
      setMedImages(prev => ({ ...prev, [medId]: reader.result }));
      setMedImagePreviews(prev => ({ ...prev, [medId]: URL.createObjectURL(file) }));
    };
    reader.readAsDataURL(file);
  };

  const handleBulkSave = async () => {
    setLoading(true);
    try {
      if (isCustomMedicine) {
        if (!customMed.name || !customMed.price || !customMed.stock) {
          alert("Brand Name, Price, and Stock are required!"); setLoading(false); return;
        }
        const newMedRes = await API.post('/medicines/master', customMed);
        await API.post('/vendor/inventory', { medicineId: newMedRes.data._id, price: customMed.price, stock: customMed.stock });
        setIsCustomMedicine(false); setPreviewUrl(null);
        setCustomMed({ name: '', composition: '', uses: '', price: '', stock: '', manufacturer: '', manufactureDate: '', expiryDate: '', imageUrl: null });
      } else {
        const payloadPromises = Object.entries(selectedMeds).filter(([_, d]) => d.selected && d.price && d.stock).map(([id, d]) => API.post('/vendor/inventory', { medicineId: id, price: d.price, stock: d.stock }));
        // 🚀 NEW: push uploaded images to the master medicine record (matched by name)
        const imagePromises = Object.entries(medImages).map(([medId, imgData]) => {
          const med = masterMedicines.find(m => m._id === medId);
          if (!med) return null;
          return API.post('/medicines/master', { name: med.name, imageUrl: imgData });
        }).filter(Boolean);
        await Promise.all([...payloadPromises, ...imagePromises]);
        setMedImages({}); setMedImagePreviews({});
      }
      alert('Inventory Synced! 🎉');
      fetchDashboardData();
    } catch (error) { alert('Sync Failed: Check Data Size'); } finally { setLoading(false); }
  };

  const handleDeleteItem = async (mid) => {
    if(!window.confirm("Remove this medicine from store?")) return;
    try { await API.delete(`/medicines/vendor-inventory/${mid}`); fetchDashboardData(); } catch(e) { alert("Failed"); }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try { await API.put(`/orders/${id}/status`, { status }); fetchDashboardData(); } catch (e) { alert("Failed"); }
  };

  const handleEditClick = (item) => {
    setIsCustomMedicine(false);
    setSelectedMeds(prev => ({ ...prev, [item.medicineId._id]: { selected: true, price: item.price, stock: item.stock } }));
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const isAllSelected = masterMedicines.length > 0 && masterMedicines.every(med => selectedMeds[med._id]?.selected);
  const totalProducts = myInventory.length;
  const outOfStock = myInventory.filter(item => item.stock === 0).length;
  const pendingOrdersCount = myOrders.filter(o => o.status === 'Pending').length;
  const totalSales = myOrders.filter(o => o.status === 'Delivered').reduce((acc, curr) => acc + curr.totalAmount, 0);

  if (pageLoading) return <div className="h-screen flex items-center justify-center font-bold text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* 🚀 COMPACT ADMIN NAVBAR */}
      <nav className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Store size={18}/></div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider">Vendor Console</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] text-slate-300">{storeStatus?.storeName}</span>
               <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${storeStatus?.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                 {storeStatus?.isVerified ? 'Verified' : 'Pending'}
               </span>
            </div>
          </div>
        </div>
        <div className="text-right border-l border-slate-700 pl-4">
           <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Delivered Sales</p>
           <h3 className="text-lg font-black text-emerald-400">₹{totalSales.toLocaleString()}</h3>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* 🚀 COMPACT SIDEBAR STATS */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Live Catalog</p><h3 className="text-2xl font-black text-slate-800">{totalProducts}</h3></div>
              <Database className="text-blue-500 opacity-20" size={28}/>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-100 flex items-center justify-between">
              <div><p className="text-[10px] font-bold text-rose-500 uppercase">Out of Stock</p><h3 className="text-2xl font-black text-rose-600">{outOfStock}</h3></div>
              <AlertTriangle className="text-rose-500 opacity-20" size={28}/>
            </div>
            {!storeStatus?.isVerified && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
                <Clock className="text-amber-600 mt-0.5 shrink-0" size={16}/>
                <p className="text-xs font-medium text-amber-800 leading-tight">Your Drug License is under review. Selling is disabled until verified.</p>
              </div>
            )}
          </div>

          {/* 🚀 MAIN DASHBOARD AREA */}
          <div className="lg:col-span-3">
            
            {/* TABS */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
              <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Stock Manager</button>
              <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Orders {pendingOrdersCount > 0 && <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[10px]">{pendingOrdersCount}</span>}</button>
            </div>

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                
                {/* 🚀 DICTIONARY / CUSTOM MED SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2"><PlusSquare size={16} className="text-blue-600"/> Add Medicine to Store</h2>
                    <button onClick={() => setIsCustomMedicine(!isCustomMedicine)} className="text-blue-600 text-xs font-bold hover:underline">
                      {isCustomMedicine ? '← View Master Dictionary' : '+ Create New Medicine'}
                    </button>
                  </div>

                  <div className="p-5">
                      {isCustomMedicine ? (
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row gap-6">
                            
                            {/* Compact Image Upload */}
                            <div className="w-full md:w-1/4">
                              {!previewUrl ? (
                                <label className="border border-dashed border-slate-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                  <UploadCloud className="text-slate-400 mb-1" size={24}/>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Upload Image</span>
                                  <input type="file" onChange={handleImageUpload} className="hidden" />
                                </label>
                              ) : (
                                <div className="relative h-32 rounded-lg overflow-hidden border border-slate-200">
                                  <img src={previewUrl} className="w-full h-full object-contain p-2 bg-white" />
                                  <button type="button" onClick={() => setPreviewUrl(null)} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-md shadow-md"><X size={12}/></button>
                                </div>
                              )}
                            </div>

                            {/* Compact Form Grid */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Brand Name</label>
                                <input type="text" value={customMed.name} onChange={e=>setCustomMed({...customMed, name: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500" placeholder="e.g. Crocin 650" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Price (₹)</label>
                                <input type="number" value={customMed.price} onChange={e=>setCustomMed({...customMed, price: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500" placeholder="0" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Manufacturer</label>
                                <input type="text" value={customMed.manufacturer} onChange={e=>setCustomMed({...customMed, manufacturer: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500" placeholder="Company Name" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Composition</label>
                                <input type="text" value={customMed.composition} onChange={e=>setCustomMed({...customMed, composition: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500" placeholder="Salt details" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Initial Stock</label>
                                <input type="number" value={customMed.stock} onChange={e=>setCustomMed({...customMed, stock: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500" placeholder="0" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Mfg Date</label>
                                <input type="date" value={customMed.manufactureDate} onChange={e=>setCustomMed({...customMed, manufactureDate: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500 text-slate-600" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Exp Date</label>
                                <input type="date" value={customMed.expiryDate} onChange={e=>setCustomMed({...customMed, expiryDate: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500 text-slate-600" />
                              </div>
                              <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Usage / Indications</label>
                                <textarea value={customMed.uses} onChange={e=>setCustomMed({...customMed, uses: e.target.value})} className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-500 resize-none" rows="2" placeholder="What is this used for?" />
                              </div>
                            </div>
                          </div>
                          <button onClick={handleBulkSave} disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-bold text-sm transition-colors">
                            {loading ? 'Processing...' : 'Save & Add to Inventory'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                             <p className="text-xs text-slate-500">Select medicines from dictionary and set your price.</p>
                             <button onClick={handleBulkSave} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">Save Selected</button>
                          </div>
                          
                          {/* 🚀 COMPACT TABLE */}
                          <div className="max-h-[350px] overflow-y-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-sm">
                              <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200">
                                <tr>
                                  <th className="p-3 w-10 text-center"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="w-4 h-4 cursor-pointer" /></th>
                                  <th className="p-3 w-16 font-semibold text-slate-600">Image</th>
                                  <th className="p-3 font-semibold text-slate-600">Medicine Name</th>
                                  <th className="p-3 font-semibold text-slate-600 w-32">Price (₹)</th>
                                  <th className="p-3 font-semibold text-slate-600 w-24">Stock</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {masterMedicines.map(med => {
                                   const isSelected = selectedMeds[med._id]?.selected || false;
                                   return (
                                  <tr key={med._id} className={`${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                                    <td className="p-3 text-center"><input type="checkbox" checked={isSelected} onChange={()=>handleCheckboxChange(med._id)} className="w-4 h-4 cursor-pointer" /></td>
                                    <td className="p-3">
                                      {(medImagePreviews[med._id] || med.imageUrl) ? (
                                        <label className="relative block w-10 h-10 rounded-md border border-slate-200 overflow-hidden cursor-pointer group">
                                          <img src={medImagePreviews[med._id] || med.imageUrl} className="w-full h-full object-contain bg-white p-0.5" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><UploadCloud size={14} className="text-white"/></div>
                                          <input type="file" onChange={(e) => handleDictImageUpload(med._id, e)} className="hidden" />
                                        </label>
                                      ) : (
                                        <label className="w-10 h-10 rounded-md border border-dashed border-slate-300 flex items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors" title="Upload Image">
                                          <UploadCloud size={14} className="text-slate-400"/>
                                          <input type="file" onChange={(e) => handleDictImageUpload(med._id, e)} className="hidden" />
                                        </label>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <p className="font-bold text-slate-800">{med.name}</p>
                                      <p className="text-[10px] text-slate-500">{med.composition}</p>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-1">
                                        <input type="number" disabled={!isSelected} value={selectedMeds[med._id]?.price || ''} onChange={e=>handleInputChange(med._id, 'price', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded text-sm disabled:bg-slate-100 outline-none focus:border-blue-500" placeholder="00" />
                                        <button onClick={()=>applyDefaultPrice(med._id)} disabled={!isSelected} className="p-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50" title="Apply Default ₹50"><CheckSquare size={14}/></button>
                                      </div>
                                    </td>
                                    <td className="p-3"><input type="number" disabled={!isSelected} value={selectedMeds[med._id]?.stock || ''} onChange={e=>handleInputChange(med._id, 'stock', e.target.value)} className="w-full p-1.5 border border-slate-300 rounded text-sm disabled:bg-slate-100 outline-none focus:border-blue-500" placeholder="0" /></td>
                                  </tr>
                                )})}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* 🚀 LIVE INVENTORY TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50"><h2 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Database className="text-emerald-500" size={16}/> Live Inventory Feed</h2></div>
                  <div className="max-h-[400px] overflow-y-auto">
                     {myInventory.length === 0 ? <div className="py-10 text-center text-slate-400 text-sm font-medium">No medicines in your store.</div> : (
                        <table className="w-full text-left text-sm">
                          <thead className="bg-white sticky top-0 border-b border-slate-200 z-10 text-[11px] uppercase text-slate-500">
                             <tr><th className="p-4">Product</th><th className="p-4 text-center">Price</th><th className="p-4 text-center">Stock</th><th className="p-4 text-right">Actions</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                           {myInventory.map(item => {
                             const isLiquid = checkLiquidType(item.medicineId?.name, item.medicineId?.composition, item.medicineId?.dosage);
                             return (
                              <tr key={item._id} className="hover:bg-slate-50">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    {item.medicineId?.imageUrl ? <img src={item.medicineId.imageUrl} className="w-10 h-10 object-contain border border-slate-200 rounded p-1" /> : <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><Package className="text-slate-400" size={16}/></div>}
                                    <div>
                                      <p className="font-bold text-slate-800">{item.medicineId?.name}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-slate-500">{item.medicineId?.manufacturer || 'Unknown'}</p>
                                        {isLiquid && <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1 border border-blue-100"><Droplets size={10}/> Liquid</span>}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-center font-bold text-slate-900">₹{item.price}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{item.stock}</span>
                                </td>
                                <td className="p-4 text-right">
                                   <button onClick={()=>handleEditClick(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-1 transition-colors"><Edit3 size={16}/></button>
                                   <button onClick={()=>handleDeleteItem(item.medicineId?._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded transition-colors"><Trash2 size={16}/></button>
                                </td>
                              </tr>
                             )
                           })}
                          </tbody>
                        </table>
                     )}
                  </div>
                </div>
              </div>
            )}

            {/* 🚀 ORDERS TAB (Standard Clean View) */}
            {activeTab === 'orders' && (
               <div className="space-y-4">
                  {myOrders.length === 0 ? <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 font-medium">No active orders found.</div> : (
                     myOrders.map(order => (
                        <div key={order._id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                           <div className="flex-1">
                             <div className="flex items-center gap-3 mb-4">
                               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">ID: #{order._id.slice(-6)}</span>
                               <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{order.status}</span>
                             </div>
                             <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><User size={16} className="text-slate-400"/> {order.customerId?.name}</h4>
                             <p className="text-xs text-slate-500 mt-1 flex items-center gap-3"><span className="flex items-center gap-1"><Phone size={12}/> {order.customerId?.phone}</span> <span className="flex items-center gap-1"><MapPin size={12}/> {order.deliveryAddress}</span></p>
                             
                             <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
                                {order.items.map((item, idx) => (
                                   <div key={idx} className="flex justify-between text-sm">
                                     <span className="text-slate-700 font-medium"><span className="font-bold text-slate-900 mr-2">{item.quantity}x</span>{item.medicineId?.name}</span>
                                     <span className="font-bold text-slate-800">₹{item.price * item.quantity}</span>
                                   </div>
                                ))}
                             </div>
                           </div>

                           <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                              <div className="text-right">
                                 <p className="text-xs text-slate-500 uppercase font-bold">Total Bill</p>
                                 <h3 className="text-3xl font-black text-slate-900 mt-1">₹{order.totalAmount}</h3>
                              </div>
                              <div className="mt-6 space-y-2">
                                 {order.status === 'Pending' && <button onClick={() => handleUpdateOrderStatus(order._id, 'Accepted')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">Approve Order</button>}
                                 {order.status === 'Accepted' && <button onClick={() => handleUpdateOrderStatus(order._id, 'Packed')} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">Mark Packed</button>}
                                 {order.status === 'Packed' && <button onClick={() => handleUpdateOrderStatus(order._id, 'Out for Delivery')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">Ship Order</button>}
                                 {order.status === 'Out for Delivery' && <button onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"><CheckCircle2 size={16}/> Delivered</button>}
                                 {order.status === 'Delivered' && <div className="w-full bg-slate-50 text-slate-500 py-2.5 rounded-lg text-sm font-bold text-center border border-slate-200">Completed ✅</div>}
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;