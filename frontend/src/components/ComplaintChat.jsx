import { useState, useEffect, useContext, useRef } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { X, Send, AlertCircle, MessageSquare } from 'lucide-react';

const REASONS = ['Wrong / Damaged Item', 'Product Quality Issue', 'Payment / Refund Issue', 'Rude Behavior', 'Delivery Delay', 'Other'];

const ComplaintChat = ({ orderId, reportId, otherPartyLabel, onClose }) => {
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      if (reportId) {
        const { data } = await API.get(`/reports/${reportId}`);
        setReport(data);
      } else if (orderId) {
        const { data } = await API.get(`/reports/by-order/${orderId}`);
        setReport(data);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [orderId, reportId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [report?.messages?.length]);

  const handleCreate = async () => {
    if (!description.trim()) return alert('Please describe the issue.');
    setSending(true);
    try {
      const { data } = await API.post('/reports', { orderId, reason, description });
      setReport(data);
    } catch (e) { alert(e.response?.data?.message || 'Failed to file complaint.'); } finally { setSending(false); }
  };

  const handleSend = async () => {
    if (!msgText.trim() || !report) return;
    setSending(true);
    try {
      const { data } = await API.post(`/reports/${report._id}/message`, { text: msgText });
      setReport(data);
      setMsgText('');
    } catch (e) { alert('Failed to send message.'); } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={18}/>
            <div>
              <h3 className="font-bold text-sm">Complaint {otherPartyLabel ? `— ${otherPartyLabel}` : ''}</h3>
              {report && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-1 inline-block ${report.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' : report.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>{report.status}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={18}/></button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
        ) : !report ? (
          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5"/>
              <p className="text-xs text-amber-800">Filing a complaint starts a chat thread that Admin and the other party can see and reply to.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Reason</label>
              <select value={reason} onChange={e=>setReason(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500">
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Describe the issue</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows="5" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" placeholder="What went wrong?" />
            </div>
            <button onClick={handleCreate} disabled={sending} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:bg-slate-300">
              {sending ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {report.messages.map((m, i) => {
                const senderId = m.sender?._id || m.sender;
                const isMine = senderId === user._id;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-sm ${isMine ? 'bg-blue-600 text-white rounded-tr-none' : m.senderRole === 'admin' ? 'bg-slate-800 text-white rounded-tl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                      <p className="text-[10px] font-bold uppercase opacity-70 mb-0.5">{m.senderName} · {m.senderRole}</p>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-slate-200 flex gap-2 shrink-0">
              <input value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 px-3.5 py-2.5 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleSend} disabled={sending} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg disabled:bg-slate-300"><Send size={18}/></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintChat;