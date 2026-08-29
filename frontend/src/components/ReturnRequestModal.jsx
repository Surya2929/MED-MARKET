import { useState, useContext } from 'react';
import API from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { X, UploadCloud, RotateCcw, Minus, Plus, Wallet, Package } from 'lucide-react';

const REASON_KEYS = ['returnReasonWrongItem', 'returnReasonDamaged', 'returnReasonNotWorking', 'returnReasonChangedMind', 'returnReasonOther'];

const ReturnRequestModal = ({ order, onClose, onSubmitted }) => {
  const { t } = useContext(LanguageContext);
  const [reason, setReason] = useState(REASON_KEYS[0]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({});
  const [requestType, setRequestType] = useState('Refund');

  const toggleItem = (medicineId, orderedQty) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[medicineId] !== undefined) delete next[medicineId];
      else next[medicineId] = orderedQty;
      return next;
    });
  };

  const setQty = (medicineId, qty, orderedQty) => {
    const clamped = Math.max(1, Math.min(qty, orderedQty));
    setSelected(prev => ({ ...prev, [medicineId]: clamped }));
  };

  const estimatedRefund = order.items.reduce((sum, item) => {
    const medId = item.medicineId?._id || item.medicineId;
    const qty = selected[medId];
    if (qty === undefined) return sum;
    return sum + (item.price * qty);
  }, 0);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - photos.length);
    files.forEach(file => {
      if (file.size > 3 * 1024 * 1024) return alert("Each photo must be under 3MB");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
        setPreviews(prev => [...prev, URL.createObjectURL(file)]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    const returnItems = Object.entries(selected).map(([medicineId, quantity]) => ({ medicineId, quantity }));
    if (returnItems.length === 0) return alert('Please select at least one item to return.');
    if (!description.trim()) return alert(t('describeReturnIssue'));

    setLoading(true);
    try {
      const reasonText = `${t(reason)}: ${description.trim()}`;
      await API.put(`/orders/${order._id}/status`, {
        status: 'Return Requested',
        cancelReason: reasonText,
        returnPhotos: photos,
        returnItems,
        requestType
      });
      alert(t('returnRequestSubmitted'));
      onSubmitted();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || t('failedToUpdateOrder'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-sm flex items-center gap-2"><RotateCcw size={16}/> {t('returnRequestTitle')}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          <div>
            <label className="text-xs font-bold text-slate-600 mb-2 block">What would you like?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRequestType('Refund')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${requestType === 'Refund' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}
              >
                <Wallet size={16} className={requestType === 'Refund' ? 'text-emerald-600' : 'text-slate-400'} />
                <p className="text-xs font-bold text-slate-800 mt-1">Refund to Wallet</p>
                <p className="text-[10px] text-slate-500">Instant credit once approved</p>
              </button>
              <button
                onClick={() => setRequestType('Return')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${requestType === 'Return' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200'}`}
              >
                <Package size={16} className={requestType === 'Return' ? 'text-blue-600' : 'text-slate-400'} />
                <p className="text-xs font-bold text-slate-800 mt-1">Return Item Only</p>
                <p className="text-[10px] text-slate-500">No wallet credit</p>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-2 block">Select items to return</label>
            <div className="space-y-2">
              {order.items.map((item) => {
                const medId = item.medicineId?._id || item.medicineId;
                const isChecked = selected[medId] !== undefined;
                return (
                  <div key={medId} className={`p-3 rounded-lg border ${isChecked ? 'border-purple-400 bg-purple-50/40' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleItem(medId, item.quantity)} className="w-4 h-4 accent-purple-600" />
                      <span className="flex-1 text-sm font-bold text-slate-800">{item.medicineId?.name || 'Item'}</span>
                      <span className="text-[10px] text-slate-500">Ordered: {item.quantity} · ₹{item.price} each</span>
                    </label>
                    {isChecked && (
                      <div className="flex items-center gap-2 mt-2 ml-6">
                        <span className="text-[10px] font-bold text-slate-500">Return qty:</span>
                        <div className="flex items-center bg-white border border-slate-200 rounded-md h-7">
                          <button onClick={() => setQty(medId, selected[medId] - 1, item.quantity)} className="px-2 h-full text-slate-500 hover:bg-slate-50 border-r"><Minus size={12}/></button>
                          <input type="number" value={selected[medId]} onChange={e => setQty(medId, parseInt(e.target.value) || 1, item.quantity)} className="w-10 text-center text-xs font-bold outline-none" min="1" max={item.quantity} />
                          <button onClick={() => setQty(medId, selected[medId] + 1, item.quantity)} className="px-2 h-full text-slate-500 hover:bg-slate-50 border-l"><Plus size={12}/></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {requestType === 'Refund' && estimatedRefund > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-800">Estimated Wallet Credit</span>
              <span className="text-sm font-black text-emerald-700">₹{estimatedRefund}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">{t('returnReasonLabel')}</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500">
              {REASON_KEYS.map(k => <option key={k} value={k}>{t(k)}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">{t('describeReturnIssue')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows="4" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" placeholder={t('describeReturnIssue')} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">{t('uploadPhotosOptional')}</label>
            <div className="grid grid-cols-5 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                  <img src={src} className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(idx)} className="absolute top-0.5 right-0.5 bg-rose-500 text-white rounded-full p-0.5"><X size={10}/></button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                  <UploadCloud size={18} className="text-slate-400" />
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0">
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold text-sm disabled:bg-slate-300">
            {loading ? t('processing') : t('submitReturnRequest')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestModal;