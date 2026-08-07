import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AddressSelector from '../components/AddressSelector';
import { ChevronLeft, Trash2, ShoppingBag, ArrowRight, MapPin, UploadCloud, X, Receipt, FileWarning, AlertCircle, Truck, CreditCard } from 'lucide-react';

const CartPage = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [step, setStep] = useState('cart');
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const itemTotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const deliveryFee = itemTotal > 500 ? 0 : 40;
  const totalAmount = itemTotal + deliveryFee;

  const needsPrescription = cart.some(i => i.prescriptionRequired);

  const buildAddressString = () => {
    if (!selectedAddress) return '';
    return `${selectedAddress.fullName}, ${selectedAddress.addressLine}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode} (Phone: ${selectedAddress.phone})`;
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => { setPrescription(reader.result); setPreviewUrl(URL.createObjectURL(file)); };
      reader.readAsDataURL(file);
    }
  };

  const validateBeforeCheckout = () => {
    if (!selectedAddress) { alert('Please select or add a delivery address.'); return false; }
    if (needsPrescription && !prescription) { alert(t('prescriptionValidationAlert')); return false; }
    return true;
  };

  const handleCodCheckout = async () => {
    setLoading(true);
    try {
      await API.post('/orders', {
        storeId: cart[0].storeId,
        items: cart,
        deliveryAddress: buildAddressString(),
        prescriptionImage: prescription
      });
      alert(t('orderPlacedSuccess'));
      clearCart();
      navigate('/myorders');
    } catch (e) { alert(e.response?.data?.message || t('orderPlaceFail')); } finally { setLoading(false); }
  };

  const handleOnlineCheckout = async () => {
    if (!window.Razorpay) return alert(t('paymentNotConfigured'));
    setLoading(true);
    try {
      const { data } = await API.post('/payments/create-order', {
        storeId: cart[0].storeId,
        items: cart,
        deliveryAddress: buildAddressString(),
        prescriptionImage: prescription
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'MedMarket',
        description: 'Medicine Order Payment',
        order_id: data.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email, contact: selectedAddress?.phone },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert(t('orderPlacedSuccess'));
            clearCart();
            navigate('/myorders');
          } catch (err) {
            alert(err.response?.data?.message || t('paymentVerifyFailed'));
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { alert(t('paymentFailed')); setLoading(false); });
      rzp.open();
    } catch (e) {
      alert(e.response?.data?.message || t('orderPlaceFail'));
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!user) return navigate('/login');
    if (!validateBeforeCheckout()) return;
    if (paymentMethod === 'online') handleOnlineCheckout();
    else handleCodCheckout();
  };

  if (!cart.length) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center">
      <ShoppingBag size={64} className="text-slate-300 mb-4"/>
      <h2 className="text-xl font-bold text-slate-700">{t('cartEmpty')}</h2>
      <button onClick={() => navigate(-1)} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">{t('goBack')}</button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">

      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => step === 'checkout' ? setStep('cart') : navigate(-1)} className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold transition-colors">
          <ChevronLeft size={20}/> {step === 'checkout' ? t('backToCart') : t('continueShopping')}
        </button>
        <span className="text-sm font-bold text-slate-800">{step === 'cart' ? `${t('yourCart')} (${cart.length})` : t('checkout')}</span>
        <div className="w-20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">

        <div className="flex-1 space-y-6">

          {step === 'cart' && (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.inventoryId} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden">
                       {item.imageUrl ? <img src={item.imageUrl} className="object-contain p-1" /> : <ShoppingBag className="text-slate-300" size={20}/>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        {item.medicineName}
                        {item.prescriptionRequired && <span className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase"><FileWarning size={9}/> Rx</span>}
                      </h4>
                      <p className="text-xs text-slate-500">{t('soldBy')}: {item.storeName}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-6">
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
                    </div>
                    <button onClick={() => removeFromCart(item.inventoryId)} className="text-rose-500 hover:text-rose-600 p-2"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))}

              {needsPrescription && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3">
                  <FileWarning className="text-rose-500 shrink-0" size={20}/>
                  <p className="text-xs font-bold text-rose-800 leading-relaxed">{t('prescriptionWarning')}</p>
                </div>
              )}
            </div>
          )}

          {step === 'checkout' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><MapPin size={18} className="text-blue-500"/> Deliver To</h3>
                <AddressSelector selectedId={selectedAddress?._id} onSelect={setSelectedAddress} />
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${needsPrescription ? 'text-rose-700' : 'text-slate-700'}`}>
                  <UploadCloud size={18} className={needsPrescription ? 'text-rose-500' : 'text-blue-500'}/> {needsPrescription ? t('prescriptionRequiredLabel') : t('prescriptionOptional')}
                </h3>
                {!previewUrl ? (
                  <label className={`border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition ${needsPrescription ? 'border-rose-300' : 'border-slate-300'}`}>
                    <span className="text-xs font-semibold text-slate-500">{t('clickToUpload')}</span>
                    <input type="file" onChange={handleImage} className="hidden" />
                  </label>
                ) : (
                  <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200 w-fit">
                    <img src={previewUrl} className="h-full object-cover" />
                    <button onClick={() => {setPreviewUrl(null); setPrescription(null);}} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded"><X size={12}/></button>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4">{t('paymentMethod')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 accent-blue-600" />
                    <Truck size={20} className={paymentMethod === 'cod' ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="font-bold text-sm text-slate-800">{t('cashOnDelivery')}</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-4 h-4 accent-blue-600" />
                    <CreditCard size={20} className={paymentMethod === 'online' ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="font-bold text-sm text-slate-800">{t('payOnline')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg sticky top-20">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4 flex items-center gap-2"><Receipt size={20}/> {t('billDetails')}</h3>
            <div className="space-y-3 text-sm font-medium text-slate-600 mb-6">
              <div className="flex justify-between"><span>{t('itemTotal')}</span><span>₹{itemTotal}</span></div>
              <div className="flex justify-between"><span>{t('deliveryFee')}</span><span className="text-emerald-600 font-bold">{deliveryFee === 0 ? t('free') : `₹${deliveryFee}`}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-black text-slate-900"><span>{t('toPay')}</span><span>₹{totalAmount}</span></div>
            </div>

            {step === 'cart' ? (
              <button onClick={() => setStep('checkout')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold transition flex justify-center items-center gap-2">
                {t('proceedToCheckout')} <ArrowRight size={18}/>
              </button>
            ) : (
              <button onClick={handleCheckout} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold transition flex justify-center items-center gap-2 disabled:bg-slate-400">
                {loading ? t('processing') : t('placeOrder')} <ArrowRight size={18}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;