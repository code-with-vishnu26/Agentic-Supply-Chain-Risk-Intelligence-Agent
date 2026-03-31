import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Supply Chain Intelligence Assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/intelligence/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages.slice(-5) })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the intelligence server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="chat-toggle-btn"
          >
            <MessageSquare size={24} />
            <div className="pulse-ring" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`chat-window glass-card ${isMinimized ? 'minimized' : ''}`}
          >
            <div className="chat-header">
              <div className="chat-header-info">
                <Bot size={18} className="text-accent" />
                <div>
                  <h4>ChainGuard AI</h4>
                  <p>Agent Status: Advanced</p>
                </div>
              </div>
              <div className="chat-header-actions">
                <button onClick={() => setIsMinimized(!isMinimized)}>
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)}><X size={16} /></button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="chat-messages" ref={scrollRef}>
                  {messages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role}`}>
                      <div className="bubble-icon">
                        {m.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                      </div>
                      <div className="bubble-content" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                        {m.role === 'assistant'
                          ? m.content.split('\n').map((line, j) => (
                              <span key={j}>
                                {line.startsWith('  - ') ? (
                                  <span style={{ display: 'block', paddingLeft: '8px', color: 'var(--text-secondary)' }}>• {line.slice(4)}</span>
                                ) : line === '' ? (
                                  <span style={{ display: 'block', height: '6px' }} />
                                ) : (
                                  <span style={{ display: 'block', fontWeight: line.match(/^[A-Z].*:$/) ? 600 : 400, color: line.match(/^[A-Z].*:$/) ? 'var(--accent-cyan)' : 'inherit' }}>{line}</span>
                                )}
                              </span>
                            ))
                          : m.content
                        }
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="chat-bubble assistant">
                      <div className="bubble-icon"><Loader2 size={12} className="spin" /></div>
                      <div className="bubble-content typing">Analyzing...</div>
                    </div>
                  )}
                </div>

                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Ask about risks, suppliers..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    <Send size={18} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
