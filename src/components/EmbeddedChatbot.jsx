import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function EmbeddedChatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your embedded **Supply Chain Intelligence Agent**. \n\nI am configured to provide answers in both **theory** (explanations) and **data form** (metrics & tables). How can I help you today?' }
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
    <div className="embedded-chatbot glass-card" style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', height: '650px', width: '100%', boxShadow: 'var(--shadow-glow-cyan)' }}>
      <div className="chat-header" style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Bot size={24} className="text-accent" />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>ChainGuard Agentic Copilot</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status: Active | Multi-Agent Analysis Ready | Markdown Supported</p>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', background: m.role === 'user' ? 'rgba(56,189,248,0.1)' : 'rgba(0,0,0,0.3)', padding: '16px 24px', borderRadius: '12px', border: m.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(56,189,248,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7, fontSize: '0.85rem', color: m.role === 'assistant' ? 'var(--accent-cyan)' : '#fff' }}>
              {m.role === 'assistant' ? <><Bot size={14} /> Agent Response</> : <><User size={14} /> You</>}
            </div>
            <div className={`raw-markdown-content ${m.role === 'assistant' ? 'markdown-prose' : ''}`} style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              {m.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble assistant" style={{ alignSelf: 'flex-start', background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, color: 'var(--accent-cyan)' }}><Bot size={14} /> Agent Response</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <Loader2 size={16} className="spin" /> Generating multi-agent theory & data analysis...
            </div>
          </div>
        )}
      </div>

      <div className="chat-input" style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="Ask about active disruptions (e.g., 'Typhoon in Shanghai') to see theory + data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '1rem' }}
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          style={{ padding: '0 24px', background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '8px', cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          Send <Send size={16} />
        </button>
      </div>
    </div>
  );
}
