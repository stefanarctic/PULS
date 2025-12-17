import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "../scss/components/_assistant-popup.scss";
import { 
  X, Send, Plus, Trash2, MessageSquare, Maximize2, Minimize2, 
  Copy, Check, Bot, User, Sparkles, Loader2
} from "lucide-react";
import { searchKnowledgeBase } from "../lib/assistant-knowledge-base.js";
import MathJaxRender from "./MathJaxRender.jsx";
import { useChats } from "../hooks/useChats";

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
  const textareaRef = useRef(null);
  const chatRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Chat management hook
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    loading: chatsLoading,
    createChat,
    updateChat,
    addMessage,
    deleteChat,
    getCurrentChat,
    user
  } = useChats();

  // Funcție pentru a fixa URL-urile Google Profile Images
  const fixGoogleProfileImageUrl = (url) => {
    if (!url || !url.includes('googleusercontent.com')) {
      return url;
    }
    
    let cleanUrl = url.split('?')[0];
    cleanUrl = cleanUrl.replace(/=s\d+-c$/, '');
    cleanUrl = cleanUrl + '=s96-c';
    
    return cleanUrl;
  };

  // Obține poza de profil direct din Firebase Auth user object (fără request la Firestore)
  const userProfilePic = user?.photoURL ? fixGoogleProfileImageUrl(user.photoURL) : null;

  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];

  // Nu creăm chat-uri automat - se creează doar când utilizatorul trimite primul mesaj

  // Setează chatMode bazat pe existența mesajelor
  useEffect(() => {
    if (currentChat && currentChat.messages && currentChat.messages.length > 0) {
      setChatMode(true);
    } else {
      // Afișează welcome screen dacă nu există chat sau nu are mesaje
      setChatMode(false);
    }
  }, [currentChatId, currentChat]);

  // Auto-send initialMessage if provided
  React.useEffect(() => {
    if (initialMessage && currentChatId) {
      setInputValue(initialMessage);
      setTimeout(() => {
        handleSend(null, initialMessage);
      }, 300);
    }
    // eslint-disable-next-line
  }, [currentChatId]);

  // Block body scroll when popup is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Handle fullscreen toggle
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    setInputValue(prompt);
    handleSend(null, prompt);
  };

  const handleClearPrompt = () => {
    setSelectedPrompt("");
    setInputValue("");
  };

  // Copy message to clipboard
  const handleCopyMessage = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Typeset MathJax for all AI message bubbles
  const typesetAllAIBubbles = () => {
    try {
      if (!chatRef.current) return;
      const bubbles = chatRef.current.querySelectorAll('.assistant-message-content');
      if (bubbles.length === 0) return;
      
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise(Array.from(bubbles));
      } else if (window.MathJax && window.MathJax.typeset) {
        window.MathJax.typeset(Array.from(bubbles));
      }
    } catch (_) {}
  };

  // Typeset MathJax only for the most recent AI message bubble
  const typesetLastAIBubble = () => {
    try {
      if (!chatRef.current) return;
      const bubbles = chatRef.current.querySelectorAll('.assistant-message-content');
      const last = bubbles[bubbles.length - 1];
      if (!last) return;
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([last]);
      } else if (window.MathJax && window.MathJax.typeset) {
        window.MathJax.typeset([last]);
      }
    } catch (_) {}
  };

  const [typingText, setTypingText] = useState("");

  const simulateTyping = (text, callback) => {
    setTyping(true);
    let currentText = "";
    let index = 0;
    let lastTypesetTime = Date.now();
    const typesetInterval = 300;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setTypingText(currentText);
        index++;
        
        const now = Date.now();
        
        // Scroll to bottom periodically during typing
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
        
        // Typeset MathJax periodically during typing
        if (now - lastTypesetTime >= typesetInterval) {
          setTimeout(() => {
            typesetLastAIBubble();
          }, 50);
          lastTypesetTime = now;
        }
      } else {
        clearInterval(typeInterval);
        setTyping(false);
        setTypingText("");
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
          typesetLastAIBubble();
          if (callback) callback();
        }, 200);
      }
    }, 7);
  };

  const handleNewChat = async () => {
    try {
      const newChatId = await createChat();
      // createChat deja setează currentChatId, nu trebuie să-l setăm din nou
      setChatMode(false);
      setInputValue("");
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    setTyping(false);
    setTypingText("");
    setLoading(false);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Ești sigur că vrei să ștergi acest chat?')) {
      await deleteChat(chatId);
    }
  };

  const formatChatTitle = (chat) => {
    if (chat.title && chat.title !== `Chat ${new Date(chat.createdAt).toLocaleDateString('ro-RO')}`) {
      return chat.title;
    }
    const firstUserMessage = chat.messages?.find(m => m.role === 'user');
    if (firstUserMessage) {
      const preview = firstUserMessage.text.substring(0, 30);
      return preview.length < firstUserMessage.text.length ? preview + '...' : preview;
    }
    return chat.title || `Chat ${new Date(chat.createdAt).toLocaleDateString('ro-RO')}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `Acum ${diffMins} min`;
    if (diffMins < 1440) return `Acum ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };

  const handleSend = async (e, prompt = null) => {
    if (e) e.preventDefault();
    const text = prompt || inputValue.trim();
    if (!text) return;

    if (!user?.uid) {
      alert('Trebuie să fii logat pentru a folosi AI Assistant. Te rugăm să te conectezi.');
      return;
    }

    let activeChatId = currentChatId;
    const isNewChat = !activeChatId;
    
    // Creează chat-ul nou cu titlul bazat pe primul mesaj
    if (isNewChat) {
      try {
        const newTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
        activeChatId = await createChat(newTitle);
      } catch (error) {
        console.error('Error creating chat:', error);
        alert('Eroare la crearea chat-ului. Te rugăm să încerci din nou.');
        return;
      }
    }

    if (!chatMode) setChatMode(true);
    
    const userMessage = { 
      role: "user", 
      text,
      timestamp: new Date().toISOString()
    };
    await addMessage(activeChatId, userMessage);
    
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/webhook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: activeChatId }),
      });
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Eroare ${response.status}: ${response.statusText}`;
        if (contentType && contentType.includes("application/json") && responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = responseText || errorMessage;
          }
        } else if (responseText) {
          errorMessage = responseText.substring(0, 200);
        }
        throw new Error(errorMessage);
      }
      
      let data;
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Serverul a returnat un răspuns gol.");
      }
      
      let aiText;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = JSON.parse(responseText);
          
          if (typeof data === 'string') {
            aiText = data;
          } else if (Array.isArray(data)) {
            if (data.length > 0) {
              const firstItem = data[0];
              aiText = firstItem.message || firstItem.reply || firstItem.output || firstItem.text || 
                       firstItem.response || firstItem.answer || 
                       (typeof firstItem === 'string' ? firstItem : String(firstItem));
            } else {
              aiText = "(Răspunsul nu a putut fi preluat - array gol)";
            }
          } else if (typeof data === 'object' && data !== null) {
            aiText = data.message || data.reply || data.output || data.text || data.response || data.answer || 
                     (data.json && (data.json.message || data.json.output)) ||
                     "(Răspunsul nu a putut fi preluat)";
          } else {
            aiText = String(data);
          }
        } catch (e) {
          aiText = responseText;
        }
      } else {
        aiText = responseText;
      }
      
      const aiMessage = { 
        role: "ai", 
        text: "",
        timestamp: new Date().toISOString()
      };
      await addMessage(activeChatId, aiMessage);
      setLoading(false);
      
      setTimeout(() => {
        simulateTyping(aiText, async () => {
          try {
            await updateChat(activeChatId, (currentChat) => {
              if (!currentChat || currentChat.id !== activeChatId) {
                return {};
              }
              
              const currentMessages = currentChat.messages || [];
              const updatedMessages = currentMessages.map((msg, idx) => {
                if (idx === currentMessages.length - 1 && msg.role === 'ai') {
                  return { ...msg, text: aiText };
                }
                return msg;
              });
              
              return { messages: updatedMessages };
            });
          } catch (error) {
            console.error('Error updating AI message:', error);
          }
          
          setTimeout(() => {
            typesetLastAIBubble();
          }, 200);
        });
      }, 500);
      
    } catch (err) {
      console.error("Chat error:", err);
      const errorText = err.message || "A apărut o eroare la conectarea cu serverul. Încearcă din nou mai târziu.";
      await addMessage(activeChatId, { 
        role: "ai", 
        text: errorText,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const textarea = e.target;
    setInputValue(textarea.value);
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
    const newHeight = Math.min(Math.max(44, scrollHeight), 120);
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

  useEffect(() => {
    if (!typing && messages.length > 0) {
      setTimeout(() => {
        typesetAllAIBubbles();
      }, 100);
    }
  }, [messages, typing]);

  const preprocessTextForMarkdown = (text) => {
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    if (markdownLinkRegex.test(text)) {
      return text;
    }
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `[${url}](${url})`;
    });
  };

  return (
    <div 
      className={`assistant-popup-overlay ${isFullscreen ? 'fullscreen' : ''}`} 
      onClick={(e) => {
        if (window.innerWidth <= 1100 && e.target === e.currentTarget && sidebarOpen) {
          setSidebarOpen(false);
        }
      }}
    >
      <div 
        className={`assistant-popup-modal assistant-popup-modal--wide ${isFullscreen ? 'fullscreen' : ''}`} 
        ref={modalRef}
      >
        {/* Header */}
        <div className="assistant-popup-header">
          <div className="assistant-popup-header-left">
            <div className="assistant-popup-logo">
              <Sparkles size={20} />
              <span>AI Assistant</span>
            </div>
          </div>
          <div className="assistant-popup-header-right">
            <button 
              className="assistant-popup-icon-btn"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Ieșire din fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              className="assistant-popup-icon-btn assistant-popup-close-btn" 
              onClick={onClose}
              title="Închide"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="assistant-popup-body">
          {/* Sidebar */}
          <div className={`assistant-popup-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="assistant-popup-sidebar-header">
              <button 
                className="assistant-popup-new-chat-btn"
                onClick={handleNewChat}
              >
                <Plus size={18} />
                <span>Chat nou</span>
              </button>
              <button 
                className="assistant-popup-sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? "Ascunde sidebar" : "Afișează sidebar"}
              >
                <MessageSquare size={18} />
              </button>
            </div>
            <div className="assistant-popup-chat-list">
              {!user?.uid ? (
                <div className="assistant-popup-empty-state">
                  <MessageSquare size={32} />
                  <p>Trebuie să fii logat</p>
                  <span>Conectează-te pentru a folosi AI Assistant</span>
                </div>
              ) : chatsLoading ? (
                <div className="assistant-popup-loading-state">
                  <Loader2 size={20} className="spinning" />
                  <span>Se încarcă...</span>
                </div>
              ) : chats.length === 0 ? (
                <div className="assistant-popup-empty-state">
                  <MessageSquare size={32} />
                  <p>Nu ai chat-uri</p>
                  <span>Creează unul nou pentru a începe</span>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`assistant-popup-chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                    onClick={() => {
                      handleChatSelect(chat.id);
                      if (window.innerWidth <= 1100) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <MessageSquare size={16} className="assistant-popup-chat-item-icon" />
                    <span className="assistant-popup-chat-item-title">
                      {formatChatTitle(chat)}
                    </span>
                    <button
                      className="assistant-popup-chat-item-delete"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      title="Șterge chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className={`assistant-popup-main-content ${isFullscreen ? 'fullscreen' : ''}`}>
            <button 
              className="assistant-popup-mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Afișează chat-uri"
            >
              <MessageSquare size={18} />
            </button>
            
            <div className="assistant-popup-content">
              {!user?.uid ? (
                <div className="assistant-popup-welcome">
                  <div className="assistant-popup-welcome-header">
                    <div className="assistant-popup-avatar-large">
                      <Bot size={32} />
                    </div>
                    <h2>AI Assistant</h2>
                    <p>Trebuie să fii logat pentru a folosi AI Assistant</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-color-current-mode)', marginTop: '0.5rem' }}>
                      Conectează-te pentru a începe conversația
                    </p>
                  </div>
                </div>
              ) : !chatMode || !currentChatId || messages.length === 0 ? (
                <div className="assistant-popup-welcome">
                  <div className="assistant-popup-welcome-header">
                    <div className="assistant-popup-avatar-large">
                      <Bot size={32} />
                    </div>
                    <h2>Bun venit la AI Assistant</h2>
                    <p>Cu ce te pot ajuta astăzi?</p>
                  </div>
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
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <div className="assistant-popup-input-container">
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
                      <button 
                        type="submit" 
                        className="assistant-popup-send-btn"
                        disabled={!inputValue.trim()}
                        title="Trimite"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="assistant-popup-chat-window" ref={chatRef}>
                    {messages.length === 0 ? (
                      <div className="assistant-popup-empty-chat">
                        <Bot size={48} />
                        <p>Începe conversația</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const displayText = (typing && idx === messages.length - 1 && msg.role === 'ai' && typingText) 
                          ? typingText 
                          : msg.text;
                        const messageId = `${msg.role}-${idx}`;
                        const isCopied = copiedMessageId === messageId;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`assistant-message assistant-message--${msg.role} ${typing && idx === messages.length - 1 && msg.role === 'ai' ? 'typing' : ''}`}
                          >
                            <div className="assistant-message-avatar">
                              {msg.role === 'ai' ? (
                                <Bot size={20} />
                              ) : userProfilePic ? (
                                <img 
                                  src={userProfilePic} 
                                  alt="User avatar" 
                                  className="assistant-message-avatar-img"
                                  {...(userProfilePic.includes('googleusercontent.com') && { 
                                    crossOrigin: 'anonymous', 
                                    referrerPolicy: 'no-referrer' 
                                  })}
                                  onError={(e) => {
                                    // Dacă imaginea nu se încarcă, afișează iconița User
                                    e.target.style.display = 'none';
                                    const userIcon = e.target.parentElement.querySelector('.assistant-message-avatar-fallback');
                                    if (userIcon) {
                                      userIcon.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              {msg.role === 'user' && (
                                <User 
                                  size={20} 
                                  className="assistant-message-avatar-fallback"
                                  style={{ display: userProfilePic ? 'none' : 'flex' }}
                                />
                              )}
                            </div>
                            <div className="assistant-message-content-wrapper">
                              <div className="assistant-message-content">
                                {msg.role === 'ai' ? (
                                  <>
                                    <ReactMarkdown
                                      components={{
                                        a: ({node, ...props}) => (
                                          <a {...props} className="assistant-link" target="_self" rel="noopener noreferrer" />
                                        )
                                      }}
                                    >
                                      {preprocessTextForMarkdown(displayText)}
                                    </ReactMarkdown>
                                    <MathJaxRender />
                                  </>
                                ) : (
                                  <span>{displayText}</span>
                                )}
                              </div>
                              {msg.role === 'ai' && displayText && (
                                <div className="assistant-message-actions">
                                  <button
                                    className="assistant-message-action-btn"
                                    onClick={() => handleCopyMessage(displayText, messageId)}
                                    title="Copiază mesajul"
                                  >
                                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                  </button>
                                </div>
                              )}
                              {msg.timestamp && (
                                <div className="assistant-message-timestamp">
                                  {formatTime(msg.timestamp)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {loading && (
                      <div className="assistant-message assistant-message--ai loading">
                        <div className="assistant-message-avatar">
                          <Bot size={20} />
                        </div>
                        <div className="assistant-message-content-wrapper">
                          <div className="assistant-popup-typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form className="assistant-popup-form" onSubmit={handleSend}>
                    <div className="assistant-popup-input-container">
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
                      <button 
                        type="submit" 
                        className="assistant-popup-send-btn"
                        disabled={!inputValue.trim() || loading}
                        title="Trimite"
                      >
                        {loading ? (
                          <Loader2 size={18} className="spinning" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
        <MathJaxRender />
      </div>
    </div>
  );
};

export default AssistantPopup;