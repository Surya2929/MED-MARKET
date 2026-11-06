import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Info, ShoppingCart, AlertTriangle, Pill } from 'lucide-react';

// 🚀 Shows other medicines with the same salt (composition) that are in stock, cheapest first
const SubstituteList = ({ medicineId }) => {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!medicineId) return;
    API.get(`/medicines/${medicineId}/substitutes`)
      .then(res => setData(res.data))
      .catch(() => setData(null));
  }, [medicineId]);

  if (!data) return null;

  // In stock: only show the ones that are actually cheaper. Out of stock: show every substitute.
  const list = data.outOfStock ? data.substitutes : data.substitutes.filter(s => s.savings > 0);
  if (list.length === 0) return null;

  const handleAdd = (s) => {
    if (!user) { alert("Please login first."); navigate('/login'); return; }
    addToCart({
      inventoryId: `${s.inventoryId}-unit`,
      medicineId: s.medicineId,
      medicineName: s.name,
      storeId: s.storeId,
      storeName: s.storeName,
      price: s.price,
      stock: s.stock,
      imageUrl: s.imageUrl,
      prescriptionRequired: !!s.prescriptionRequired
    }, 1);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm mt-6 p-6 border ${data.outOfStock ? 'border-rose-300 border-2' : 'border-slate-200'}`}>
      <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${data.outOfStock ? 'text-rose-600' : 'text-slate-800'}`}>
        {data.outOfStock && <AlertTriangle className="w-5 h-5" />}
        {data.outOfStock ? 'Out of Stock! Buy these substitutes' : 'Cheaper substitutes (same salt)'}
      </h3>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-xs font-medium flex gap-2 mb-4">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        These medicines have the same active ingredients in the same dosage. Ask your doctor before changing a medicine.
      </div>

      <div className="space-y-3">
        {list.map(s => (
          <div key={s.inventoryId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                {s.imageUrl ? <img src={s.imageUrl} alt={s.name} className="w-full h-full object-contain p-1" /> : <Pill className="w-5 h-5 text-slate-300" />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-800 truncate">{s.name}</h4>
                <p className="text-xs text-slate-500 truncate">{s.manufacturer} | {s.storeName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
              <div className="text-right">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-lg font-black text-slate-900">₹{s.price}</span>
                  {s.savings > 0 && <span className="text-xs text-slate-400 line-through">₹{data.basePrice}</span>}
                </div>
                {s.savings > 0 && <span className="text-[11px] font-bold text-emerald-600">Save {s.savings}%</span>}
              </div>
              <button onClick={() => handleAdd(s)} className="bg-brand-600 hover:bg-brand-700 text-white px-3 h-8 rounded-md transition-all shadow-sm text-xs font-semibold flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubstituteList;
