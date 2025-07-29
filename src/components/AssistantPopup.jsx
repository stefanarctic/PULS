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

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    setInputValue(prompt);
    handleSend(null, prompt);
  };

  const handleClearPrompt = () => {
    setSelectedPrompt("");
    setInputValue("");
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
      setMessages((msgs) => [...msgs, { role: "ai", text: aiText }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: "A apărut o eroare la conectarea cu serverul. Încearcă din nou mai târziu." },
      ]);
    }
    setLoading(false);
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
                    <div key={idx} className={`assistant-popup-chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                      {msg.role === 'ai' ? (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="assistant-popup-chat-bubble ai loading">Profesorul Whiz scrie...</div>
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