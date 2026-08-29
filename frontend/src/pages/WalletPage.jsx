import { useState, useEffect } from 'react';
import API from '../services/api';
import { Wallet, ArrowUpRight, ArrowDownRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WalletPage = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await API.get('/wallet');
        setWallet(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchWallet();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold">Loading Wallet...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20}/></button>
        <span className="text-sm font-bold text-slate-800">MedMarket Wallet</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Wallet size={18}/>
            <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
          </div>
          <h1 className="text-4xl font-black">₹{wallet.balance}</h1>
          <p className="text-xs opacity-80 mt-2">Use this balance automatically at checkout on your next order.</p>
        </div>

        <h3 className="text-sm font-bold text-slate-700 mb-3">Transaction History</h3>
        {wallet.transactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <Wallet size={40} className="text-slate-300 mx-auto mb-3"/>
            <p className="text-sm text-slate-500 font-medium">No transactions yet. Refunds and wallet usage will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallet.transactions.map((txn) => (
              <div key={txn._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    {txn.type === 'credit' ? <ArrowDownRight size={16} className="text-emerald-600"/> : <ArrowUpRight size={16} className="text-rose-600"/>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{txn.description}</p>
                    <p className="text-[10px] text-slate-400">{new Date(txn.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <span className={`text-sm font-black ${txn.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;