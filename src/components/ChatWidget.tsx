import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";

interface Message {
  role: "user" | "bot";
  content: string;
}

const SYSTEM_PROMPT = "You are GreenRoute Assistant, the official helper for the Sargodha Electric Bus Service app. You ONLY answer questions about the following topics: GreenRoute app features, how to track a bus, how to use the route filter, how proximity alerts work, the 8 bus routes in Sargodha (Bhera, Bhalwal, Sillanwali, Kot Momin, Mid Ranjha, Shahpur City, 46 Adda, Chhota Sahiwal), bus timings (6AM to 12AM midnight, every 60 minutes), flat fare of Rs. 20 for males and free for women/students/senior citizens/disabled/children, General Bus Stand as the main terminal, and the 33 electric Yutong buses. For short conversational replies like 'okay', 'alright', 'thanks', 'got it', 'cool', respond friendly and briefly — for example 'Happy to help! Feel free to ask anything about GreenRoute 🚌' — do NOT treat these as inappropriate questions. If anyone asks anything not related to GreenRoute or Sargodha buses, respond with exactly: 'I can only help with GreenRoute and Sargodha bus service questions. Please ask me about routes, timings, fares, or how to use the app.' Keep all answers under 3 sentences. Be friendly and helpful.";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm the GreenRoute Assistant 🚌 I can help you with bus routes, timings, fares, and how to use this app. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Visibility logic
  const isHidden = location.pathname.startsWith("/control") || location.pathname.startsWith("/driver");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (customMessage?: string) => {
    const messageContent = customMessage || input.trim();
    if (!messageContent || isLoading) return;

    const now = Date.now();
    if (now - lastSentTime < 2000) return; 

    const userMessage: Message = { role: "user", content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    if (!customMessage) setInput("");
    setIsLoading(true);
    setLastSentTime(now);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDYPnFe8citay2hWTR3uqzbdEed4ICZpsQ";
      const historyForApi = [...messages, userMessage].slice(-6);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            ...historyForApi.map(m => ({
              role: m.role === "bot" ? "model" : "user",
              parts: [{ text: m.content }]
            }))
          ]
        })
      });

      if (response.status === 429) {
        setMessages(prev => [...prev, { role: "bot", content: "Our assistant is taking a short break. Please try again in a few minutes, or check the Routes page for bus information." }]);
      } else if (!response.ok) {
        throw new Error("API Error");
      } else {
        const data = await response.json();
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Something went wrong. Please try again.";
        setMessages(prev => [...prev, { role: "bot", content: botResponse }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isHidden) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed md:absolute inset-0 md:inset-auto md:bottom-[80px] md:right-0 w-full h-full md:w-[320px] md:h-[500px] bg-[#1a1a2e] md:rounded-2xl border-white/10 shadow-2xl flex flex-col overflow-hidden z-[10000]`}
          >
            {/* Header */}
            <div className="p-4 md:p-4 border-b border-white/5 flex items-center justify-between bg-primary shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-base md:text-sm text-white leading-none">GreenRoute Assistant</span>
                  <span className="text-[11px] md:text-[10px] text-white/80 mt-1">Sargodha Bus Service Help</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-4 space-y-6 md:space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-4 md:p-3 rounded-2xl text-base md:text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-black rounded-tr-none shadow-lg shadow-primary/20" 
                      : "bg-white/5 text-white/90 border border-white/5 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {/* Suggested Questions Chips */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                  {[
                    "What are the bus routes?",
                    "What is the fare?",
                    "What time is the first bus?"
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="px-5 py-3 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-sm md:text-[10px] font-bold uppercase tracking-wider text-white/60 hover:border-primary/50 hover:text-primary transition-all text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 md:p-4 border-t border-white/5 bg-white/[0.02] shrink-0 pb-safe">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about routes..."
                  className="flex-1 bg-white/5 border border-primary/30 rounded-xl px-4 py-3 md:py-2.5 text-base md:text-xs text-white focus:outline-none focus:border-primary/60 transition-colors"
                />
                <Button 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !input.trim()} 
                  className="px-6 h-12 md:h-10 text-[10px]"
                >
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-black shadow-2xl flex items-center justify-center hover:shadow-primary/30 transition-all"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
