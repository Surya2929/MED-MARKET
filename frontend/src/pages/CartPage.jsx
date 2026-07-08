import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { ChevronLeft, Trash2, ShoppingBag, ArrowRight, Home, UploadCloud, X, Receipt } from 'lucide-react';

const CartPage = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const itemTotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const deliveryFee = itemTotal > 500 ? 0 : 40;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => { setPrescription(reader.result); setPreviewUrl(URL.createObjectURL(file)); };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    if (!address) return alert("Delivery Address is required.");
    setLoading(true);
    try {
      await API.post('/orders', { 
        storeId: cart[0].storeId, 
        items: cart, 
        totalAmount: itemTotal + deliveryFee, 
        deliveryAddress: address, 
        prescriptionImage: prescription 
      });
      alert("Order Placed Successfully!");
      clearCart();
      navigate('/myorders');
    } catch (e) { alert("Failed to place order."); } finally { setLoading(false); }
  };

  if (!cart.length) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center">
      <ShoppingBag size={64} className="text-slate-300 mb-4"/>
      <h2 className="text-xl font-bold text-slate-700">Your cart is empty</h2>
      <button onClick={() => navigate(-1)} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Go Back</button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      
      {/* 🚀 PROPER BACK NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold transition-colors">
          <ChevronLeft size={20}/> Continue Shopping
        </button>
        <span className="text-sm font-bold text-slate-800">Your Cart ({cart.length})</span>
        <div className="w-20"></div> {/* Spacer for center alignment */}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: CART ITEMS & FORM */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.inventoryId} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden">
                     {item.imageUrl ? <img src={item.imageUrl} className="object-contain p-1" /> : <ShoppingBag className="text-slate-300" size={20}/>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.medicineName}</h4>
                    <p className="text-xs text-slate-500">Sold by: {item.storeName}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-6">
                  {/* 🚀 MANUAL QUANTITY CONTROL */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.inventoryId, item.quantity - 1, item.stock)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition font-bold">-</button>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.inventoryId, parseInt(e.target.value) || 0, item.stock)}
                      className="w-12 text-center font-bold text-slate-800 outline-none border-none mx-2"
                    />
                    <button onClick={() => updateQuantity(item.inventoryId, item.quantity + 1, item.stock)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition font-bold">+</button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 w-16">₹{item.price * item.quantity}</p>
                    <p className="text-[10px] text-slate-400">Max: {item.stock}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.inventoryId)} className="text-rose-500 hover:text-rose-600 p-2"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><UploadCloud size={18} className="text-blue-500"/> Prescription (Optional)</h3>
              {!previewUrl ? (
                <label className="border-2 border-dashed border-slate-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
                  <span className="text-xs font-semibold text-slate-500">Click to upload photo</span>
                  <input type="file" onChange={handleImage} className="hidden" />
                </label>
              ) : (
                <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={previewUrl} className="w-full h-full object-cover" />
                  <button onClick={() => {setPreviewUrl(null); setPrescription(null);}} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded"><X size={12}/></button>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Home size={18} className="text-blue-500"/> Delivery Address</h3>
              <textarea value={address} onChange={e=>setAddress(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm" rows="3" placeholder="Enter complete address..." />
            </div>
          </div>
        </div>

        {/* RIGHT: BILL SUMMARY */}
        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg sticky top-20">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2"><Receipt size={20}/> Bill Details</h3>
            <div className="space-y-3 text-sm font-medium text-slate-600 mb-6">
              <div className="flex justify-between"><span>Item Total</span><span>₹{itemTotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span className="text-emerald-600 font-bold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-black text-slate-900"><span>To Pay</span><span>₹{itemTotal + deliveryFee}</span></div>
            </div>
            <button onClick={handleCheckout} disabled={loading || !address} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold transition flex justify-center items-center gap-2 disabled:bg-slate-400">
              {loading ? 'Processing...' : 'Proceed to Checkout'} <ArrowRight size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;