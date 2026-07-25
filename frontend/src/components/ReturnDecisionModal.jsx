import { useState, useContext } from 'react';
import API from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { X, RotateCcw, CheckCircle2, XCircle, ImageOff } from 'lucide-react';

// 🚀 Vendor's Amazon-style return review: see customer's reason + photos, Approve or Reject (with reason)
const ReturnDecisionModal = ({ order, onClose, onDecided }) => {
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    if (!window.confirm(t('approveReturn') + '?')) return;
    setLoading(true);
    try {
      await API.put(`/orders/${order._id}/return-decision`, { decision: 'Approved' });
      alert(t('returnApprovedMsg'));
      onDecided();
      onClose();
    } catch (e) { alert(e.response?.data?.message || t('failedToUpdateOrder')); } finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert(t('rejectReturnPrompt'));
    setLoading(true);
    try {
      await API.put(`/orders/${order._id}/return-decision`, { decision: 'Rejected', vendorRejectionReason: rejectReason.trim() });
      alert(t('returnRejectedMsg'));
      onDecided();
      onClose();
    } catch (e) { alert(e.response?.data?.message || t('failedToUpdateOrder')); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-sm flex items-center gap-2"><RotateCcw size={16}/> {t('returnDetails')}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{t('customerReason')}</p>
            <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3">{order.cancelReason || '—'}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t('evidencePhotos')}</p>
            {order.returnPhotos && order.returnPhotos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {order.returnPhotos.map((src, idx) => (
                  <a key={idx} href={src} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-slate-200 block">
                    <img src={src} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-50 border border-slate-200 border-dashed rounded-lg p-3">
                <ImageOff size={14}/> {t('noPhotosUploaded')}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Order</p>
            <p className="text-sm text-slate-700">#{order._id.slice(-6)} · ₹{order.totalAmount}</p>
          </div>

          {showRejectForm && (
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">{t('rejectReturnPrompt')}</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows="3" className="w-full p-2.5 border border-rose-300 rounded-lg text-sm outline-none focus:border-rose-500 resize-none" />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0 flex gap-2">
          {!showRejectForm ? (
            <>
              <button onClick={() => setShowRejectForm(true)} disabled={loading} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5"><XCircle size={16}/> {t('rejectReturn')}</button>
              <button onClick={handleApprove} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 disabled:bg-slate-300"><CheckCircle2 size={16}/> {t('approveReturn')}</button>
            </>
          ) : (
            <>
              <button onClick={() => setShowRejectForm(false)} disabled={loading} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-lg font-bold text-sm">{t('cancel')}</button>
              <button onClick={handleReject} disabled={loading} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:bg-slate-300">{loading ? t('processing') : t('submit')}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnDecisionModal;