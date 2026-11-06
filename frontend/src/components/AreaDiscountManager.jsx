import { useEffect, useState } from 'react';
import API from '../services/api';
import { BadgePercent, Plus, Trash2, MapPin } from 'lucide-react';

// 🚀 ADMIN: add / list / delete pincode-based area discounts
const AreaDiscountManager = () => {
  const [discounts, setDiscounts] = useState([]);
  const [pincode, setPincode] = useState('');
  const [areaName, setAreaName] = useState('');
  const [percent, setPercent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDiscounts = async () => {
    try {
      const { data } = await API.get('/area-discounts');
      setDiscounts(data);
    } catch (e) { alert(e.response?.data?.message || 'Failed to load discounts'); }
  };

  useEffect(() => {
    API.get('/area-discounts')
      .then(({ data }) => setDiscounts(data))
      .catch((e) => alert(e.response?.data?.message || 'Failed to load discounts'));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) return alert('Pincode must be exactly 6 digits.');
    if (!percent || percent < 1 || percent > 50) return alert('Discount percent must be between 1 and 50.');

    setSaving(true);
    try {
      await API.post('/area-discounts', { pincode, areaName, percent: Number(percent) });
      setPincode(''); setAreaName(''); setPercent('');
      fetchDiscounts();
    } catch (e) { alert(e.response?.data?.message || 'Failed to add discount'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      await API.delete(`/area-discounts/${id}`);
      fetchDiscounts();
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete discount'); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2"><BadgePercent className="w-5 h-5 text-brand-600" /> Area Discounts</h3>
      <p className="text-xs text-slate-500 mb-5">Orders delivered to these pincodes get this % off the item total.</p>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode (6 digits)" className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-brand-500" />
        <input value={areaName} onChange={e => setAreaName(e.target.value)} placeholder="Area name (optional)" className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-brand-500" />
        <input type="number" min="1" max="50" value={percent} onChange={e => setPercent(e.target.value)} placeholder="Percent (1-50)" className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-brand-500" />
        <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 py-2.5">
          <Plus className="w-4 h-4" /> {saving ? 'Adding...' : 'Add'}
        </button>
      </form>

      {discounts.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">No area discounts yet.</div>
      ) : (
        <div className="space-y-2">
          {discounts.map(d => (
            <div key={d._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="font-bold text-sm text-slate-800">{d.pincode} {d.areaName && <span className="font-medium text-slate-500">· {d.areaName}</span>}</p>
                  <p className="text-xs font-bold text-emerald-600">{d.percent}% off</p>
                </div>
              </div>
              <button onClick={() => handleDelete(d._id)} className="text-rose-500 hover:text-rose-700 p-2" title="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AreaDiscountManager;
