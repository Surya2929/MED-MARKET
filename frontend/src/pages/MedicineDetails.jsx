import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import API from '../services/api';
import { ChevronLeft, ShoppingCart, ShieldCheck, Building2, FlaskConical, Calendar, AlertCircle, ImageOff } from 'lucide-react';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMed = async () => {
      try {
        setLoading(true);
        // Fetch all master medicines to find the specific one
        const res = await API.get('/medicines/master');
        const foundMed = res.data.find(m => String(m._id) === String(id));
        
        if (foundMed) {
          setMedicine(foundMed);
        } else {
          setError(true);
        }
      } catch (err) { 
        console.error("Detail Fetch Error:", err); 
        setError(true);
      } finally { 
        setLoading(false); 
      }
    };
    
    if(id) fetchMed();
  }, [id]);

  // 🚀 Loading State
  if (loading) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-500">Fetching Medicine Details...</p>
    </div>
  );

  // 🚀 Error / Not Found State
  if (error || !medicine) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center">
      <AlertCircle size={50} className="text-rose-400 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">Medicine Not Found</h2>
      <p className="text-slate-500 mb-6">The requested medicine details are unavailable.</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Go Back</button>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      
      {/* 🚀 HEADER WITH BACK BUTTON */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold transition-colors bg-slate-100 px-3 py-1.5 rounded-lg">
          <ChevronLeft size={18}/> Back
        </button>
        <span className="text-sm font-bold text-slate-800 truncate px-4">{medicine.name}</span>
        <button onClick={() => navigate('/cart')} className="relative p-2 text-slate-600 hover:text-blue-600 bg-slate-100 rounded-lg">
          <ShoppingCart size={18}/>
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{cart.length}</span>}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* 🚀 PHOTO SECTION (100% FIXED FOR BASE64) */}
          <div className="md:w-5/12 bg-slate-50 border-r border-slate-100 flex items-center justify-center p-8 relative min-h-[300px]">
            {medicine.imageUrl && medicine.imageUrl.length > 100 ? (
              // If image exists and is a valid long base64 string
              <img src={medicine.imageUrl} alt={medicine.name} className="max-w-full max-h-[350px] object-contain drop-shadow-md rounded-xl" />
            ) : (
              // Fallback if no image is uploaded
              <div className="text-slate-400 flex flex-col items-center bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
                <ImageOff size={48} strokeWidth={1.5} className="mb-3 text-slate-300"/>
                <p className="text-xs font-bold uppercase tracking-widest">No Image Provided</p>
              </div>
            )}
            <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-widest">
              <ShieldCheck size={12}/> Verified
            </div>
          </div>

          {/* 🚀 DETAILS SECTION */}
          <div className="md:w-7/12 p-6 md:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">{medicine.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                    <Building2 size={14} className="text-blue-500"/> {medicine.manufacturer || "Generic Pharma"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                    <FlaskConical size={14} className="text-blue-500"/> {medicine.composition || "Salt Details Not Added"}
                  </span>
                </div>
              </div>

              <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Therapeutic Uses</h4>
                 <p className="text-slate-700 text-sm leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-50 font-medium">
                   {medicine.uses || "Indications and usage guidelines are not specified by the vendor."}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12}/> Mfg. Date</p>
                   <p className="text-sm font-black text-slate-800">{medicine.manufactureDate ? new Date(medicine.manufactureDate).toLocaleDateString('en-GB') : "Check Packaging"}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12}/> Exp. Date</p>
                   <p className="text-sm font-black text-rose-600">{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('en-GB') : "Check Packaging"}</p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl flex gap-3 border border-amber-200 mt-4">
                 <AlertCircle className="text-amber-500 shrink-0" size={20}/>
                 <p className="text-xs font-bold text-amber-800 leading-tight">Please read the label carefully before use. Strictly to be used under medical supervision.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetail;