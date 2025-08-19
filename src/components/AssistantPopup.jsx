import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "../scss/components/_assistant-popup.scss";
import Assistant3DViewer from "./Assistant3DViewer";
import { X, Send } from "lucide-react";
import { searchKnowledgeBase } from "../lib/assistant-knowledge-base.js";

const PROMPTS = [
  "Raportează o problemă",
  "Am găsit un bug",
  "Vreau să dau feedback",
  "Unde găsesc resursele despre pendule?",
  "Nu mă pot conecta",
  "Am o sugestie",
  "Ce probleme de mecanică aveți?",
  "Cum te cheamă?"
];

const AssistantPopup = ({ onClose, initialMessage }) => {
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', text: string}
  const textareaRef = useRef(null);
  const chatRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sessionId] = useState(() => {
    // Generate a simple session ID for the chat session
    return (
      Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
    );
  });

  // Auto-send initialMessage if provided
  React.useEffect(() => {
    if (initialMessage) {
      setInputValue(initialMessage);
      setTimeout(() => {
        // Send the message automatically
        handleSend(null, initialMessage);
      }, 300);
    }
    // eslint-disable-next-line
  }, []);

  // Block body scroll when popup is open
  React.useEffect(() => {
    if (open) {
      // Save current scroll position
      // const scrollY = window.scrollY;
      
      // Add styles to prevent scrolling
      // document.body.style.position = 'fixed';
      // document.body.style.top = `-${scrollY}px`;
      // document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Restore scroll position when popup closes
      // return () => {
      //   document.body.style.position = '';
      //   document.body.style.top = '';
      //   document.body.style.width = '';
      //   document.body.style.overflow = '';
      //   window.scrollTo(0, scrollY);
      // };

      return () => {
        document.body.style.overflow = '';
      }
    }
  }, [open]);

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    setInputValue(prompt);
    handleSend(null, prompt);
  };

  const handleClearPrompt = () => {
    setSelectedPrompt("");
    setInputValue("");
  };

  const simulateTyping = (text, callback) => {
    setTyping(true);
    let currentText = "";
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'ai') {
            lastMessage.text = currentText;
          }
          return newMessages;
        });
        index++;
      } else {
        clearInterval(typeInterval);
        setTyping(false);
        if (callback) callback();
      }
    }, 7); // Speed of typing - much faster now
  };

  const handleSend = async (e, prompt = null) => {
    if (e) e.preventDefault();
    const text = prompt || inputValue.trim();
    if (!text) return;

    if (!chatMode) setChatMode(true);
    setMessages((msgs) => [...msgs, { role: "user", text }]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("https://puls-ai-chatbot.fly.dev/webhook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      // Assume the response message is in data.message, data.reply, or data.output
      const aiText = data.message || data.reply || data.output || "(Răspunsul nu a putut fi preluat)";
      
      // Add AI message with empty text first
      setMessages((msgs) => [...msgs, { role: "ai", text: "" }]);
      setLoading(false);
      
      // Simulate typing effect
      setTimeout(() => {
        simulateTyping(aiText);
      }, 500);
      
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: "A apărut o eroare la conectarea cu serverul. Încearcă din nou mai târziu." },
      ]);
      setLoading(false);
    }
    
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 100);
  };

  const handleInput = (e) => {
    const textarea = e.target;
    setInputValue(textarea.value);
    // Auto-resize logic
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.cssText = window.getComputedStyle(textarea, null).cssText;
    hiddenDiv.style.height = 'auto';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.visibility = 'hidden';
    hiddenDiv.style.whiteSpace = 'pre-wrap';
    hiddenDiv.style.wordWrap = 'break-word';
    hiddenDiv.textContent = textarea.value + '\n';
    document.body.appendChild(hiddenDiv);
    const scrollHeight = hiddenDiv.offsetHeight;
    document.body.removeChild(hiddenDiv);
    const newHeight = Math.min(Math.max(44, scrollHeight), 96);
    if (textarea.style.height !== newHeight + 'px') {
      textarea.style.height = newHeight + 'px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  React.useEffect(() => {
    if (chatMode && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, chatMode]);

  const [loadingDots, setLoadingDots] = useState("");

  // Animate loading dots
  React.useEffect(() => {
    if (loading) {
      const dotsInterval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === "...") return "";
          if (prev === "..") return "...";
          if (prev === ".") return "..";
          return ".";
        });
      }, 275);
      
      return () => clearInterval(dotsInterval);
    } else {
      setLoadingDots("");
    }
  }, [loading]);

  // Function to process text and make URLs clickable while preserving Markdown
  const processTextWithLinks = (text) => {
    // Regex to find URLs - more precise to avoid including trailing punctuation
    const urlRegex = /(https?:\/\/[^\s.,!?;:]+)/g;
    
    // Split text by URLs and process each part
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // This is a URL, make it a link
        return (
          <a 
            key={index}
            href={part} 
            className="assistant-link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      } else {
        // This is regular text, preserve Markdown formatting
        return part;
      }
    });
  };

  return (
    <div className="assistant-popup-overlay">
      <div className="assistant-popup-modal assistant-popup-modal--wide">
        <button className="assistant-popup-close assistant-popup-close--large" onClick={onClose}>&times;</button>
        <div className="assistant-popup-content">
          <div className="assistant-popup-3d assistant-popup-3d--large">
            <Assistant3DViewer />
          </div>
          <div className="assistant-popup-interact">
            {!chatMode && (
              <>
                <div className="assistant-popup-prompts">
                  {PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      className={`assistant-popup-prompt-btn ${selectedPrompt === prompt ? 'selected' : ''}`}
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <form className="assistant-popup-form" onSubmit={handleSend}>
                  {selectedPrompt && (
                    <div className="assistant-popup-selected-prompt">
                      <span>{selectedPrompt}</span>
                      <button
                        type="button"
                        className="assistant-popup-clear-prompt"
                        onClick={handleClearPrompt}
                        title="Șterge prompt"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <div className="assistant-popup-input-row">
                    <textarea
                      ref={textareaRef}
                      className="assistant-popup-input"
                      placeholder="Scrie ceva..."
                      value={inputValue}
                      onChange={handleInput}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      autoFocus
                    />
                    <button type="submit" className="assistant-popup-send-btn" title="Trimite">
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            )}
            {chatMode && (
              <>
                <div className="assistant-popup-chat-window" ref={chatRef}>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`assistant-popup-chat-bubble ${msg.role === 'user' ? 'user' : 'ai'} ${typing && idx === messages.length - 1 && msg.role === 'ai' ? 'typing' : ''}`}>
                      {msg.role === 'ai' ? (
                        <ReactMarkdown
                          components={{
                            a: ({node, ...props}) => (
                              <a {...props} className="assistant-link" target="_blank" rel="noopener noreferrer" />
                            )
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="assistant-popup-chat-bubble ai loading">Profesorul Whiz scrie{loadingDots}</div>
                  )}
                </div>
                <form className="assistant-popup-form" onSubmit={handleSend}>
                  <div className="assistant-popup-input-row">
                    <textarea
                      ref={textareaRef}
                      className="assistant-popup-input"
                      placeholder="Scrie un mesaj..."
                      value={inputValue}
                      onChange={handleInput}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      autoFocus
                    />
                    <button type="submit" className="assistant-popup-send-btn" title="Trimite">
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantPopup; 