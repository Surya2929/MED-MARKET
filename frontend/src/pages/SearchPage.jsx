import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import { LanguageContext } from '../context/LanguageContext';
import { Search, MapPin, ShieldCheck, ShoppingCart, Plus, Minus, Tag, Beaker, CheckCircle2, ChevronDown, ChevronUp, Bot, HeartPulse, Activity, Brain, Bone, Baby, LocateFixed, Lightbulb, Package, ArrowRight, StoreIcon, Truck, AlertTriangle, FileWarning, Stethoscope } from 'lucide-react';

// 🚀 NEW: shared stock-display helper — never reveal exact low counts to browsing customers
const getStockLabel = (stock, t) => {
  if (stock <= 0) return { text: t('outOfStockLabel'), color: 'text-rose-600' };
  if (stock <= 5) return { text: t('fewLeft'), color: 'text-amber-600' };
  return { text: t('inStockLabel'), color: 'text-emerald-600' };
};

const StoreRow = ({ store, item, isCheapest, onAdd, t, medType }) => {
  const [qty, setQty] = useState(1);
  
  // 🚀 FIXED: Simplified Packaging Logic
  let packages = null;
  if (medType === 'liquid') packages = [ { label: '100ml Bottle', multiplier: 1 }, { label: '200ml Bottle', multiplier: 1.8 } ];
  else if (medType === 'cream') packages = [ { label: '30g Tube', multiplier: 1 }, { label: '50g Tube', multiplier: 1.6 } ];
  
  const [selectedPkg, setSelectedPkg] = useState(packages ? packages[0] : null);
  
  // Simple Price Calculation
  const basePrice = Math.max(1, Math.round(store.price)); 
  const currentPrice = packages ? Math.round(basePrice * selectedPkg.multiplier) : basePrice;

  // 🚀 FIXED: Manual Typing for Quantity (with Stock Limit)
  const handleQtyChange = (e) => {
    let newQty = parseInt(e.target.value) || '';
    if (newQty > store.stock) newQty = store.stock;
    setQty(newQty);
  };
  
  const handleQtyBlur = () => {
    if (qty === '' || qty < 1) setQty(1);
  };

  if (!store) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between p-4 mb-3 rounded-lg border transition-all ${isCheapest ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      <div className="w-full sm:w-auto flex-1 mb-3 sm:mb-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-bold text-sm ${store.storeName.includes('Express') ? 'text-brand-700' : 'text-slate-800'}`}>{store.storeName}</h4>
          {store.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Pharmacy" />}
          {isCheapest && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded">{t('bestPrice')}</span>}
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">{store.storeName.includes('Express') ? <Truck className="w-3 h-3 text-brand-500" /> : <MapPin className="w-3 h-3 text-slate-400"/>} {store.address}</p>
      </div>

      <div className="w-full sm:w-1/4 mb-4 sm:mb-0 flex justify-start sm:justify-center">
        {packages ? (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
            <Package className="w-4 h-4 text-brand-500" />
            <select value={selectedPkg.label} onChange={(e) => setSelectedPkg(packages.find(p => p.label === e.target.value))} className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[140px]">
              {packages.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md border border-slate-200">Per Unit</div>
        )}
      </div>
      
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-5">
        <div className="text-left sm:text-right">
          <span className="block text-xl font-black text-slate-900 tracking-tight">₹{currentPrice}</span>
          <span className={`text-[10px] font-bold ${getStockLabel(store.stock, t).color}`}>{getStockLabel(store.stock, t).text}</span>
        </div>
        <div className="flex items-center gap-3">
          
          {/* 🚀 EDITABLE QUANTITY BOX */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm h-8">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-2 text-slate-500 hover:bg-slate-50 h-full border-r"><Minus className="w-3 h-3" /></button>
            <input 
              type="number" 
              value={qty} 
              onChange={handleQtyChange} 
              onBlur={handleQtyBlur}
              className="w-10 text-center text-sm font-bold outline-none no-arrows" 
              min="1" 
              max={store.stock}
            />
            <button onClick={() => setQty(q => Math.min(store.stock, (parseInt(q)||0) + 1))} className="px-2 text-slate-500 hover:bg-slate-50 h-full border-l"><Plus className="w-3 h-3" /></button>
          </div>

          <button onClick={() => onAdd(store, item, qty || 1, selectedPkg ? selectedPkg.label : 'Per Unit', currentPrice)} className="bg-brand-600 hover:bg-brand-700 text-white px-3 h-8 rounded-full transition-all shadow-sm text-xs font-semibold flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5"/> {t('add')}
          </button>
        </div>
      </div>
    </div>
  );
};

const MedicineCard = ({ item, isAlternative, onAddToCart, t, navigate, translated }) => {
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

  // Dynamic Images
  let imageUrl = item.medicineInfo.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop"; 
  let typeLabel = t('tabletsCapsules'); // 🚀 FIX: uses the static dictionary now, so it flips to Hindi automatically

  if (!item.medicineInfo.imageUrl) {
    if (medType === 'liquid') { imageUrl = "https://plus.unsplash.com/premium_photo-1675715924046-24ba0da28ae8?q=80&w=200&auto=format&fit=crop"; typeLabel = t('liquidSyrup'); } 
    else if (medType === 'powder') { imageUrl = "https://images.unsplash.com/photo-1616671285444-2e92ed94e1d5?q=80&w=200&auto=format&fit=crop"; typeLabel = t('powderSachets'); } 
    else if (medType === 'cream') { imageUrl = "https://images.unsplash.com/photo-1629198725805-4f36a56e01a0?q=80&w=200&auto=format&fit=crop"; typeLabel = t('creamOintment'); }
  } else {
    if (medType === 'liquid') typeLabel = t('liquidSyrup');
    else if (medType === 'powder') typeLabel = t('powderSachets');
    else if (medType === 'cream') typeLabel = t('creamOintment');
  }

  // 🚀 NEW: use AI-translated text when available (Hindi mode), otherwise fall back to original DB text
  const displayName = translated?.name || item.medicineInfo.name;
  const displayComposition = translated?.composition || item.medicineInfo.composition;

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isAlternative ? 'border-amber-200' : 'border-slate-200'}`}>
      {isAlternative && (
        <div className="bg-amber-50 text-amber-900 px-5 py-2.5 font-extrabold text-[11px] uppercase tracking-widest flex items-center gap-2 border-b border-amber-200">
          <Lightbulb className="w-4 h-4 text-amber-500" /> {t('cheaperAlt')}
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        <div onClick={() => navigate('/medicine-details', { state: { item, imageUrl, typeLabel, medType, translated } })} className="flex gap-6 md:w-5/12 cursor-pointer group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white border border-slate-200 p-2 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt={typeLabel} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1.5 tracking-tight group-hover:text-brand-600 transition-colors">{displayName}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 bg-slate-100 w-fit px-2 py-1 rounded">{typeLabel}</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-block bg-brand-50 text-brand-700 px-3 py-1 rounded-md text-[11px] font-bold border border-brand-100">{displayComposition}</div>
              {/* 🚀 NEW: Prescription Required badge */}
              {item.medicineInfo.prescriptionRequired && (
                <div className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1 rounded-md text-[11px] font-bold border border-rose-100">
                  <FileWarning className="w-3 h-3"/> {t('rxRequired')}
                </div>
              )}
            </div>
            <p className="text-xs text-brand-600 font-bold flex items-center gap-1">{t('viewFullDetails')} <ArrowRight className="w-3 h-3"/></p>
          </div>
        </div>

        <div className="md:w-7/12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-4 w-fit border border-slate-200">
            <button onClick={() => setActiveTab('local')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'local' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}><StoreIcon className="w-3.5 h-3.5" /> Nearby ({localStores.length})</button>
            <button onClick={() => setActiveTab('online')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'online' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}><Truck className="w-3.5 h-3.5" /> Online Delivery ({onlineStores.length})</button>
          </div>

          <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {storesToShow.length > 0 ? (
              <>
                <StoreRow store={storesToShow[0]} item={item} isCheapest={activeTab === 'online'} onAdd={onAddToCart} t={t} medType={medType} />
                {storesToShow.length > 1 && (
                  <div className="mt-2">
                    <button onClick={() => setShowAllStores(!showAllStores)} className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-brand-700 bg-brand-50/60 hover:bg-brand-50 rounded-xl transition-colors border border-brand-100 border-dashed">{showAllStores ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} {showAllStores ? 'Hide' : `View ${storesToShow.length - 1} more`}</button>
                    {showAllStores && (
                      <div className="mt-4 space-y-2 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {storesToShow.slice(1).map((store) => <StoreRow key={store.inventoryId} store={store} item={item} isCheapest={false} onAdd={onAddToCart} t={t} medType={medType} />)}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (<div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">{activeTab === 'local' ? "Out of stock locally." : "Not available for online delivery."}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState({ exactMatches: [], alternatives: [] });
  const [nearbyStores, setNearbyStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [translatedMap, setTranslatedMap] = useState({}); // 🚀 NEW: { [medicineId]: { name, composition, uses } } in Hindi
  
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext); 
  const { userLocation, setManualLocation, fetchCurrentLocation } = useContext(LocationContext) || {};
  const { t, language } = useContext(LanguageContext); 
  const navigate = useNavigate(); 
  const [showLocPopup, setShowLocPopup] = useState(false);
  const [locInput, setLocInput] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const popupRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null); // 🚀 NEW: debounce timer for suggestions
  const lastQueryRef = useRef('');
  const categoriesRef = useRef(null);
  const [popularMeds, setPopularMeds] = useState([]);

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

  // 🚀 FIX: restore the last search from the URL when this page is reached via browser/back-button
  // navigation, instead of showing a blank "home" state (the actual bug behind "View Full Details -> Back").
  useEffect(() => {
    API.get('/medicines/master').then(({ data }) => setPopularMeds((data || []).slice(0, 8))).catch(() => {});
  }, []);

  // 🚀 NEW: Hindi mode — translate medicine name/composition/uses for whatever is currently on screen
  useEffect(() => {
    const translateResults = async () => {
      if (language !== 'Hindi') { setTranslatedMap({}); return; }
      const allItems = [...(results.exactMatches || []), ...(results.alternatives || [])];
      const untranslated = allItems.filter(i => !translatedMap[i.medicineInfo._id]);
      if (untranslated.length === 0) return;

      const texts = [];
      untranslated.forEach(i => { texts.push(i.medicineInfo.name, i.medicineInfo.composition, i.medicineInfo.uses || ''); });

      try {
        const { data } = await API.post('/medicines/translate', { texts });
        const newMap = { ...translatedMap };
        untranslated.forEach((i, idx) => {
          newMap[i.medicineInfo._id] = {
            name: data.translations[idx * 3] || i.medicineInfo.name,
            composition: data.translations[idx * 3 + 1] || i.medicineInfo.composition,
            uses: data.translations[idx * 3 + 2] || i.medicineInfo.uses
          };
        });
        setTranslatedMap(newMap);
      } catch (err) { /* silently fall back to English if translation fails */ }
    };
    translateResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, language]);

  const handleInputChange = (e) => {
    const value = e.target.value; setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 2) {
      // 🚀 FIX: wait 300ms after the user stops typing instead of firing an API call on every keystroke
      debounceRef.current = setTimeout(async () => {
        try {
          const { data } = await API.get(`/medicines/suggestions?q=${value}`);
          setSuggestions(data); setShowSuggestions(true);
        } catch (err) { setSuggestions([]); }
      }, 300);
    } else { setShowSuggestions(false); }
  };

  const triggerSearch = async (searchTerm, updateUrl = true) => {
    lastQueryRef.current = searchTerm;
    setQuery(searchTerm); setShowSuggestions(false); setLoading(true); setHasSearched(true);
    if (updateUrl) setSearchParams({ q: searchTerm }); // 🚀 FIX: keep the query in the URL so Back restores this exact search
    try {
      const cityToSearch = userLocation?.searchTerm || userLocation?.city?.split(',').pop().trim() || 'All Cities';
      const { data } = await API.get(`/medicines/search?q=${searchTerm}&city=${cityToSearch}`);
      setResults(data);
    } catch (err) { setResults({ exactMatches: [], alternatives: [] }); } finally { setLoading(false); }
  };

  // Also reacts to ?q= changes from the navbar search, and resets to the home view when ?q= is cleared (logo click).
  const urlQuery = searchParams.get('q') || '';
  useEffect(() => {
    if (urlQuery && urlQuery !== lastQueryRef.current) {
      triggerSearch(urlQuery, false); // false = don't push a new URL entry, we're already on it
    } else if (!urlQuery && lastQueryRef.current) {
      lastQueryRef.current = '';
      setQuery(''); setHasSearched(false); setResults({ exactMatches: [], alternatives: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const handleSearch = (e) => { e.preventDefault(); if (query.trim()) triggerSearch(query); };

  const handleAddToCart = (store, item, qty, packageLabel, finalPrice) => {
    if (!user) { alert("Please login first."); navigate('/login'); return; }
    addToCart({ inventoryId: `${store.inventoryId}-${packageLabel}`, medicineId: item.medicineInfo._id, medicineName: `${item.medicineInfo.name} (${packageLabel})`, storeId: store.storeId, storeName: store.storeName, price: finalPrice, stock: store.stock, imageUrl: item.medicineInfo.imageUrl, prescriptionRequired: !!item.medicineInfo.prescriptionRequired }, qty);
  };

  const healthCategories = [
    { name: "Diabetes Care", icon: Activity, tint: "text-rose-500", searchTerm: "Metformin" },
    { name: "Heart Care", icon: HeartPulse, tint: "text-red-500", searchTerm: "Diacard" },
    { name: "Allergy Relief", icon: Brain, tint: "text-purple-500", searchTerm: "Cetirizine" },
    { name: "Fever & Pain", icon: Bone, tint: "text-amber-500", searchTerm: "Dolo" },
    { name: "Antibiotics", icon: Baby, tint: "text-sky-500", searchTerm: "Augmentin" },
    { name: "Acidity & Gas", icon: Beaker, tint: "text-emerald-500", searchTerm: "Eno" },
  ];

  const fallbackMedImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&auto=format&fit=crop";

  const searchForm = (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-white rounded-2xl sm:rounded-full shadow-xl shadow-brand-900/20 w-full max-w-2xl p-1.5 gap-1.5">
      <div className="relative" ref={popupRef}>
        <button type="button" onClick={() => setShowLocPopup(!showLocPopup)} className="flex items-center justify-between gap-2 px-4 h-11 bg-slate-100 hover:bg-slate-200/70 rounded-xl sm:rounded-full w-full sm:w-[190px] transition-colors">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <div className="flex flex-col items-start text-left overflow-hidden">
              <span className="text-[9px] font-semibold text-slate-400 uppercase leading-none mb-0.5">{t('deliverTo')}</span>
              <span className="text-xs font-bold text-slate-800 truncate w-full">{userLocation?.city || 'Select Location'}</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
        {showLocPopup && (
          <div className="absolute top-[115%] left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in text-left">
            <div className="p-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-800">Choose your location</h3></div>
            <div className="p-4">
              <div className="flex items-center border border-slate-300 rounded-full overflow-hidden focus-within:border-brand-600 mb-4 bg-white">
                <input type="text" value={locInput} onChange={(e)=>setLocInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if(locInput.trim()){ setLocLoading(true); setManualLocation?.(locInput).then(success => { setLocLoading(false); if(success) setShowLocPopup(false); }); } } }} placeholder="Enter Pincode/City" className="flex-1 px-4 py-2.5 text-sm outline-none text-slate-800" />
                <button type="button" onClick={async () => { if(locInput.trim()){ setLocLoading(true); const success = await setManualLocation?.(locInput); setLocLoading(false); if(success) setShowLocPopup(false); } }} disabled={locLoading} className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/60 text-white px-4 py-2.5 transition-colors font-bold text-sm">{locLoading ? 'Saving...' : 'Save'}</button>
              </div>
              <button type="button" onClick={async () => { setLocLoading(true); try { await fetchCurrentLocation?.(); setShowLocPopup(false); } catch(e) {} setLocLoading(false); }} className="w-full flex items-center gap-3 text-brand-700 font-bold text-sm p-3 hover:bg-brand-50 rounded-xl transition-colors"><LocateFixed className="w-5 h-5" /> {locLoading ? 'Fetching GPS...' : 'Use current location'}</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col relative" ref={searchRef}>
        <div className="flex items-center px-3 relative w-full h-11">
          <Search className="text-slate-400 w-5 h-5 shrink-0" />
          <input type="text" value={query} onChange={handleInputChange} placeholder={t('searchPlaceholder')} className="w-full px-2.5 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm font-medium h-full" />
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-[115%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-left animate-fade-in">
            {suggestions.map((sug, index) => (
              <div key={index} onClick={() => triggerSearch(sug.name)} className="px-4 py-3 hover:bg-brand-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex items-center justify-between group transition-colors">
                <div><p className="font-bold text-slate-800 text-sm group-hover:text-brand-700 transition-colors">{sug.name}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{sug.composition}</p></div><ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
      <button type="submit" className="bg-lime-accent hover:bg-lime-accent-dark text-brand-900 px-7 h-11 rounded-xl sm:rounded-full font-bold text-sm transition-colors">{t('searchBtn')}</button>
    </form>
  );

  const renderHeader = (title) => (
    <div className="flex items-end justify-between mb-6">
      <h3 className="text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight">{title}</h3>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-16 font-sans text-slate-900">

      {!hasSearched && !loading ? (
        <>
          {/* 🌿 HERO */}
          <section className="px-3 sm:px-6 lg:px-8 pt-4">
            <div className="max-w-7xl mx-auto bg-brand-700 rounded-[28px] relative overflow-hidden">
              {/* soft glow + watermark */}
              <div className="absolute -top-32 -right-24 w-[480px] h-[480px] bg-brand-500/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-6 sm:-bottom-10 left-0 right-0 text-center select-none pointer-events-none font-black tracking-tight text-white/[0.07] text-[22vw] lg:text-[200px] leading-none">PHARMACY</div>

              <div className="relative grid lg:grid-cols-2 gap-6 px-6 sm:px-10 lg:px-14 pt-10 lg:pt-16">
                <div className="pb-10 lg:pb-24 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-lime-accent text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('genuineDrugs')}
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08] mb-5">{t('heroTitle')}</h1>
                  <p className="text-brand-100/90 text-sm sm:text-base mb-7 max-w-md">{t('heroSub')}</p>

                  {searchForm}

                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    <button onClick={() => categoriesRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-lime-accent hover:bg-lime-accent-dark text-brand-900 font-semibold text-sm px-6 h-11 rounded-full transition-colors">Shop Now</button>
                    <button onClick={() => navigate('/chat')} className="border border-white/40 hover:bg-white/10 text-white font-semibold text-sm px-6 h-11 rounded-full transition-colors flex items-center gap-2"><Bot className="w-4 h-4" /> {t('aiConsult')}</button>
                  </div>

                  <div className="flex items-center gap-3 mt-8">
                    <div className="flex -space-x-2">
                      {['bg-amber-300', 'bg-sky-300', 'bg-rose-300'].map((c, i) => (
                        <span key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-brand-700 flex items-center justify-center text-brand-900`}><HeartPulse className="w-3.5 h-3.5" /></span>
                      ))}
                    </div>
                    <div className="text-xs text-white">
                      <p className="font-semibold flex items-center gap-1"><span className="text-lime-accent">★</span> {nearbyStores.length > 0 ? `${nearbyStores.length}+ verified pharmacies` : 'Verified pharmacies'}</p>
                      <p className="text-brand-100/80">{t('lowestPrices')}</p>
                    </div>
                  </div>
                </div>

                {/* doctor image + floating product card */}
                <div className="relative hidden lg:flex items-end justify-center">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=900&auto=format&fit=crop" alt="Pharmacist" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative z-10 h-[520px] w-auto object-cover object-top rounded-t-[200px] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" />
                  {popularMeds[0] && (
                    <div onClick={() => triggerSearch(popularMeds[0].name)} className="absolute z-20 bottom-10 right-0 bg-white rounded-2xl p-3 pr-4 shadow-2xl flex items-center gap-3 w-64 cursor-pointer hover:-translate-y-1 transition-transform">
                      <img src={popularMeds[0].imageUrl || fallbackMedImg} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-brand-600 uppercase">Popular now</p>
                        <p className="font-bold text-sm text-slate-900 truncate">{popularMeds[0].name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{popularMeds[0].composition}</p>
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-lime-accent flex items-center justify-center"><ArrowRight className="w-3.5 h-3.5 -rotate-45 text-brand-900" /></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* trust strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Tag, title: t('lowestPrices'), desc: t('lowestPricesDesc') },
                { icon: ShieldCheck, title: t('genuineDrugs'), desc: t('genuineDrugsDesc') },
                { icon: Bot, title: t('freeAI'), desc: t('freeAIDesc') },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-50 p-5 rounded-2xl flex items-start gap-4">
                  <div className="p-2.5 bg-brand-600 rounded-xl text-lime-accent shrink-0"><Icon className="w-5 h-5" /></div>
                  <div><h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4><p className="text-slate-500 text-xs leading-relaxed">{desc}</p></div>
                </div>
              ))}
            </div>

            {/* 🛍️ SHOP BY CATEGORY */}
            <section ref={categoriesRef} className="mt-14 scroll-mt-24">
              {renderHeader("Shop by Category")}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {healthCategories.map(({ name, icon: Icon, tint, searchTerm }) => (
                  <button key={name} onClick={() => triggerSearch(searchTerm)} className="group text-center">
                    <div className="aspect-square bg-slate-50 group-hover:bg-brand-50 rounded-2xl flex items-center justify-center transition-colors mb-2.5">
                      <Icon className={`w-10 h-10 sm:w-12 sm:h-12 ${tint} group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-brand-700">{name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 💊 POPULAR MEDICINES */}
            {popularMeds.length > 0 && (
              <section className="mt-14">
                {renderHeader("Popular medicines")}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularMeds.map((med) => (
                    <div key={med._id} className="group">
                      <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3">
                        <img src={med.imageUrl || fallbackMedImg} alt={med.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                        {med.prescriptionRequired ? (
                          <span className="absolute top-3 right-3 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md">{t('rxRequired')}</span>
                        ) : (
                          <span className="absolute top-3 right-3 bg-lime-accent text-brand-900 text-[10px] font-bold px-2 py-0.5 rounded-md">OTC</span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{med.name}</h4>
                      <p className="text-xs text-slate-500 truncate mb-3">{med.composition}</p>
                      <button onClick={() => triggerSearch(med.name)} className="w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold h-9 rounded-full transition-colors flex items-center justify-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Compare prices
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 🎯 PROMO BANNERS */}
            <section className="grid md:grid-cols-2 gap-4 mt-14">
              <div className="bg-[#e6f4d7] rounded-3xl p-7 flex items-center justify-between gap-4 overflow-hidden relative">
                <div className="z-10">
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{t('freeAI')}</h4>
                  <button onClick={() => navigate('/chat')} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 h-9 rounded-full">{t('aiConsult')}</button>
                </div>
                <Stethoscope className="w-28 h-28 text-brand-600/20 absolute -right-2 -bottom-4" />
              </div>
              <div className="bg-[#dff1ee] rounded-3xl p-7 flex items-center justify-between gap-4 overflow-hidden relative">
                <div className="z-10">
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{t('lowestPrices')}</h4>
                  <button onClick={() => categoriesRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-5 h-9 rounded-full">Shop Now</button>
                </div>
                <Tag className="w-28 h-28 text-brand-600/20 absolute -right-2 -bottom-4" />
              </div>
            </section>

            {/* 🏥 NEARBY PHARMACIES */}
            <section className="mt-14">
              {renderHeader(`Nearby Pharmacies in ${userLocation?.city?.split(',').pop() || 'your area'}`)}
              {nearbyStores.length === 0 ? (
                <div className="bg-slate-50 p-8 rounded-2xl text-center">
                  <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium text-sm">No partner pharmacies registered in this area yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyStores.map(store => (
                    <div key={store._id} className="bg-slate-50 p-5 rounded-2xl flex items-start gap-4 hover:bg-brand-50 transition-colors">
                      <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center shrink-0"><StoreIcon className="w-6 h-6 text-lime-accent" /></div>
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-1.5">{store.storeName} {store.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-brand-600" title="Verified" />}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {store.address}</p>
                        <p className="text-[10px] bg-white text-slate-600 w-fit px-2 py-0.5 rounded font-bold mt-2">Drug License: {store.licenseNumber || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <section className="px-3 sm:px-6 lg:px-8 pt-4">
          <div className="max-w-7xl mx-auto bg-brand-700 rounded-[28px] px-6 sm:px-10 py-8 flex flex-col lg:flex-row lg:items-center gap-5 relative">
            <div className="lg:w-1/3">
              <p className="text-lime-accent text-xs font-semibold mb-1">{t('searchMeds')}</p>
              <h1 className="text-2xl font-bold text-white tracking-tight truncate">“{query}”</h1>
            </div>
            {searchForm}
          </div>
        </section>
      )}

      <div className="max-w-5xl mx-auto px-4">
        {loading && <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto"></div></div>}

        {hasSearched && !loading && (!results.exactMatches || results.exactMatches.length === 0) && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-1">{t('noMeds')}</h2>
            <p className="text-slate-500 text-sm">Please check the spelling or search using the salt composition.</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {results.exactMatches && results.exactMatches.map((item) => (
            <MedicineCard key={item.medicineInfo._id} item={item} isAlternative={false} onAddToCart={handleAddToCart} t={t} navigate={navigate} translated={translatedMap[item.medicineInfo._id]} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
