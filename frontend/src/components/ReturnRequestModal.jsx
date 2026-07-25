import { useState, useContext } from 'react';
import API from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { X, UploadCloud, RotateCcw } from 'lucide-react';

const REASON_KEYS = ['returnReasonWrongItem', 'returnReasonDamaged', 'returnReasonNotWorking', 'returnReasonChangedMind', 'returnReasonOther'];

// 🚀 Amazon-style return request: reason dropdown + description + up to 5 evidence photos
const ReturnRequestModal = ({ order, onClose, onSubmitted }) => {
  const { t } = useContext(LanguageContext);
  const [reason, setReason] = useState(REASON_KEYS[0]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]); // base64 array
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (!description.trim()) return alert(t('describeReturnIssue'));
    setLoading(true);
    try {
      const reasonText = `${t(reason)}: ${description.trim()}`;
      await API.put(`/orders/${order._id}/status`, {
        status: 'Return Requested',
        cancelReason: reasonText,
        returnPhotos: photos
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