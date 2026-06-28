import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Info, HelpCircle, Activity, AlertTriangle, ChevronLeft } from 'lucide-react';

const MedicineDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state || !location.state.item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <button onClick={() => navigate('/')} className="text-blue-600 font-bold underline">Go Back to Search</button>
      </div>
    );
  }

  const { item, imageUrl, typeLabel, medType } = location.state;
  const { medicineInfo } = item;

  // 🚀 FIX: Safety checks to prevent split() crashes if data is missing
  const usesList = medicineInfo?.uses ? medicineInfo.uses.split(',') : ["Consult your physician for uses"];
  const sideEffectsList = medicineInfo?.sideEffects ? medicineInfo.sideEffects.split(',') : ["No common side effects reported", "Consult a doctor if you feel unwell"];

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      
      <div className="bg-white border-b border-slate-200 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back to Search Results
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row mb-8">
          <div className="w-full md:w-5/12 bg-slate-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
            <img src={imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop"} alt={medicineInfo?.name || "Medicine"} className="w-64 h-64 object-cover rounded-2xl shadow-lg mix-blend-multiply border-4 border-white" />
          </div>
          
          <div className="w-full md:w-7/12 p-8 lg:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{medicineInfo?.name || "Unknown Medicine"}</h1>
            <p className="text-sm text-slate-500 font-medium mb-6">by MedMarket Verified Partners</p>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-200">
                <ShieldCheck className="w-4 h-4" /> 100% Genuine
              </span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                {typeLabel || "Standard Medicine"}
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-bold block mb-1">Key Ingredients / Salt:</strong> 
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold text-xs border border-blue-100 inline-block">
                  {medicineInfo?.composition || "Information not available"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 lg:p-12">
          <h2 className="text-2xl font-black text-slate-800 mb-8 border-b border-slate-100 pb-4">Product Information</h2>
          
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-blue-500" /> Indications & Uses
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium text-sm leading-relaxed">
                {usesList.map((use, idx) => (
                  <li key={idx}>{use.trim()}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-emerald-500" /> Recommended Dosage
              </h3>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-sm font-semibold">
                {medicineInfo?.dosage || "Take as directed by your physician."}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Safety Information & Side Effects
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium text-sm leading-relaxed">
                {sideEffectsList.map((effect, idx) => (
                  <li key={idx}>{effect.trim()}</li>
                ))}
                <li>Keep medicines out of reach of children.</li>
                <li>Store in a cool and dry place, away from sunlight.</li>
                <li>Use strictly under medical supervision.</li>
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-purple-500" /> Frequently Asked Questions
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Q. What is {medicineInfo?.name} used for?</h4>
                  <p className="text-sm text-slate-600">It is primarily used for the treatment of {usesList[0]?.toLowerCase() || 'medical conditions'}. Please consult a physician for detailed guidance.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Q. How should I store this product?</h4>
                  <p className="text-sm text-slate-600">It is recommended to store this product at room temperature, away from direct heat and sunlight.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MedicineDetails;