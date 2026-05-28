import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, CheckCircle, ShieldCheck, Bot, Tag, ShoppingCart, Plus, Minus } from 'lucide-react';

// 🚀 NAYA COMPONENT: Har store ke aage Quantity set karne ke liye
const StoreRow = ({ store, item, isCheapest, onAdd }) => {
  const [qty, setQty] = useState(1); // Default quantity is 1

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center p-5 rounded-2xl transition-all duration-300 hover:shadow-lg ${isCheapest ? 'bg-gradient-to-r from-green-50 to-white border-2 border-green-400 relative overflow-hidden' : 'bg-white border border-slate-200 shadow-sm'}`}>
      
      {isCheapest && (
         <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest shadow-sm">Best Deal</div>
      )}

      <div className="w-full sm:w-auto mb-4 sm:mb-0">
        <h4 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
          {store.storeName} 
          {store.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" title="Verified Store" />}
        </h4>
        <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4 text-slate-400"/> {store.address}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
        
        <div className="text-right flex sm:block items-center justify-between w-full sm:w-auto">
          <span className="block text-2xl font-black text-slate-800">₹{store.price}</span>
          <span className="text-[10px] uppercase tracking-widest text-green-700 font-black bg-green-100 px-2 py-1 rounded-md mt-1 inline-block">In Stock: {store.stock}</span>
        </div>

        {/* 🌟 QUANTITY SELECTOR (+ / -) */}
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button 
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="bg-white p-1.5 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800 w-6 text-center">{qty}</span>
          <button 
            onClick={() => setQty(q => Math.min(store.stock, q + 1))}
            className="bg-white p-1.5 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* ADD BUTTON */}
        <button 
          onClick={() => onAdd(store, item, qty)} // Quantity pass kar rahe hain
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-blue-500/40 transform hover:-translate-y-0.5">
          <ShoppingCart className="w-5 h-5"/> Add
        </button>
      </div>
    </div>
  );
};


const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate(); 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const { data } = await API.get(`/medicines/search?q=${query}`);
      setResults(data);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Handle Add To Cart (With Quantity)
  const handleAddToCart = (store, item, qty) => {
    if (!user) {
      alert("Please login first to add medicines to your cart! 🔒");
      navigate('/login');
      return;
    }
    
    addToCart({ 
      inventoryId: store.inventoryId, 
      medicineId: item.medicineInfo._id, 
      medicineName: item.medicineInfo.name, 
      storeId: store.storeId, 
      storeName: store.storeName, 
      price: store.price 
    }, qty); // 👈 Qty pass ki gayi
  };

  return (
    <div className="bg-gradient-to-br from-blue-200 via-indigo-100 to-cyan-200 min-h-screen pb-12">
      
      <div 
        className="relative bg-cover bg-center py-24 shadow-inner" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Find the Best Medicines <br/> at the <span className="text-green-400">Lowest Prices</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Compare prices from verified local pharmacies, consult our AI Healthcare Assistant, and get your medicines delivered fast.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-white/20">
            <div className="flex-1 flex items-center bg-blue-50/50 rounded-xl px-4 border border-blue-100 focus-within:border-blue-500 focus-within:bg-white transition">
              <Search className="text-blue-500 w-6 h-6" />
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search for Paracetamol, Dolo 650, Aspirin..." 
                className="w-full px-4 py-4 bg-transparent outline-none text-lg text-gray-800 placeholder-gray-400" 
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-2">
              Search
            </button>
          </form>
        </div>
      </div>

      {!hasSearched && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-blue-200 text-center flex flex-col items-center hover:-translate-y-1 transition duration-300">
              <div className="bg-blue-600 p-4 rounded-2xl mb-6 text-white shadow-md shadow-blue-200"><Tag className="w-8 h-8" /></div>
              <h3 className="text-xl font-extrabold text-blue-950 mb-3">Price Comparison</h3>
              <p className="text-blue-800/80 font-medium">We analyze multiple pharmacies to find you the cheapest price instantly.</p>
            </div>
            <div className="bg-teal-50/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-teal-200 text-center flex flex-col items-center hover:-translate-y-1 transition duration-300">
              <div className="bg-teal-600 p-4 rounded-2xl mb-6 text-white shadow-md shadow-teal-200"><Bot className="w-8 h-8" /></div>
              <h3 className="text-xl font-extrabold text-teal-950 mb-3">AI Healthcare Assistant</h3>
              <p className="text-teal-800/80 font-medium">Not sure what to buy? Ask our smart AI about symptoms and side effects.</p>
            </div>
            <div className="bg-green-50/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-green-200 text-center flex flex-col items-center hover:-translate-y-1 transition duration-300">
              <div className="bg-green-600 p-4 rounded-2xl mb-6 text-white shadow-md shadow-green-200"><ShieldCheck className="w-8 h-8" /></div>
              <h3 className="text-xl font-extrabold text-green-950 mb-3">Verified Stores</h3>
              <p className="text-green-800/80 font-medium">All medicines come from 100% genuine and verified local medical stores.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && <div className="text-center py-12"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div><p className="mt-4 font-bold text-blue-800">Searching across pharmacies...</p></div>}
        
        {hasSearched && !loading && results.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No medicines found</h2>
            <p className="text-gray-500">Try searching for a different medicine like "Dolo".</p>
          </div>
        )}

        <div className="space-y-8">
          {results.map((item) => (
            <div key={item.medicineInfo._id} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
              
              <div className="flex flex-col md:flex-row bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100 gap-6">
                <img 
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop" 
                  alt="Medicine" 
                  className="w-full md:w-36 h-36 object-cover rounded-2xl shadow-md border-2 border-white"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-extrabold text-blue-950 mb-2">{item.medicineInfo.name}</h2>
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold tracking-wide mb-2 border border-indigo-200">
                        {item.medicineInfo.composition}
                      </span>
                    </div>
                    <div className="text-right bg-white px-5 py-3 rounded-2xl shadow-md border border-gray-100">
                      <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Starting at</span>
                      <span className="block text-3xl font-black text-green-500">₹{item.cheapestPrice}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed"><strong>Uses:</strong> {item.medicineInfo.uses}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Available Pharmacies</h3>
                <div className="grid gap-4">
                  {/* 🚀 Har store ke liye StoreRow render hoga jisme Quantity Selector hai */}
                  {item.stores.map((store, index) => (
                    <StoreRow 
                      key={store.inventoryId}
                      store={store} 
                      item={item} 
                      isCheapest={index === 0} 
                      onAdd={handleAddToCart} 
                    />
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;