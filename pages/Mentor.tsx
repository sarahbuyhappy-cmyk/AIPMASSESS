
import React, { useState, useRef, useEffect } from 'react';
import { generateMentorResponse } from '../services/geminiService';
import { Message } from '../types';
import { Send, Bot, User, Loader2, ArrowLeft, MessageSquarePlus, ShieldCheck, Key, AlertTriangle } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Mentor: React.FC = () => {
  const { profile } = useUser();
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: profile 
        ? `Hello ${profile.name}. I'm your AI PM Coach. Given your background in ${profile.industry}, I'll use familiar industry cases to help explain. Feel free to ask me anything!`
        : "Hello. I'm your AI PM Coach. I'm here to help you transition from traditional product management to an AI-driven probabilistic model. You can ask about learning paths, technical concepts like RAG or fine-tuning, or let me simulate an interview.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const hasAutoSentRef = useRef(false);

  const checkKeyStatus = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } else {
      setHasApiKey(!!process.env.API_KEY);
    }
  };

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const parseAIResponse = (rawText: string): { cleanedText: string, suggestions: string[] } => {
    if (rawText === "ERROR_MISSING_KEY") {
      return {
        cleanedText: "### ⚠️ API Key Not Connected\nIt seems you haven't configured your API key yet. To start the conversation, please click the **\"Connect API Key\"** button below. Paste your Gemini API Key in the pop-up window and save it.\n\nYou can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).",
        suggestions: ["Connect API Key"]
      };
    }

    const parts = rawText.split('---FOLLOW_UP---');
    const cleanedText = parts[0].trim();
    let suggestions: string[] = [];
    
    if (parts.length > 1) {
        suggestions = parts[1].split('|').map(s => s.trim()).filter(s => s.length > 0);
    }
    
    return { cleanedText, suggestions };
  };

  useEffect(() => {
    if (profile && messages.length === 1 && messages[0].role === 'model' && !hasAutoSentRef.current) {
         setMessages([{
            role: 'model',
            text: `Hello ${profile.name}. Ready to leverage your experience in ${profile.industry} to start your AI transition? I'll do my best to use industry analogies to lower the learning curve.`,
            timestamp: Date.now()
         }]);
    }
  }, [profile]);

  useEffect(() => {
    if (location.state && location.state.initialQuery && !hasAutoSentRef.current) {
        const query = location.state.initialQuery;
        const skillContext = location.state.skillContext || "";
        hasAutoSentRef.current = true; 
        
        setTimeout(() => {
             const userMsg: Message = { role: 'user', text: query, timestamp: Date.now() };
             setMessages(prev => [...prev, userMsg]);
             setLoading(true);
             
             generateMentorResponse(query, skillContext, profile).then(rawText => {
                 const { cleanedText, suggestions } = parseAIResponse(rawText);
                 setMessages(prev => [...prev, { 
                     role: 'model', 
                     text: cleanedText, 
                     timestamp: Date.now(),
                     suggestedActions: suggestions
                 }]);
                 setLoading(false);
             });
        }, 500);
    }
  }, [location.state, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    
    if (textToSend === "Connect API Key") {
      handleConnectKey();
      return;
    }

    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = messages.slice(-3).map(m => `${m.role}: ${m.text}`).join('\n');

    try {
      const rawText = await generateMentorResponse(userMsg.text, context, profile);
      const { cleanedText, suggestions } = parseAIResponse(rawText);
      
      const botMsg: Message = { 
          role: 'model', 
          text: cleanedText, 
          timestamp: Date.now(),
          suggestedActions: suggestions 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "Sorry, something went wrong. Please ensure you've connected your API key.", 
        timestamp: Date.now(),
        suggestedActions: ["Connect API Key"]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        {location.state?.returnTo && (
            <button 
                onClick={() => navigate(location.state.returnTo)}
                className="self-start flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={16} /> Return to {location.state.returnLabel || 'previous page'}
            </button>
        )}

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-600 to-emerald-500 p-3 rounded-xl shadow-lg shadow-blue-900/20">
                <Bot size={24} className="text-white" />
                </div>
                <div>
                <h1 className="text-2xl font-bold text-white">AI Coach</h1>
                <div className="text-slate-400 text-sm flex items-center gap-2">
                    <span>Powered by Gemini 3 Flash</span>
                    {profile && (
                        <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded text-xs border border-slate-700">
                            Learner: {profile.name}
                        </span>
                    )}
                </div>
                </div>
            </div>
            
            <div className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 border transition-all ${
              hasApiKey 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
            }`}>
              {hasApiKey ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
              {hasApiKey ? 'System Ready' : 'Key Not Connected'}
            </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} max-w-[85%]`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-slate-800 text-slate-100 rounded-tr-sm' 
                    : 'bg-blue-900/20 text-blue-100 border border-blue-800/30 rounded-tl-sm shadow-inner'
                }`}>
                    <MarkdownRenderer content={msg.text} />
                </div>
              </div>
              
              {msg.role === 'model' && msg.suggestedActions && msg.suggestedActions.length > 0 && idx === messages.length - 1 && !loading && (
                  <div className="ml-12 mt-3 flex flex-wrap gap-2 animate-fade-in">
                      {msg.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(action)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 border ${
                              action === "Connect API Key" 
                              ? "bg-amber-600 text-slate-950 border-amber-500 font-bold hover:bg-amber-500" 
                              : "bg-slate-900 border-blue-500/30 hover:border-blue-400 hover:bg-blue-900/20 text-blue-300"
                            }`}
                          >
                              {action === "Connect API Key" ? <Key size={12} /> : <MessageSquarePlus size={12} />} {action}
                          </button>
                      ))}
                  </div>
              )}
            </div>
          ))}
          {loading && (
             <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-blue-900/20 text-blue-100 border border-blue-800/30 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about AI strategy, MLOps, or mock interviews..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentor;
