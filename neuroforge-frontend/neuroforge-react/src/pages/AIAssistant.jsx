import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Terminal, Loader2, Zap, ShieldAlert, Rocket } from 'lucide-react';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your NeuroForge Engineering Copilot. I can analyze sprint velocity, summarize critical defects, or trigger deployment pipelines. How can I help you today?'
    }
  ]);

  const quickPrompts = [
    { icon: ShieldAlert, text: "Summarize all open Critical defects", color: "text-red-400" },
    { icon: Rocket, text: "Check staging deployment status", color: "text-purple-400" },
    { icon: Zap, text: "Generate test cases for Auth API", color: "text-amber-400" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    // eslint-disable-next-line react-hooks/purity
    const newUserMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    // Simulate AI thinking delay
        setTimeout(() => {
          let aiResponse = "I'm sorry, I didn't quite catch that. I am currently optimized to analyze defects, deployments, and test cases. How else can I help?";
          
          const q = query.toLowerCase();

          // Greetings
          if (q.includes('hello') || q.includes('hi ') || q.includes('how are you')) {
            aiResponse = "Hello! I am operating perfectly. How can I assist you with your NeuroForge workspace today?";
          } 
          // Team inquiries
          else if (q.includes('team') || q.includes('member') || q.includes('users')) {
            aiResponse = "I don't have direct access to list all team members in this chat interface right now. Please check the 'Team Management' tab in your sidebar to view the active roster.";
          }
          // The Original Project Commands
          else if (q.includes('defect') || q.includes('critical') || q.includes('bug')) {
            aiResponse = "You currently have 2 Critical defects open. DEF-42 (JWT Token Expiry) is unassigned, and DEF-18 (Database Connection Pool) is In Progress by the backend team.";
          } 
          else if (q.includes('deploy') || q.includes('staging') || q.includes('pipeline')) {
            aiResponse = "The latest deployment to Staging (RUN-88) was successful 45 minutes ago. No anomalies detected in the logs.";
          } 
          else if (q.includes('test') || q.includes('qa')) {
            aiResponse = "I have generated 4 boundary test cases for the Auth API. You can view and execute them in the Test Cases module.";
          }

          const newAiMsg = { id: Date.now() + 1, sender: 'ai', text: aiResponse };
          setMessages(prev => [...prev, newAiMsg]);
          setIsTyping(false);
        }, 1500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 min-h-screen flex flex-col">
      
      <header className="mb-8 border-b border-slate-200 pb-4 flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Sparkles className="text-blue-600" size={28} />
            NeuroForge Copilot
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Your intelligent DevOps and engineering assistant</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold uppercase tracking-wider">
          <Terminal size={14} /> System Online
        </div>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 shadow-sm">
                <Loader2 size={16} className="text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-slate-400">Analyzing workspace...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          
          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickPrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.text)}
                  disabled={isTyping}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 transition-colors disabled:opacity-50"
                >
                  <Icon size={12} className={prompt.color} />
                  {prompt.text}
                </button>
              );
            })}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Ask Copilot to analyze defects, check pipelines, or generate tasks..."
              className="w-full pl-4 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-sm text-slate-800 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}