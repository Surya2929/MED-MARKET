import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { Package, Clock, CheckCircle2, StoreIcon, MapPin, Pill, AlertCircle, ShoppingBag, Truck, XCircle, RotateCcw, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ComplaintChat from '../components/ComplaintChat';

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaintOrder, setComplaintOrder] = useState(null); // 🚀 order currently open in the complaint chat modal

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/myorders');
      setOrders(data);
    } catch (error) { console.error("Failed to fetch orders"); } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  // 🚀 CANCEL OR RETURN ORDER
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const reason = window.prompt(`${t('enterCancelReason')} ${newStatus}:`);
    if (!reason) return;

    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus, cancelReason: reason });
      alert(`${t('orderMarkedAs')} ${newStatus}`);
      fetchOrders(); // Refresh
    } catch (err) {
      alert(t('failedToUpdateOrder'));
    }
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center text-slate-500 font-bold">{t('loadingProfile')}</div>;

  const getStatusUI = (status) => {
    switch(status) {
      case 'Pending': return { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Clock className="w-4 h-4"/>, text: t('statusPending') };
      case 'Accepted': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <StoreIcon className="w-4 h-4"/>, text: t('statusAccepted') };
      case 'Packed': return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Package className="w-4 h-4"/>, text: t('statusPacked') };
      case 'Out for Delivery': return { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <Truck className="w-4 h-4 animate-pulse"/>, text: t('statusOutForDelivery') };
      case 'Delivered': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4"/>, text: t('statusDelivered') };
      case 'Cancelled': return { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <XCircle className="w-4 h-4"/>, text: t('statusCancelled') };
      case 'Return Requested': return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <RotateCcw className="w-4 h-4"/>, text: t('statusReturnRequested') };
      default: return { color: 'bg-slate-100 text-slate-700', icon: <AlertCircle className="w-4 h-4"/>, text: status };
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      <div className="bg-slate-900 py-10"><div className="max-w-4xl mx-auto px-4"><h1 className="text-3xl font-black text-white flex items-center gap-3"><Package className="w-8 h-8 text-blue-400" /> {t('myOrdersTitle')}</h1></div></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] shadow-sm text-center"><ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h2 className="text-2xl font-black text-slate-800 mb-2">{t('noOrders')}</h2><Link to="/search" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold inline-block">{t('orderNow')}</Link></div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusUI = getStatusUI(order.status);
              return (
                <div key={order._id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                    <div><p className="font-bold text-slate-800 text-sm">{t('placedOn')}: {new Date(order.createdAt).toLocaleDateString()}</p></div>
                    <div className="flex flex-col items-end gap-2"><span className="font-black text-xl text-slate-900">₹{order.totalAmount}</span><div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${statusUI.color}`}>{statusUI.icon} {statusUI.text}</div></div>
                  </div>

                  <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase mb-2">{t('pharmacyInfo')}</h4>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-2"><StoreIcon className="w-4 h-4 text-blue-600" /> {order.storeId?.storeName}</p>
                    </div>
                    {/* 🚀 CANCEL / RETURN / REPORT BUTTONS */}
                    <div className="flex gap-2">
                      {(order.status === 'Pending' || order.status === 'Accepted') && (
                        <button onClick={() => handleOrderStatusUpdate(order._id, 'Cancelled')} className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-100 transition">{t('cancelOrder')}</button>
                      )}
                      {order.status === 'Delivered' && (
                        <button onClick={() => handleOrderStatusUpdate(order._id, 'Return Requested')} className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-md border border-purple-100 transition">{t('returnItem')}</button>
                      )}
                      <button onClick={() => setComplaintOrder(order)} className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 transition flex items-center gap-1"><MessageSquare size={12}/> {t('reportIssue')}</button>
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-50 border rounded-lg flex items-center justify-center shrink-0"><Pill className="w-5 h-5 text-slate-400" /></div><div><p className="font-bold text-slate-800 text-sm">{item.medicineId?.name}</p><p className="text-[10px] font-bold text-slate-500">{t('qty')}: {item.quantity}</p></div></div><p className="font-bold text-slate-800 text-sm">₹{item.price * item.quantity}</p></div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🚀 COMPLAINT CHAT MODAL */}
      {complaintOrder && (
        <ComplaintChat
          orderId={complaintOrder._id}
          otherPartyLabel={complaintOrder.storeId?.storeName}
          onClose={() => setComplaintOrder(null)}
        />
      )}
    </div>
  );
};

export default MyOrders;