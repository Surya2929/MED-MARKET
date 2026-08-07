import { useState, useEffect } from 'react';
import API from '../services/api';
import { MapPin, Home, Briefcase, MoreHorizontal, Plus, Edit3, Trash2, CheckCircle2, X } from 'lucide-react';

const LABEL_ICONS = { Home: Home, Work: Briefcase, Other: MoreHorizontal };
const EMPTY_FORM = { label: 'Home', fullName: '', phone: '', addressLine: '', city: '', state: '', pincode: '' };

const AddressSelector = ({ selectedId, onSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const { data } = await API.get('/addresses');
      setAddresses(data);
      if (!selectedId && data.length > 0) {
        const def = data.find(a => a.isDefault) || data[0];
        onSelect(def);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEditForm = (addr) => {
    setForm({ label: addr.label, fullName: addr.fullName, phone: addr.phone, addressLine: addr.addressLine, city: addr.city, state: addr.state, pincode: addr.pincode });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.addressLine.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      return alert('Please fill in all fields.');
    }
    if (!/^\d{10}$/.test(form.phone)) return alert('Phone number must be exactly 10 digits.');
    if (!/^\d{6}$/.test(form.pincode)) return alert('PIN code must be exactly 6 digits.');

    setSaving(true);
    try {
      let saved;
      if (editingId) {
        const { data } = await API.put(`/addresses/${editingId}`, form);
        saved = data;
      } else {
        const { data } = await API.post('/addresses', form);
        saved = data;
      }
      setShowForm(false);
      await fetchAddresses();
      onSelect(saved);
    } catch (e) { alert(e.response?.data?.message || 'Failed to save address.'); } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this address?')) return;
    try {
      await API.delete(`/addresses/${id}`);
      if (selectedId === id) onSelect(null);
      fetchAddresses();
    } catch (e) { alert('Failed to delete address.'); }
  };

  if (loading) return <div className="text-sm text-slate-400 p-4">Loading addresses...</div>;

  return (
    <div className="space-y-3">
      {addresses.map(addr => {
        const Icon = LABEL_ICONS[addr.label] || Home;
        const isSelected = selectedId === addr._id;
        return (
          <div
            key={addr._id}
            onClick={() => onSelect(addr)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/40' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                {isSelected && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded"><Icon size={10}/> {addr.label}</span>
                  {addr.isDefault && <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">Default</span>}
                </div>
                <p className="font-bold text-sm text-slate-800">{addr.fullName} <span className="font-normal text-slate-400">· {addr.phone}</span></p>
                <p className="text-xs text-slate-500 mt-0.5">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); openEditForm(addr); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit3 size={14}/></button>
                <button onClick={(e) => handleDelete(addr._id, e)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        );
      })}

      {!showForm ? (
        <button onClick={openAddForm} className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-colors flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
          <Plus size={16}/> Add New Address
        </button>
      ) : (
        <div className="p-4 rounded-xl border-2 border-blue-300 bg-blue-50/30 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">{editingId ? 'Edit Address' : 'Add New Address'}</h4>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>

          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map(l => (
              <button key={l} onClick={() => setForm({...form, label: l})} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${form.label === l ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}>{l}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Full Name" className="col-span-2 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} placeholder="10-digit phone number" className="col-span-2 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
            <textarea value={form.addressLine} onChange={e => setForm({...form, addressLine: e.target.value})} placeholder="House no, building, street, area" rows="2" className="col-span-2 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" />
            <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
            <input type="text" value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="State" className="p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
            <input type="text" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g,'').slice(0,6)})} placeholder="6-digit PIN code" className="col-span-2 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:bg-slate-300">
            {saving ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;