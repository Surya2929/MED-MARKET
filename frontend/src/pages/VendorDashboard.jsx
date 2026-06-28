import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Store, PlusCircle, PackageOpen, AlertTriangle, Package, Edit3 } from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [myInventory, setMyInventory] = useState([]);
  
  // States for standard selection
  const [formData, setFormData] = useState({ medicineId: '', price: '', stock: '' });
  
  // States for custom new medicine
  const [isCustomMedicine, setIsCustomMedicine] = useState(false);
  const [customMed, setCustomMed] = useState({ name: '', composition: '', uses: '', price: '', stock: '' });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // 🚀 FETCH DATA
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const masterRes = await API.get('/medicines/master');
        setMasterMedicines(masterRes.data);

        const inventoryRes = await API.get('/medicines/vendor-inventory');
        setMyInventory(inventoryRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setPageLoading(false);
      }
    };
    if (user?.role === 'vendor') fetchDashboardData();
  }, [user]);

  // 🚀 ADD OR UPDATE INVENTORY LOGIC
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isCustomMedicine) {
        // 1. Pehle Master Dictionary me nayi dawai banao
        const newMedRes = await API.post('/medicines/master', {
          name: customMed.name,
          composition: customMed.composition,
          uses: customMed.uses,
          sideEffects: "Consult physician",
          dosage: "As directed by physician"
        });

        // 2. Fir us dawai ki ID se inventory add karo
        await API.post('/vendor/inventory', {
          medicineId: newMedRes.data._id,
          price: customMed.price,
          stock: customMed.stock
        });

        setIsCustomMedicine(false);
        setCustomMed({ name: '', composition: '', uses: '', price: '', stock: '' });

        // Update dropdown list too
        const masterRes = await API.get('/medicines/master');
        setMasterMedicines(masterRes.data);

      } else {
        // Normal dropdown update
        await API.post('/vendor/inventory', formData);
        setFormData({ medicineId: '', price: '', stock: '' });
      }

      alert('Inventory Updated Successfully! 🎉');
      
      // Refresh list
      const inventoryRes = await API.get('/medicines/vendor-inventory');
      setMyInventory(inventoryRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update inventory. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setIsCustomMedicine(false);
    setFormData({ medicineId: item.medicineId._id, price: item.price, stock: item.stock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (user?.role !== 'vendor') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-lg border border-slate-200">
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800">Access Denied</h2>
          <p className="text-slate-500 font-medium mt-2">This portal is restricted to Verified Pharmacies only.</p>
        </div>
      </div>
    );
  }

  if (pageLoading) return <div className="text-center py-20 font-bold text-slate-500">Loading Portal...</div>;

  const totalProducts = myInventory.length;
  const outOfStock = myInventory.filter(item => item.stock === 0).length;

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      
      <div className="bg-slate-900 pt-10 pb-20">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-xl shadow-lg shadow-orange-500/30">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Vendor Portal</h1>
            <p className="text-slate-400 font-medium text-sm mt-1">Manage your pharmacy inventory & pricing</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 w-fit"><PackageOpen className="w-5 h-5" /></div>
                <div><h3 className="text-2xl font-black text-slate-800">{totalProducts}</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Meds</p></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
                {outOfStock > 0 && <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500 animate-pulse"></div>}
                <div className="bg-rose-50 p-2 rounded-lg text-rose-600 w-fit"><AlertTriangle className="w-5 h-5" /></div>
                <div><h3 className="text-2xl font-black text-slate-800">{outOfStock}</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Out of Stock</p></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
              <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2"><PlusCircle className="w-5 h-5 text-orange-500" /> Add Stock</span>
                <button 
                  onClick={() => setIsCustomMedicine(!isCustomMedicine)} 
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold transition-colors"
                >
                  {isCustomMedicine ? 'Use Dictionary' : 'Add Custom Med'}
                </button>
              </h2>
              
              <form onSubmit={handleAdd} className="space-y-4 animate-fade-in">
                
                {/* 🚀 CONDITIONAL RENDER: Dictionary vs Custom Input */}
                {!isCustomMedicine ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Medicine</label>
                    <select required value={formData.medicineId} onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm font-bold text-slate-800">
                      <option value="" className="text-slate-400">-- Choose from Dictionary --</option>
                      {masterMedicines.map(med => <option key={med._id} value={med._id}>{med.name} ({med.composition})</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest text-center mb-2">Create New Medicine</p>
                    <input type="text" required value={customMed.name} onChange={(e) => setCustomMed({ ...customMed, name: e.target.value })} placeholder="Brand Name (e.g., Combiflam)" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-orange-500 text-sm font-semibold" />
                    <input type="text" required value={customMed.composition} onChange={(e) => setCustomMed({ ...customMed, composition: e.target.value })} placeholder="Salt / Composition" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-orange-500 text-sm font-semibold" />
                    <input type="text" required value={customMed.uses} onChange={(e) => setCustomMed({ ...customMed, uses: e.target.value })} placeholder="Uses (e.g., Fever, Pain)" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-orange-500 text-sm font-semibold" />
                  </div>
                )}
                
                <div className="flex gap-4 pt-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price (₹)</label>
                    <input type="number" required min="1" value={isCustomMedicine ? customMed.price : formData.price} onChange={(e) => isCustomMedicine ? setCustomMed({ ...customMed, price: e.target.value }) : setFormData({ ...formData, price: e.target.value })} placeholder="45" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm font-bold text-slate-800" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Quantity</label>
                    <input type="number" required min="0" value={isCustomMedicine ? customMed.stock : formData.stock} onChange={(e) => isCustomMedicine ? setCustomMed({ ...customMed, stock: e.target.value }) : setFormData({ ...formData, stock: e.target.value })} placeholder="100" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm font-bold text-slate-800" />
                  </div>
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl hover:bg-slate-800 font-black text-sm transition-all shadow-md mt-4 flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                  {loading ? 'Processing...' : 'Save to Inventory'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full min-h-[500px] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> My Store Inventory</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {myInventory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                    <PackageOpen className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-bold">Your inventory is empty.</p>
                    <p className="text-sm">Add medicines using the form.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-white sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-bold text-xs uppercase tracking-widest text-slate-400">Medicine Name</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-widest text-slate-400 text-center">Price</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-widest text-slate-400 text-center">Stock</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-widest text-slate-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myInventory.map(item => (
                        <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-900 text-base">{item.medicineId?.name || 'Unknown Medicine'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.medicineId?.composition || 'No Salt Info'}</p>
                          </td>
                          <td className="p-4 text-center font-black text-slate-800 text-lg">₹{item.price}</td>
                          <td className="p-4 text-center">
                            {item.stock > 0 ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-bold text-xs">{item.stock} Units</span> : <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-md font-bold text-xs animate-pulse">Out of Stock</span>}
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleEditClick(item)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs">
                              <Edit3 className="w-4 h-4"/> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;