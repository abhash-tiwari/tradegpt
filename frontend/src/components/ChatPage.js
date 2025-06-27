import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatPage.css';

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedAssistant, setDisplayedAssistant] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, displayedAssistant]);

  // Typewriter effect for assistant messages
  useEffect(() => {
    // Find the last assistant message
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;
    let i = 0;
    setDisplayedAssistant('');
    const interval = setInterval(() => {
      i++;
      setDisplayedAssistant(lastMsg.content.slice(0, i));
      if (i >= lastMsg.content.length) {
        clearInterval(interval);
      }
    }, 15); // Adjust speed here (ms per character)
    return () => clearInterval(interval);
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://tradegpt-vuqc.onrender.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage, history: messages }),
      });

      const data = await response.json();
      
      console.log('Response details:', {
        source: data.source,
        confidence: data.confidence,
        matchedQuestion: data.matchedQuestion
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1 className="chat-title">TradeGPT</h1>
        <button
          onClick={() => navigate('/')}
          className="back-button"
        >
          Back to Home
        </button>
      </header>

      <div className="messages-container">
        {messages.map((message, index) => {
          // If this is the last assistant message, animate it
          if (
            message.role === 'assistant' &&
            index === messages.length - 1
          ) {
            return (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  <ReactMarkdown>{displayedAssistant}</ReactMarkdown>
                </div>
              </div>
            );
          }
          // Otherwise, render normally
          return (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                {message.role === 'assistant' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about trading..."
            className="message-input"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="send-button"
          >
            <svg
              className="send-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage; 