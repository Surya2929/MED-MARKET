import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Package, Clock, CheckCircle2, StoreIcon, MapPin, Pill, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/myorders');
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center text-slate-500 font-bold">Loading your orders...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      <div className="bg-slate-900 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" /> My Orders
          </h1>
          <p className="text-slate-400 text-sm mt-2">View your past purchases and delivery status.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-slate-200 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">No orders found</h2>
            <p className="text-slate-500 mb-6 font-medium">Looks like you haven't placed any orders yet.</p>
            <Link to="/search" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
              Order Medicines Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                
                {/* Order Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID: {order._id.slice(-8)}</span>
                    <p className="font-bold text-slate-800 text-sm mt-1">Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-xl text-slate-900">₹{order.totalAmount}</span>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status === 'Delivered' ? <CheckCircle2 className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
                      {order.status}
                    </div>
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-4 sm:p-6 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-1">
                    <StoreIcon className="w-4 h-4 text-blue-600" /> {order.storeId?.storeName || 'MedMarket Express'}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400"/> {order.storeId?.address || 'Dispatched via Courier'}
                  </p>
                </div>

                {/* Items List */}
                <div className="p-4 sm:p-6 bg-white">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Items Ordered</h4>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                            <Pill className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.medicineId?.name || 'Medicine'}</p>
                            <p className="text-[10px] font-bold text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;