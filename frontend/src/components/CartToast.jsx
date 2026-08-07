import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { CheckCircle2, X, ShoppingCart } from 'lucide-react';

const CartToast = () => {
  const { toast, dismissToast } = useContext(CartContext);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[200] animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
          {toast.imageUrl ? <img src={toast.imageUrl} className="w-7 h-7 object-contain rounded" /> : <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12}/> Added to Cart</p>
          <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{toast.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">Qty: {toast.qty} · ₹{toast.price} each</p>
          <Link to="/cart" onClick={dismissToast} className="inline-flex items-center gap-1.5 mt-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
            <ShoppingCart size={12}/> View Cart
          </Link>
        </div>
        <button onClick={dismissToast} className="text-slate-400 hover:text-slate-600 shrink-0"><X size={16}/></button>
      </div>
    </div>
  );
};

export default CartToast;