import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import { LanguageContext } from '../context/LanguageContext';
import { Search, MapPin, ShieldCheck, ShoppingCart, Plus, Minus, Tag, Beaker, CheckCircle2, ChevronDown, ChevronUp, Bot, HeartPulse, Activity, Brain, Bone, Baby, LocateFixed, Lightbulb, Package, ArrowRight, StoreIcon, Truck, AlertTriangle } from 'lucide-react';

const StoreRow = ({ store, item, isCheapest, onAdd, t, medType }) => {
  const [qty, setQty] = useState(1);
  let packages = null;
  if (medType === 'liquid') packages = [ { label: '100ml Bottle', multiplier: 1 }, { label: '200ml Bottle', multiplier: 1.8 } ];
  else if (medType === 'powder') packages = [ { label: '1 Sachet / Unit', multiplier: 1 }, { label: 'Box of 6 Sachets', multiplier: 5.5 } ];
  else if (medType === 'cream') packages = [ { label: '30g Tube', multiplier: 1 }, { label: '50g Tube', multiplier: 1.6 } ];
  
  const [selectedPkg, setSelectedPkg] = useState(packages ? packages[0] : null);
  const basePrice = (medType === 'solid' || medType === 'powder') ? Math.max(1, Math.round(store.price / 10)) : store.price; 
  const currentPrice = packages ? Math.round(basePrice * selectedPkg.multiplier) : basePrice;

  if (!store) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between p-4 mb-3 rounded-lg border transition-all ${isCheapest ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      <div className="w-full sm:w-auto flex-1 mb-3 sm:mb-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-bold text-sm ${store.storeName.includes('Express') ? 'text-blue-700' : 'text-slate-800'}`}>
            {store.storeName}
          </h4>
          {store.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Pharmacy" />}
          {isCheapest && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded">{t('bestPrice')}</span>}
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          {store.storeName.includes('Express') ? <Truck className="w-3 h-3 text-blue-500" /> : <MapPin className="w-3 h-3 text-slate-400"/>} 
          {store.address}
        </p>
      </div>

      <div className="w-full sm:w-1/4 mb-4 sm:mb-0 flex justify-start sm:justify-center">
        {packages ? (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
            <Package className="w-4 h-4 text-blue-500" />
            <select value={selectedPkg.label} onChange={(e) => setSelectedPkg(packages.find(p => p.label === e.target.value))} className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[140px]">
              {packages.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md border border-slate-200">Per Tablet/Capsule</div>
        )}
      </div>
      
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-5">
        <div className="text-left sm:text-right">
          <span className="block text-xl font-black text-slate-900 tracking-tight">₹{currentPrice}</span>
          <span className="text-[10px] text-slate-500 font-medium">{t('inStock')}: <span className="text-emerald-600 font-bold">{store.stock}</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm h-8">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-2 text-slate-500 hover:bg-slate-50"><Minus className="w-3 h-3" /></button>
            <span className="font-semibold text-slate-700 w-6 text-center text-sm">{qty}</span>
            <button onClick={() => setQty(q => Math.min(store.stock, q + 1))} className="px-2 text-slate-500 hover:bg-slate-50"><Plus className="w-3 h-3" /></button>
          </div>
          <button onClick={() => onAdd(store, item, qty, selectedPkg ? selectedPkg.label : 'Per Unit', currentPrice)} className="bg-slate-900 hover:bg-slate-800 text-white px-3 h-8 rounded-md transition-all shadow-sm text-xs font-semibold flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5"/> {t('add')}
          </button>
        </div>
      </div>
    </div>
  );
};

const MedicineCard = ({ item, isAlternative, onAddToCart, t, navigate }) => {
  const [activeTab, setActiveTab] = useState('local'); 
  const [showAllStores, setShowAllStores] = useState(false);
  
  if (!item || !item.stores) return null;

  const localStores = item.stores.local || [];
  const onlineStores = item.stores.online || [];
  const storesToShow = activeTab === 'local' ? localStores : onlineStores;

  const medName = item.medicineInfo.name?.toLowerCase() || "";
  const medUses = item.medicineInfo.uses?.toLowerCase() || "";
  const medComposition = item.medicineInfo.composition?.toLowerCase() || "";
  const combinedData = `${medName} ${medUses} ${medComposition}`;
  
  let medType = 'solid'; 
  if (combinedData.includes('drop') || combinedData.includes('syrup') || combinedData.includes('liquid') || combinedData.includes('diacard')) medType = 'liquid';
  else if (combinedData.includes('eno') || combinedData.includes('powder') || combinedData.includes('sachet') || combinedData.includes('ors') || combinedData.includes('electral')) medType = 'powder';
  else if (combinedData.includes('cream') || combinedData.includes('gel') || combinedData.includes('ointment') || combinedData.includes('volini') || combinedData.includes('moov')) medType = 'cream';

  let imageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop"; 
  let typeLabel = "Tablets / Capsules";

  if (medType === 'liquid') { imageUrl = "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=200&auto=format&fit=crop"; typeLabel = "Liquid / Syrup / Drops"; } 
  else if (medType === 'powder') { imageUrl = "https://images.unsplash.com/photo-1616671285444-2e92ed94e1d5?q=80&w=200&auto=format&fit=crop"; typeLabel = "Powder / Sachets"; } 
  else if (medType === 'cream') { imageUrl = "https://images.unsplash.com/photo-1629198725805-4f36a56e01a0?q=80&w=200&auto=format&fit=crop"; typeLabel = "Cream / Ointment / Gel"; }

  // 🚀 FIX: Navigate properly to details page with complete payload
  const goToDetails = () => {
    navigate('/medicine-details', { state: { item, imageUrl, typeLabel, medType } });
  };

  return (
    <div className={`bg-white rounded-[1.5rem] border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isAlternative ? 'border-amber-200' : 'border-slate-200'}`}>
      {isAlternative && (
        <div className="bg-amber-50 text-amber-900 px-5 py-2.5 font-extrabold text-[11px] uppercase tracking-widest flex items-center gap-2 border-b border-amber-200">
          <Lightbulb className="w-4 h-4 text-amber-500" /> {t('cheaperAlt')}
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        
        {/* CLICKABLE AREA FOR DETAILS */}
        <div onClick={goToDetails} className="flex gap-6 md:w-5/12 cursor-pointer group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 rounded-2xl border border-slate-200 p-2 shrink-0 flex items-center justify-center group-hover:border-blue-400 transition-colors">
            <img src={imageUrl} alt={typeLabel} className="w-full h-full object-cover rounded-xl shadow-sm mix-blend-multiply" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1.5 tracking-tight group-hover:text-blue-600 transition-colors">{item.medicineInfo.name}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 bg-slate-100 w-fit px-2 py-1 rounded">{typeLabel}</p>
            <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-[11px] font-bold border border-blue-100 mb-3">{item.medicineInfo.composition}</div>
            <p className="text-xs text-blue-600 font-bold flex items-center gap-1">View Full Details <ArrowRight className="w-3 h-3"/></p>
          </div>
        </div>

        <div className="md:w-7/12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8">
          
          <div className="flex bg-slate-100 p-1 rounded-lg mb-4 w-fit border border-slate-200">
            <button onClick={() => setActiveTab('local')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'local' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              <StoreIcon className="w-3.5 h-3.5" /> Nearby Pharmacy ({localStores.length})
            </button>
            <button onClick={() => setActiveTab('online')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'online' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              <Truck className="w-3.5 h-3.5" /> Online Delivery ({onlineStores.length})
            </button>
          </div>

          <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {storesToShow.length > 0 ? (
              <>
                <StoreRow store={storesToShow[0]} item={item} isCheapest={activeTab === 'online'} onAdd={onAddToCart} t={t} medType={medType} />
                
                {storesToShow.length > 1 && (
                  <div className="mt-2">
                    <button onClick={() => setShowAllStores(!showAllStores)} className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 rounded-xl transition-colors border border-blue-100 border-dashed">
                      {showAllStores ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showAllStores ? 'Hide' : `View ${storesToShow.length - 1} more`}
                    </button>
                    {showAllStores && (
                      <div className="mt-4 space-y-2 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {storesToShow.slice(1).map((store) => (
                          <StoreRow key={store.inventoryId} store={store} item={item} isCheapest={false} onAdd={onAddToCart} t={t} medType={medType} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                {activeTab === 'local' ? "Out of stock in nearby pharmacies." : "Not available for online delivery."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState({ exactMatches: [], alternatives: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [nearbyStores, setNearbyStores] = useState([]);
  
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext); 
  const { userLocation, setManualLocation, fetchCurrentLocation } = useContext(LocationContext) || {};
  const { t } = useContext(LanguageContext); 
  const navigate = useNavigate(); 

  const [showLocPopup, setShowLocPopup] = useState(false);
  const [locInput, setLocInput] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const popupRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) setShowLocPopup(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const cityToSearch = userLocation?.searchTerm || userLocation?.city?.split(',').pop().trim() || 'All Cities';
        const { data } = await API.get(`/medicines/stores?city=${cityToSearch}`);
        setNearbyStores(data);
      } catch (err) {}
    };
    fetchStores();
  }, [userLocation]);

  const handleInputChange = async (e) => {
    const value = e.target.value; setQuery(value);
    if (value.trim().length >= 2) {
      try {
        const { data } = await API.get(`/medicines/suggestions?q=${value}`);
        setSuggestions(data); setShowSuggestions(true);
      } catch (err) { setSuggestions([]); }
    } else { setShowSuggestions(false); }
  };

  const triggerSearch = async (searchTerm) => {
    setQuery(searchTerm); setShowSuggestions(false); setLoading(true); setHasSearched(true);
    try {
      const cityToSearch = userLocation?.searchTerm || userLocation?.city?.split(',').pop().trim() || 'All Cities';
      const { data } = await API.get(`/medicines/search?q=${searchTerm}&city=${cityToSearch}`);
      setResults(data);
    } catch (err) {
      setResults({ exactMatches: [], alternatives: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); if (query.trim()) triggerSearch(query); };

  const handleAddToCart = (store, item, qty, packageLabel, finalPrice) => {
    if (!user) { alert("Please login first."); navigate('/login'); return; }
    addToCart({ inventoryId: `${store.inventoryId}-${packageLabel}`, medicineId: item.medicineInfo._id, medicineName: `${item.medicineInfo.name} (${packageLabel})`, storeId: store.storeId, storeName: store.storeName, price: finalPrice }, qty);
  };

  const healthCategories = [
    { name: "Diabetes Care", icon: <Activity className="w-6 h-6 text-rose-500" />, color: "bg-rose-50 border-rose-100", searchTerm: "Metformin" },
    { name: "Heart Care", icon: <HeartPulse className="w-6 h-6 text-rose-600" />, color: "bg-rose-50 border-rose-100", searchTerm: "Diacard" },
    { name: "Allergy Relief", icon: <Brain className="w-6 h-6 text-purple-500" />, color: "bg-purple-50 border-purple-100", searchTerm: "Cetirizine" },
    { name: "Fever & Pain", icon: <Bone className="w-6 h-6 text-amber-600" />, color: "bg-amber-50 border-amber-100", searchTerm: "Dolo" },
    { name: "Antibiotics", icon: <Baby className="w-6 h-6 text-sky-500" />, color: "bg-sky-50 border-sky-100", searchTerm: "Augmentin" },
    { name: "Acidity & Gas", icon: <Beaker className="w-6 h-6 text-emerald-500" />, color: "bg-emerald-50 border-emerald-100", searchTerm: "Eno" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans text-slate-900">
      <div className="bg-slate-900 py-16 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{t('heroTitle')}</h1>
          <p className="text-slate-400 text-sm md:text-base mb-8">{t('heroSub')}</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-0 bg-white rounded-xl shadow-2xl max-w-4xl mx-auto border border-slate-200">
            <div className="relative border-b sm:border-b-0 sm:border-r border-slate-200" ref={popupRef}>
              <button type="button" onClick={() => setShowLocPopup(!showLocPopup)} className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none w-full sm:w-[220px] transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{t('deliverTo')}</span>
                    <span className="text-sm font-bold text-slate-800 truncate w-full">{userLocation?.city || 'Select Location'}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              {showLocPopup && (
                <div className="absolute top-[110%] left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in text-left">
                  <div className="p-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-800">Choose your location</h3></div>
                  <div className="p-4">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 mb-4 bg-white">
                      <input type="text" value={locInput} onChange={(e)=>setLocInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if(locInput.trim()){ setLocLoading(true); setManualLocation?.(locInput).then(success => { setLocLoading(false); if(success) setShowLocPopup(false); }); } } }} placeholder="Enter Pincode/City" className="flex-1 px-4 py-2.5 text-sm outline-none text-slate-800" />
                      <button type="button" onClick={async () => { if(locInput.trim()){ setLocLoading(true); const success = await setManualLocation?.(locInput); setLocLoading(false); if(success) setShowLocPopup(false); } }} disabled={locLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 transition-colors font-bold">{locLoading ? 'Saving...' : 'Save'}</button>
                    </div>
                    <button type="button" onClick={async () => { setLocLoading(true); try { await fetchCurrentLocation?.(); setShowLocPopup(false); } catch(e) {} setLocLoading(false); }} className="w-full flex items-center gap-3 text-blue-600 font-bold text-sm p-3 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"><LocateFixed className="w-5 h-5" /> {locLoading ? 'Fetching GPS...' : 'Use current location'}</button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col relative" ref={searchRef}>
              <div className="flex items-center px-4 bg-white relative w-full h-full">
                <Search className="text-slate-400 w-5 h-5 absolute left-4" />
                <input type="text" value={query} onChange={handleInputChange} placeholder={t('searchPlaceholder')} className="w-full pl-8 pr-4 py-3.5 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-base font-medium h-full" />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[105%] left-0 w-full bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-left animate-fade-in">
                  {suggestions.map((sug, index) => (
                    <div key={index} onClick={() => triggerSearch(sug.name)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex items-center justify-between group transition-colors">
                      <div><p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{sug.name}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{sug.composition}</p></div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 sm:rounded-r-xl font-bold text-base transition-all">{t('searchBtn')}</button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!hasSearched && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-12">
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:shadow-md transition"><div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Tag className="w-6 h-6" /></div><div><h4 className="font-bold text-slate-800 text-sm mb-1">{t('lowestPrices')}</h4><p className="text-slate-500 text-xs leading-relaxed">{t('lowestPricesDesc')}</p></div></div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:shadow-md transition"><div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><ShieldCheck className="w-6 h-6" /></div><div><h4 className="font-bold text-slate-800 text-sm mb-1">{t('genuineDrugs')}</h4><p className="text-slate-500 text-xs leading-relaxed">{t('genuineDrugsDesc')}</p></div></div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:shadow-md transition"><div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Bot className="w-6 h-6" /></div><div><h4 className="font-bold text-slate-800 text-sm mb-1">{t('freeAI')}</h4><p className="text-slate-500 text-xs leading-relaxed">{t('freeAIDesc')}</p></div></div>
            </div>
            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Shop by Health Concerns</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {healthCategories.map((cat, idx) => (
                  <div key={idx} onClick={() => triggerSearch(cat.searchTerm)} className={`p-4 bg-white border ${cat.color} rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4`}>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">{cat.icon}</div>
                    <span className="font-bold text-slate-700 text-sm mt-2 sm:mt-0">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-12">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3 flex items-center gap-2"><StoreIcon className="w-6 h-6 text-blue-600" /> Nearby Pharmacies in {userLocation?.city?.split(',').pop() || 'your area'}</h3>
              {nearbyStores.length === 0 ? (
                <div className="bg-slate-100 p-6 rounded-xl text-center border border-slate-200 border-dashed">
                  <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">No partner pharmacies registered in this area yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyStores.map(store => (
                    <div key={store._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0"><StoreIcon className="w-6 h-6 text-emerald-600" /></div>
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">{store.storeName} {store.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified" />}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {store.address}</p>
                        <p className="text-[10px] bg-slate-100 text-slate-600 w-fit px-2 py-0.5 rounded font-bold mt-2">Drug License: {store.licenseNumber || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {loading && <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full mx-auto"></div></div>}
        
        {hasSearched && !loading && (!results.exactMatches || results.exactMatches.length === 0) && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 mt-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-1">{t('noMeds')}</h2>
            <p className="text-slate-500 text-sm">Please check the spelling or search using the salt composition.</p>
          </div>
        )}

        <div className="mt-8">
          {results.exactMatches && results.exactMatches.map((item) => (
            <MedicineCard key={item.medicineInfo._id} item={item} isAlternative={false} onAddToCart={handleAddToCart} t={t} navigate={navigate} />
          ))}

          {results.alternatives && results.alternatives.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Lightbulb className="w-6 h-6 text-amber-500" /> {t('cheaperAlt')}</h2>
              {results.alternatives.map((item) => (
                <MedicineCard key={item.medicineInfo._id} item={item} isAlternative={true} onAddToCart={handleAddToCart} t={t} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;