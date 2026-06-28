import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Receipt, ShoppingCart, CheckCircle2, Truck } from 'lucide-react';

const CartPage = () => {
  const { cart = [], removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const itemTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = itemTotal > 0 ? (itemTotal > 500 ? 0 : 40) : 0; 
  const grandTotal = itemTotal + deliveryFee;

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    
    // 🚀 FIX: Ensuring correct data matches what backend wants
    const storeId = cart.length > 0 ? cart[0].storeId : null; 
    const formattedItems = cart.map(item => ({ 
      medicineId: item.medicineId, 
      quantity: item.quantity, 
      price: item.price,
      storeId: item.storeId 
    }));

    setLoading(true);
    try {
      await API.post('/orders', { storeId, items: formattedItems, totalAmount: grandTotal });
      
      setShowSuccess(true);
      clearCart();
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/myorders'); // 🚀 FIX: Order place hone par seedha "My Orders" pe le jaao
      }, 3500);

    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order. Please check backend console.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-[85vh] bg-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-emerald-100 text-center max-w-lg w-full animate-bounce-short">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-black text-emerald-800 mb-3 tracking-tight">Order Placed!</h2>
          <p className="text-slate-600 mb-8 font-medium text-lg">Thank you for your purchase. Your genuine medicines are on their way safely.</p>
          
          <div className="flex items-center justify-center gap-3 text-slate-500 font-bold bg-slate-50 py-3 rounded-xl">
            <Truck className="w-5 h-5 text-blue-500 animate-pulse" /> Redirecting to My Orders...
          </div>
          
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6">
            <div className="bg-emerald-500 h-full animate-progress-bar w-full" style={{ transition: 'width 3.5s linear', width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200 text-center max-w-md w-full">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-8 font-medium">Looks like you haven't added any medicines to your cart yet.</p>
          <Link to="/search" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md inline-block w-full">
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans relative">
      <div className="bg-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-400" /> Secure Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="w-full lg:w-7/12 space-y-4">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Items in Cart ({cart.length})</h3>
            {cart.map((item) => (
              <div key={item.inventoryId} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 transition hover:shadow-md">
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.medicineName}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                    Sold by: <span className="text-slate-700">{item.storeName}</span>
                  </p>
                  <p className="text-sm font-bold text-blue-600 mt-2 bg-blue-50 w-fit px-2 py-1 rounded mx-auto sm:mx-0 border border-blue-100">
                    ₹{item.price} <span className="text-slate-400 font-medium">x {item.quantity}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                  <span className="text-xl font-black text-slate-800">₹{item.price * item.quantity}</span>
                  <button onClick={() => removeFromCart(item.inventoryId)} className="text-rose-500 hover:text-rose-700 p-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-5/12">
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6 sm:p-8 sticky top-24">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Receipt className="w-6 h-6 text-slate-400" /> Bill Summary
              </h3>
              
              <div className="space-y-4 text-sm font-medium text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-slate-800 font-bold">₹{itemTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">FREE</span>
                  ) : (
                    <span className="text-slate-800 font-bold">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-4 mt-2">
                  <span className="text-base text-slate-800 font-bold">To Pay</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">₹{grandTotal}</span>
                </div>
              </div>

              {deliveryFee > 0 && (
                <div className="bg-blue-50 text-blue-800 text-xs font-bold p-3 rounded-xl text-center mb-6 border border-blue-200 flex items-center gap-2 justify-center">
                  <ShoppingCart className="w-4 h-4"/> Add items worth ₹{500 - itemTotal} more to get FREE Delivery!
                </div>
              )}

              <button onClick={handleCheckout} disabled={loading} className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl font-black text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30 flex justify-center items-center gap-2 transform hover:-translate-y-0.5">
                {loading ? 'Processing Bank...' : 'Proceed to Pay'} <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-3 rounded-xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Safe & Secure Payments
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;