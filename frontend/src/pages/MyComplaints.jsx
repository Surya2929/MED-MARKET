import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { MessageSquare, AlertCircle, ShieldAlert, Store, User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import ComplaintChat from '../components/ComplaintChat';

const MyComplaints = () => {
  const { t } = useContext(LanguageContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openReport, setOpenReport] = useState(null);

  const fetchReports = async () => {
    try {
      const { data } = await API.get('/reports/mine');
      setReports(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const getStatusUI = (status) => {
    switch (status) {
      case 'Resolved': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12}/> };
      case 'Dismissed': return { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <XCircle size={12}/> };
      default: return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12}/> };
    }
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center text-slate-500 font-bold">Loading complaints...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      <div className="bg-slate-900 py-10"><div className="max-w-4xl mx-auto px-4"><h1 className="text-3xl font-black text-white flex items-center gap-3"><ShieldAlert className="w-8 h-8 text-rose-400" /> {t('myComplaintsTitle')}</h1></div></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {reports.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] shadow-sm text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">{t('noComplaints')}</h2>
            <p className="text-slate-500 text-sm">{t('noComplaintsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => {
              const statusUI = getStatusUI(r.status);
              return (
                <button key={r._id} onClick={() => setOpenReport(r)} className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{r.reason}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 border ${statusUI.color}`}>{statusUI.icon} {r.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{r.description}</p>
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                      {r.reportedStore ? <><Store size={11}/> {t('againstStore')}: {r.reportedStore.storeName}</> : <><User size={11}/> {t('against')}: {r.reportedUser?.name}</>}
                    </p>
                  </div>
                  <div className="shrink-0 text-blue-600 text-xs font-bold flex items-center gap-1"><MessageSquare size={14}/> {t('openChat')}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {openReport && (
        <ComplaintChat
          reportId={openReport._id}
          otherPartyLabel={openReport.reportedStore?.storeName || openReport.reportedUser?.name}
          onClose={() => { setOpenReport(null); fetchReports(); }}
        />
      )}
    </div>
  );
};

export default MyComplaints;