import { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { Send, AlertCircle, Stethoscope, ShieldAlert, Activity, Mic, MicOff } from 'lucide-react';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am Dr. MedMarket. Please describe your symptoms.\n(Aap apni bimari Hindi ya Hinglish me bhi bata sakte hain).' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false); 
  const messagesEndRef = useRef(null);

  const [activeTab, setActiveTab] = useState('chat'); 
  const [med1, setMed1] = useState('');
  const [med2, setMed2] = useState('');

  // 🚀 FIX: Smooth Scrolling sirf Chat Container ke andar hoga!
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userText) => {
    if (!userText.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await API.post('/chat', { prompt: userText });
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'System error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionCheck = async (e) => {
    e.preventDefault();
    if (!med1.trim() || !med2.trim()) return;
    const userText = `Check interaction: ${med1} & ${med2}`;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setMed1(''); setMed2('');
    setLoading(true);

    try {
      const { data } = await API.post('/chat/interaction', { med1, med2 });
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Error checking medicines. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice search is not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; 
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => { setInput(event.results[0][0].transcript); setIsRecording(false); };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  return (
    // 🚀 FIX: Screen jump rokhne ke liye fixed height container banaya
    <div className="bg-slate-50 flex items-center justify-center p-4 py-8" style={{ height: "calc(100vh - 64px)" }}>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold flex items-center gap-2">AI Consultation <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span></h1>
              <p className="text-xs text-slate-400">Auto-detects English, Hindi & Hinglish</p>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-slate-50 border-b border-slate-200 shrink-0">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-all ${activeTab === 'chat' ? 'text-slate-900 border-b-2 border-slate-900 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Activity className="w-4 h-4" /> Symptom Check
          </button>
          <button onClick={() => setActiveTab('interaction')} className={`flex-1 py-3 text-sm font-semibold flex justify-center items-center gap-2 transition-all ${activeTab === 'interaction' ? 'text-slate-900 border-b-2 border-slate-900 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            <ShieldAlert className="w-4 h-4" /> Drug Interaction
          </button>
        </div>

        {/* 🚀 CHAT BUBBLES AREA (Strictly scrolling this part ONLY) */}
        <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col gap-6 custom-scrollbar relative">
          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] p-4 text-sm leading-relaxed relative whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-lg rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-lg rounded-tl-none border border-slate-200'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex w-full justify-start">
              <div className="bg-slate-50 p-4 rounded-lg rounded-tl-none border border-slate-200 flex items-center gap-1.5 w-fit">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1 shrink-0" />
        </div>

        {/* INPUT BAR */}
        {activeTab === 'chat' ? (
          <div className="bg-white border-t border-slate-200 p-4 shrink-0">
            <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
              <button onClick={() => handleSend("Mujhe kal raat se tez bukhar hai")} className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded text-xs font-semibold">🌡️ Bukhar (Fever)</button>
              <button onClick={() => handleSend("I have loose motion and stomach ache")} className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded text-xs font-semibold">🚽 Loose Motion</button>
              <button onClick={() => handleSend("Sookhi khansi ho rahi hai")} className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded text-xs font-semibold">🗣️ Dry Cough</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2 items-center">
              <button type="button" onClick={startVoiceRecording} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${isRecording ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} title="Hold to speak">
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type symptoms or say something..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-all text-sm text-slate-800" disabled={loading} />
              <button type="submit" disabled={loading || !input.trim()} className="bg-slate-900 text-white px-5 py-3 rounded-md hover:bg-slate-800 transition-all disabled:bg-slate-300 font-semibold text-sm">Send</button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleInteractionCheck} className="bg-slate-50 border-t border-slate-200 p-5 shrink-0">
            <p className="text-xs text-slate-600 font-bold mb-3">Check interaction between two medicines:</p>
            <div className="flex gap-2">
              <input type="text" required value={med1} onChange={(e) => setMed1(e.target.value)} placeholder="Medicine 1" className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 text-sm" disabled={loading}/>
              <span className="flex items-center font-bold text-slate-400">+</span>
              <input type="text" required value={med2} onChange={(e) => setMed2(e.target.value)} placeholder="Medicine 2" className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 text-sm" disabled={loading}/>
              <button type="submit" disabled={loading || !med1 || !med2} className="bg-slate-900 text-white px-4 py-2.5 rounded-md hover:bg-slate-800 transition-all disabled:bg-slate-300 font-semibold text-sm">Analyze</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;