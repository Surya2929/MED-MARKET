import { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { Send, User, AlertCircle, Globe, Stethoscope } from 'lucide-react';

const ChatbotPage = () => {
  const [language, setLanguage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    if (lang === 'Hindi') {
      setMessages([{ role: 'ai', text: 'Namaste! 🙏 Main Dr. MedMarket hu. Kahiye, aaj aapki tabiyat kaisi lag rahi hai? Mujhe apni takleef bataiye.' }]);
    } else {
      setMessages([{ role: 'ai', text: 'Hello! 🙏 I am Dr. MedMarket. How are you feeling today? Please tell me your symptoms.' }]);
    }
  };

  const handleSend = async (userText) => {
    if (!userText.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await API.post('/chat', { prompt: userText, language: language });
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: language === 'Hindi' ? 'Maaf kijiye, connection me dikkat hai.' : 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!language) {
    return (
      <div className="bg-slate-200 min-h-[90vh] flex items-center justify-center p-6">
        <div className="bg-slate-100 p-10 rounded-3xl shadow-xl border border-slate-300 max-w-md w-full text-center">
          <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Language / Bhasha</h2>
          <p className="text-slate-500 mb-8 font-medium">Please select your preferred language</p>
          
          <div className="flex flex-col gap-4">
            <button onClick={() => handleLanguageSelect('Hindi')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-xl font-bold transition-all shadow-md">
              हिंदी (Hindi)
            </button>
            <button onClick={() => handleLanguageSelect('English')} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-4 rounded-2xl text-xl font-bold transition-all border border-slate-300">
              English
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-300/50 min-h-[90vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-3xl bg-slate-100 rounded-[2rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col h-[85vh]">
        
        {/* 🌟 PREMIUM APP HEADER */}
        <div className="bg-blue-800 px-6 py-4 flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden border-2 border-blue-400">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=150&auto=format&fit=crop" alt="Doctor Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-800 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">Dr. MedMarket <AlertCircle className="w-4 h-4 text-blue-300"/></h1>
              <p className="text-xs text-blue-200 font-medium">Online • Caring Assistant</p>
            </div>
          </div>
          <button onClick={() => setLanguage(null)} className="text-xs bg-blue-900/50 hover:bg-blue-900 px-3 py-2 rounded-xl transition-colors font-bold border border-blue-700">
            Change Lang
          </button>
        </div>

        {/* 🌟 MODERN CHAT BUBBLES AREA */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#E8EDF2] flex flex-col gap-5 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`max-w-[80%] md:max-w-[70%] p-4 text-[15.5px] leading-relaxed shadow-sm relative ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200'
              }`}>
                {msg.text}
                <span className={`block text-[10px] mt-2 text-right opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* 🌟 WHATSAPP STYLE TYPING INDICATOR */}
          {loading && (
            <div className="flex w-full justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-200 shadow-sm flex items-center gap-1.5 w-fit">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 🌟 QUICK SYMPTOM CHIPS */}
        <div className="px-4 py-3 bg-slate-100 border-t border-slate-300 flex gap-2 overflow-x-auto hide-scrollbar">
          {language === 'Hindi' ? (
            <>
              <button onClick={() => handleSend("Mujhe kal raat se tez bukhar hai")} className="shrink-0 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all">🌡️ Bukhar (Fever)</button>
              <button onClick={() => handleSend("Pait me dard hai aur loose motion ho raha hai")} className="shrink-0 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all">🚽 Loose Motion</button>
            </>
          ) : (
            <>
              <button onClick={() => handleSend("I have high fever")} className="shrink-0 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all">🌡️ High Fever</button>
              <button onClick={() => handleSend("I am suffering from loose motions")} className="shrink-0 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all">🚽 Loose Motion</button>
            </>
          )}
        </div>

        {/* 🌟 MODERN INPUT BAR */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="bg-slate-100 border-t border-slate-300 p-4 pb-6 flex gap-3 items-end">
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'Hindi' ? "Apni takleef yahan likhein..." : "Type a message..."} 
            className="flex-1 px-5 py-4 bg-white border border-slate-300 rounded-3xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-md font-medium text-slate-800 resize-none overflow-hidden min-h-[56px] max-h-32"
            rows="1"
            disabled={loading}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg disabled:bg-slate-400 disabled:shadow-none shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatbotPage;