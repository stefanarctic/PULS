import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import "../scss/components/_assistant-popup.scss";
import { 
  X, Send, Plus, Trash2, MessageSquare, Maximize2, Minimize2, 
  Copy, Check, Bot, User, Sparkles, Loader2
} from "lucide-react";
import { searchKnowledgeBase } from "../lib/assistant-knowledge-base.js";
import { fetchAssistantReply } from "../lib/assistantChatApi.js";
// MathJaxRender eliminat - fiecare mesaj gestionează propriul rendering prin Intersection Observer
import { useChats } from "../hooks/useChats";
import useDarkMode from "../hooks/useDarkMode";

// Hook pentru Intersection Observer - detectează când mesajul devine vizibil
const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        setHasBeenVisible(true);
      } else {
        setIsIntersecting(false);
      }
    }, {
      rootMargin: '100px', // Începe să formateze cu 100px înainte să devină vizibil
      threshold: 0.1,
      ...options
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { isIntersecting, hasBeenVisible };
};

// Component memoizat pentru mesaje cu lazy loading MathJax
const MessageBubble = React.memo(({ 
  msg, 
  idx, 
  isLastAIMessage, 
  typingText, 
  typing, 
  userProfilePic,
  professorWhizAvatar,
  onCopyMessage,
  copiedMessageId,
  formatTime
}) => {
  const messageRef = useRef(null);
  const { hasBeenVisible } = useIntersectionObserver(messageRef, {
    rootMargin: '150px' // Formatare anticipată cu 150px
  });
  
  const displayText = (isLastAIMessage && typingText) ? typingText : msg.text;
  const messageId = `${msg.role}-${idx}`;
  const isCopied = copiedMessageId === messageId;
  
  const preprocessTextForMarkdown = useCallback((text) => {
    if (!text) return text;
    
    // First, protect markdown links from being processed as math formulas
    const markdownLinks = [];
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    let protectedText = text;
    let linkIndex = 0;
    
    // Replace markdown links with placeholders
    while ((linkMatch = markdownLinkRegex.exec(text)) !== null) {
      const placeholder = `__MARKDOWN_LINK_${linkIndex}__`;
      markdownLinks.push(linkMatch[0]);
      protectedText = protectedText.replace(linkMatch[0], placeholder);
      linkIndex++;
    }
    
    // Convert LaTeX formulas wrapped in square brackets [ ... ] to MathJax inline format \( ... \)
    // Pattern: [ ... ] where content contains LaTeX commands (backslash, math symbols, etc.)
    // Match non-greedy to avoid issues with multiple formulas on same line
    protectedText = protectedText.replace(/\[([^\]]+)\]/g, (match, content) => {
      // Skip if it looks like a markdown link placeholder
      if (content.startsWith('__MARKDOWN_LINK_')) {
        return match;
      }
      
      // Trim whitespace from content
      const trimmedContent = content.trim();
      
      // Check if content looks like LaTeX (contains backslash commands, math symbols, or common LaTeX patterns)
      // More specific patterns to avoid false positives
      const hasLatex = /\\[a-zA-Z]{2,}|\\[^a-zA-Z\s]|\\mathrm\{|\\frac\{|\\cdot|\\sin|\\cos|\\tan|\\sqrt|\\sum|\\int|\\alpha|\\beta|\\gamma|\\delta|\\theta|\\pi|\\mu|\\Delta|[\^_\{\}]/.test(trimmedContent);
      
      // Also check for common math patterns like =, +, -, *, / with variables
      const hasMathOperators = /[A-Za-z]\s*[=+\-*/]\s*[A-Za-z0-9]/.test(trimmedContent);
      
      if (hasLatex || (hasMathOperators && trimmedContent.length > 3)) {
        // Convert to MathJax inline format
        return `\\(${trimmedContent}\\)`;
      }
      
      return match;
    });
    
    // Restore markdown links
    markdownLinks.forEach((link, index) => {
      protectedText = protectedText.replace(`__MARKDOWN_LINK_${index}__`, link);
    });
    
    // Handle URLs (convert to markdown links if not already)
    // Nu procesăm URL-uri care sunt deja în format markdown [text](url)
    // Dacă textul conține deja link-uri markdown, nu procesăm URL-urile simple
    const hasMarkdownLinks = /\[([^\]]+)\]\(([^)]+)\)/.test(protectedText);
    
    if (!hasMarkdownLinks) {
      // Doar dacă nu există link-uri markdown, procesăm URL-urile simple
      const urlRegex = /(https?:\/\/[^\s<>"'.!?;:)\]}]+)/g;
      protectedText = protectedText.replace(urlRegex, (url) => {
        return `[${url}](${url})`;
      });
    }
    
    return protectedText;
  }, []);

  // Typeset MathJax doar când mesajul devine vizibil sau este ultimul mesaj AI (care trebuie formatat imediat)
  useEffect(() => {
    if (msg.role === 'ai' && (hasBeenVisible || isLastAIMessage)) {
      // Delay mic pentru a permite render-ul complet
      const timeoutId = setTimeout(() => {
        if (messageRef.current) {
          const contentElement = messageRef.current.querySelector('.assistant-message-content');
          if (contentElement && window.MathJax) {
            if (window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise([contentElement]).catch(() => {});
            } else if (window.MathJax.typeset) {
              window.MathJax.typeset([contentElement]);
            }
          }
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasBeenVisible, isLastAIMessage, msg.role, displayText]);
  
  return (
    <div 
      ref={messageRef}
      className={`assistant-message assistant-message--${msg.role} ${typing && isLastAIMessage ? 'typing' : ''}`}
    >
      <div className="assistant-message-avatar">
        {msg.role === 'ai' ? (
          <img 
            src={professorWhizAvatar || "/Modele Asistent/professor-whiz-alb.png"} 
            alt="Profesorul Whiz" 
            className="assistant-message-avatar-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
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
            <ReactMarkdown
              components={{
                a: ({node, ...props}) => (
                  <a {...props} className="assistant-link" target="_self" rel="noopener noreferrer" />
                )
              }}
            >
              {preprocessTextForMarkdown(displayText)}
            </ReactMarkdown>
          ) : (
            <span>{displayText}</span>
          )}
        </div>
        {msg.role === 'ai' && displayText && (
          <div className="assistant-message-actions">
            <button
              className="assistant-message-action-btn"
              onClick={() => onCopyMessage(displayText, messageId)}
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
}, (prevProps, nextProps) => {
  // Comparare custom pentru a evita re-render-uri inutile
  return (
    prevProps.msg.text === nextProps.msg.text &&
    prevProps.msg.role === nextProps.msg.role &&
    prevProps.msg.timestamp === nextProps.msg.timestamp &&
    prevProps.idx === nextProps.idx &&
    prevProps.isLastAIMessage === nextProps.isLastAIMessage &&
    prevProps.typingText === nextProps.typingText &&
    prevProps.typing === nextProps.typing &&
    prevProps.userProfilePic === nextProps.userProfilePic &&
    prevProps.professorWhizAvatar === nextProps.professorWhizAvatar &&
    prevProps.copiedMessageId === nextProps.copiedMessageId
  );
});

MessageBubble.displayName = 'MessageBubble';

const PROMPTS = [
  "Explică-mi concepte de mecanică",
  "Cum rezolv probleme de fizică?",
  "Unde găsesc resurse despre oscilații?",
  "Ajută-mă cu probleme de termodinamică",
  "Ce formule trebuie să știu pentru BAC?",
  "Explică-mi legile lui Newton",
  "Cum funcționează energia mecanică?",
  "Ce resurse recomanzi pentru pregătire?"
];

const AssistantPopup = ({ onClose, initialMessage, initialMessageInNewChat = false }) => {
  const [inputValue, setInputValue] = useState("");
  const [chatMode, setChatMode] = useState(false);
  const textareaRef = useRef(null);
  const chatRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const hasScrolledOnOpenRef = useRef(false);
  const shouldAutoScrollRef = useRef(true); // false când user-ul face scroll manual în sus
  const darkModeOn = useDarkMode();
  
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

  // Verifică și setează chat-ul corect la deschiderea popup-ului
  useEffect(() => {
    // Așteaptă până când chats sunt încărcate și utilizatorul este logat
    if (!user?.uid || chatsLoading) return;
    
    // Nu aplică logica dacă există un initialMessage (se va gestiona în alt useEffect)
    if (initialMessage) return;

    const STORAGE_KEY = 'assistantPopupLastOpen';
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 ore în milisecunde

    // Obține timestamp-ul ultimei deschideri
    const lastOpenTimestamp = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    // Salvează timestamp-ul deschiderii curente
    localStorage.setItem(STORAGE_KEY, now.toString());

    // Verifică dacă au trecut mai mult de 2 ore sau dacă nu există timestamp
    const shouldOpenNewChat = !lastOpenTimestamp || (now - parseInt(lastOpenTimestamp)) > TWO_HOURS_MS;

    if (shouldOpenNewChat) {
      // Deschide new chat (resetează currentChatId)
      console.log('🆕 More than 2 hours passed or first time opening - opening new chat');
      setCurrentChatId(null);
      setChatMode(false);
      setInputValue("");
    } else {
      // Deschide ultimul chat (cel mai recent - primul din listă)
      if (chats.length > 0) {
        const lastChatId = chats[0].id; // Primul chat este cel mai recent (sortat desc)
        console.log('📱 Less than 2 hours passed - opening last chat:', lastChatId);
        setCurrentChatId(lastChatId);
      } else {
        // Nu există chat-uri, deschide new chat
        console.log('🆕 No chats available - opening new chat');
        setCurrentChatId(null);
        setChatMode(false);
        setInputValue("");
      }
    }

    // Pe mobil, închide sidebar-ul automat
    if (window.innerWidth <= 1100) {
      setSidebarOpen(false);
    }
  }, [user?.uid, chatsLoading, chats, setCurrentChatId, initialMessage]);
  
  // Professor Whiz avatar image based on dark mode
  const professorWhizAvatar = darkModeOn 
    ? "/Modele Asistent/professor-whiz-negru.png"
    : "/Modele Asistent/professor-whiz-alb.png";

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

  // Funcție helper pentru a extrage informații despre problemă din mesaj
  // Mutată aici pentru a fi disponibilă înainte de useEffect-urile care o folosesc
  const extractProblemInfo = useCallback((text) => {
    if (!text) return null;
    
    // Caută pattern-ul "PROBLEMA #X: titlu" - poate fi pe orice linie
    // Pattern îmbunătățit pentru a găsi "PROBLEMA #" urmat de număr și titlu
    const problemPattern = /PROBLEMA\s*#\s*(\d+)\s*:\s*(.+?)(?:\n|$)/i;
    const match = text.match(problemPattern);
    
    if (match) {
      const problemNumber = match[1];
      let problemTitle = match[2].trim();
      // Elimină eventuale caractere suplimentare de la sfârșitul titlului
      problemTitle = problemTitle.split('\n')[0].trim();
      // Elimină spații multiple
      problemTitle = problemTitle.replace(/\s+/g, ' ');
      
      console.log('✅ Problem info extracted:', { number: problemNumber, title: problemTitle });
      return {
        number: problemNumber,
        title: problemTitle
      };
    }
    
    console.log('❌ No problem pattern found in text:', text.substring(0, 200));
    return null;
  }, []);

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
  const initialMessageSentRef = useRef(false);
  React.useEffect(() => {
    // Reset flag when initialMessage changes
    if (initialMessage) {
      initialMessageSentRef.current = false;
    } else {
      // If initialMessage is cleared, reset the flag
      initialMessageSentRef.current = false;
    }
  }, [initialMessage]);

  React.useEffect(() => {
    // Only send if we have an initialMessage, haven't sent it yet, user is logged in, and chats are loaded
    if (initialMessage && !initialMessageSentRef.current && user?.uid && !chatsLoading) {
      setInputValue(initialMessage);
      
      // Problemă sau deschidere din căutare (/asistent): chat nou, nu continuă conversația anterioară
      const problemInfo = extractProblemInfo(initialMessage);
      if (problemInfo || initialMessageInNewChat) {
        setCurrentChatId(null);
      }

      // Use a delay to ensure popup is fully mounted and hooks are ready
      const timeoutId = setTimeout(() => {
        // Double-check that we still have the message and user is logged in before sending
        if (initialMessage && user?.uid) {
          const problemInfoCheck = extractProblemInfo(initialMessage);
          if (problemInfoCheck || initialMessageInNewChat) {
            setCurrentChatId(null);
          }
          initialMessageSentRef.current = true;
          handleSend(null, initialMessage, {
            forceNewChat: Boolean(problemInfoCheck) || initialMessageInNewChat,
          });
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, user?.uid, chatsLoading, extractProblemInfo, initialMessageInNewChat]);

  // Block body scroll when popup is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    }
  }, []);

  // Handle Escape key to close popup
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Detectează scroll manual - oprește auto-scroll când user-ul dă scroll în sus (ca ChatGPT)
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const SCROLL_THRESHOLD = 5; // foarte mic - orice scroll în sus = disable
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceFromBottom > SCROLL_THRESHOLD) {
        shouldAutoScrollRef.current = false; // User a dat scroll în sus
      } else {
        shouldAutoScrollRef.current = true; // User s-a întors la bottom - reia auto-scroll
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll continuu când apare conținut nou (mesaje, typing) - până când user-ul dă scroll manual
  useEffect(() => {
    if (shouldAutoScrollRef.current && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typingText, typing, loading]);

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
    // Trimite direct mesajul fără să afișeze tag-ul de selecție
    handleSend(null, prompt);
  };

  // Copy message to clipboard - memoizat pentru performanță
  const handleCopyMessage = useCallback(async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Typeset MathJax only for the most recent AI message bubble - folosit doar în timpul typing
  const typesetLastAIBubble = () => {
    try {
      if (!chatRef.current) return;
      const bubbles = chatRef.current.querySelectorAll('.assistant-message-content');
      const last = bubbles[bubbles.length - 1];
      if (!last) return;
      
      // Folosim requestAnimationFrame pentru a evita blocking
      requestAnimationFrame(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([last]).catch(() => {});
        } else if (window.MathJax && window.MathJax.typeset) {
          window.MathJax.typeset([last]);
        }
      });
    } catch (_) {}
  };

  const simulateTyping = (text, callback) => {
    setTyping(true);
    let currentText = "";
    let index = 0;
    let lastTypesetTime = Date.now();
    const typesetInterval = 200; // Redus pentru a formata MathJax mai des
    let animationFrameId = null;
    let lastUpdateTime = Date.now();
    const minInterval = 15; // Viteză similară ChatGPT - foarte rapid
    
    const typeStep = () => {
      const now = Date.now();
      if (index < text.length && now - lastUpdateTime >= minInterval) {
        // Adaugă multe caractere odată pentru viteză ChatGPT-like
        // ChatGPT adaugă rapid mai multe caractere simultan
        const chunkSize = text.length > 1000 ? 15 : text.length > 500 ? 10 : text.length > 200 ? 6 : 3;
        const endIndex = Math.min(index + chunkSize, text.length);
        currentText = text.substring(0, endIndex);
        setTypingText(currentText);
        index = endIndex;
        lastUpdateTime = now;
        
        // Typeset MathJax periodic, dar mai rar
        if (now - lastTypesetTime >= typesetInterval) {
          // Folosim requestAnimationFrame pentru a evita blocking
          requestAnimationFrame(() => {
            typesetLastAIBubble();
          });
          lastTypesetTime = now;
        }
        
        animationFrameId = requestAnimationFrame(typeStep);
      } else if (index >= text.length) {
        // Finalizare
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        setTyping(false);
        setTimeout(() => {
          typesetLastAIBubble();
          if (callback) {
            callback(() => {
              setTimeout(() => {
                setTypingText("");
              }, 100);
            });
          } else {
            setTimeout(() => {
              setTypingText("");
            }, 300);
          }
        }, 200);
      } else {
        animationFrameId = requestAnimationFrame(typeStep);
      }
    };
    
    animationFrameId = requestAnimationFrame(typeStep);
  };

  const handleNewChat = async () => {
    try {
      const newChatId = await createChat();
      // createChat deja setează currentChatId, nu trebuie să-l setăm din nou
      setChatMode(false);
      setInputValue("");
      
      // Pe mobil, închide sidebar-ul când se creează un chat nou
      if (window.innerWidth <= 1100) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    setTyping(false);
    setTypingText("");
    setLoading(false);
    shouldAutoScrollRef.current = true; // Reset la schimbarea chat-ului
    
    // Pe mobil, închide sidebar-ul când se selectează un chat
    if (window.innerWidth <= 1100) {
      setSidebarOpen(false);
    }
    
    // Scroll instant la ultimul mesaj când se selectează un chat (fără delay)
    // Folosim requestAnimationFrame pentru a aștepta render-ul DOM
    requestAnimationFrame(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });
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

  // Memoizat pentru performanță
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `Acum ${diffMins} min`;
    if (diffMins < 1440) return `Acum ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  }, []);

  const handleSend = async (e, prompt = null, sendOptions = {}) => {
    if (e) e.preventDefault();
    const text = prompt || inputValue.trim();
    if (!text) return;

    if (!user?.uid) {
      alert('Trebuie să fii logat pentru a folosi Profesorul Whiz. Te rugăm să te conectezi.');
      return;
    }

    // Verifică dacă mesajul este despre o problemă - dacă da, forțăm crearea unui chat nou
    const problemInfo = extractProblemInfo(text);
    const shouldForceNewChat = problemInfo !== null || sendOptions.forceNewChat === true;
    
    let activeChatId = currentChatId;
    
    // Dacă mesajul este despre o problemă, forțăm crearea unui chat nou chiar dacă există unul activ
    if (shouldForceNewChat) {
      console.log('🔍 Problem detected, forcing new chat creation');
      activeChatId = null;
    }
    
    const isNewChat = !activeChatId;
    
    // Creează chat-ul nou cu titlul bazat pe primul mesaj
    if (isNewChat) {
      try {
        let newTitle;
        
        if (problemInfo) {
          // Creează titlul în formatul "Rezolvarea problemei #X - titlul problemei"
          newTitle = `Rezolvare #${problemInfo.number} - ${problemInfo.title}`;
          // Limitează lungimea titlului dacă este prea lung
          if (newTitle.length > 100) {
            newTitle = newTitle.substring(0, 97) + '...';
          }
          console.log('📝 Creating chat with problem title:', newTitle);
        } else {
          // Titlu normal bazat pe primul mesaj
          newTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
          console.log('📝 Creating chat with default title:', newTitle);
        }
        
        activeChatId = await createChat(newTitle);
        console.log('✅ Chat created with ID:', activeChatId, 'and title:', newTitle);
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
    shouldAutoScrollRef.current = true; // Reia auto-scroll pentru noul răspuns (ca ChatGPT)
    
    // Scroll smooth la finalul chat-ului după trimiterea mesajului
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const aiText = await fetchAssistantReply(text, activeChatId);
      
      const aiMessage = { 
        role: "ai", 
        text: "",
        timestamp: new Date().toISOString()
      };
      await addMessage(activeChatId, aiMessage);
      setLoading(false);
      
      setTimeout(() => {
        simulateTyping(aiText, async (clearTypingText) => {
          // Actualizăm mesajul în Firestore
          // Mesajul rămâne afișat prin typingText până când este complet actualizat
          try {
            // Actualizăm în Firestore
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
            
            // După ce mesajul este actualizat în Firestore și state,
            // șterge typingText pentru a permite afișarea mesajului din state
            if (clearTypingText) {
              // Așteaptă puțin pentru ca state-ul să se actualizeze
              setTimeout(() => {
                clearTypingText();
              }, 100);
            }
          } catch (error) {
            console.error('Error updating AI message:', error);
            // Șterge typingText chiar dacă a apărut o eroare
            if (clearTypingText) {
              setTimeout(() => {
                clearTypingText();
              }, 100);
            }
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

  // Cache pentru hidden div pentru a evita crearea/ștergerea repetată
  const hiddenDivRef = useRef(null);
  
  // Înălțime minimă = o linie (ca ChatGPT - compact până când conținutul depășește)
  const SINGLE_LINE_HEIGHT = 24;
  
  const handleInput = (e) => {
    const textarea = e.target;
    const value = textarea.value;
    setInputValue(value);
    
    // Folosim requestAnimationFrame pentru a evita blocking
    requestAnimationFrame(() => {
      if (!hiddenDivRef.current) {
        hiddenDivRef.current = document.createElement('div');
        hiddenDivRef.current.style.cssText = window.getComputedStyle(textarea, null).cssText;
        hiddenDivRef.current.style.height = 'auto';
        hiddenDivRef.current.style.position = 'absolute';
        hiddenDivRef.current.style.visibility = 'hidden';
        hiddenDivRef.current.style.whiteSpace = 'pre-wrap';
        hiddenDivRef.current.style.wordWrap = 'break-word';
        hiddenDivRef.current.style.top = '-9999px';
        document.body.appendChild(hiddenDivRef.current);
      }
      
      hiddenDivRef.current.textContent = value + '\n';
      const scrollHeight = hiddenDivRef.current.offsetHeight;
      // Crește doar când conținutul depășește o linie (wrap sau newline) - ca ChatGPT
      const newHeight = Math.min(Math.max(SINGLE_LINE_HEIGHT, scrollHeight), 120);
      
      if (textarea.style.height !== newHeight + 'px') {
        textarea.style.height = newHeight + 'px';
      }
    });
  };
  
  // Reset height când inputul e golit (după trimitere) - revine la o linie
  useEffect(() => {
    if (inputValue === '' && textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  }, [inputValue]);

  // Cleanup pentru hidden div
  useEffect(() => {
    return () => {
      if (hiddenDivRef.current && hiddenDivRef.current.parentNode) {
        hiddenDivRef.current.parentNode.removeChild(hiddenDivRef.current);
        hiddenDivRef.current = null;
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Scroll instant la ultimul mesaj când se deschide un chat nou
  // MathJax va formata doar mesajele vizibile prin Intersection Observer
  useEffect(() => {
    if (currentChatId && chatRef.current && messages.length > 0) {
      // Scroll instant la ultimul mesaj (fără animație)
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }
  }, [currentChatId]); // Doar când se schimbă chat-ul, nu la fiecare mesaj

  // Funcție pentru a face scroll la ultimul mesaj
  const scrollToLastMessage = useCallback(() => {
    if (!chatRef.current || messages.length === 0) {
      return false;
    }

    // Găsește ultimul mesaj din chat
    const messageElements = chatRef.current.querySelectorAll('.assistant-message');
    const lastMessage = messageElements[messageElements.length - 1];
    
    if (lastMessage) {
      console.log('Scrolling to last message');
      lastMessage.scrollIntoView({ 
        behavior: 'instant', 
        block: 'end' 
      });
      return true;
    }
    return false;
  }, [messages.length]);

  // Scroll la ultimul mesaj când se deschide popup-ul (după ce mesajele s-au încărcat complet)
  useEffect(() => {
    // Dacă chat-urile s-au încărcat și există mesaje, încearcă scroll
    if (!chatsLoading && messages.length > 0 && !hasScrolledOnOpenRef.current) {
      // Încearcă imediat
      if (scrollToLastMessage()) {
        hasScrolledOnOpenRef.current = true;
      } else {
        // Dacă nu funcționează imediat, încearcă după un delay
        const timeoutId = setTimeout(() => {
          if (scrollToLastMessage()) {
            hasScrolledOnOpenRef.current = true;
          }
        }, 200);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [chatsLoading, messages.length, currentChatId, scrollToLastMessage]);

  // Verificare periodică când popup-ul se deschide pentru a face scroll după ce mesajele se încarcă
  useEffect(() => {
    // Reset ref când componenta se montează (popup-ul se deschide)
    hasScrolledOnOpenRef.current = false;
    
    // Verifică periodic dacă mesajele sunt disponibile și face scroll
    const checkInterval = setInterval(() => {
      if (!chatsLoading && messages.length > 0 && !hasScrolledOnOpenRef.current) {
        if (scrollToLastMessage()) {
          hasScrolledOnOpenRef.current = true;
          clearInterval(checkInterval);
        }
      }
    }, 100);

    // Cleanup când componenta se demontează (popup-ul se închide)
    return () => {
      clearInterval(checkInterval);
      hasScrolledOnOpenRef.current = false;
    };
  }, []); // Rulează doar la mount/unmount

  return (
    <div 
      className={`assistant-popup-overlay ${isFullscreen ? 'fullscreen' : ''}`} 
      onClick={(e) => {
        // Close popup when clicking outside the modal
        if (e.target === e.currentTarget) {
          onClose();
        }
        // On mobile, also handle sidebar toggle
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
              <img 
                src={professorWhizAvatar} 
                alt="Profesorul Whiz" 
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span>Profesorul Whiz</span>
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
                  <span>Conectează-te pentru a folosi Profesorul Whiz</span>
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
                    onClick={() => handleChatSelect(chat.id)}
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
                      <img 
                        src={professorWhizAvatar} 
                        alt="Profesorul Whiz" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    </div>
                    <h2>Profesorul Whiz</h2>
                    <p>Trebuie să fii logat pentru a folosi Profesorul Whiz</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-color-current-mode)', marginTop: '0.5rem' }}>
                      Conectează-te pentru a începe conversația
                    </p>
                  </div>
                </div>
              ) : !chatMode || !currentChatId || messages.length === 0 ? (
                <div className="assistant-popup-welcome">
                  <div className="assistant-popup-welcome-header">
                    <div className="assistant-popup-avatar-large">
                      <img 
                        src={professorWhizAvatar} 
                        alt="Profesorul Whiz" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    </div>
                    <h2>Bun venit la Profesorul Whiz</h2>
                    <p>Cu ce te pot ajuta astăzi?</p>
                  </div>
                  <div className="assistant-popup-prompts">
                    {PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        className="assistant-popup-prompt-btn"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
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
                        <img 
                          src={professorWhizAvatar} 
                          alt="Profesorul Whiz" 
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <p>Începe conversația</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isLastAIMessage = idx === messages.length - 1 && msg.role === 'ai';
                        
                        return (
                          <MessageBubble
                            key={`${msg.role}-${idx}-${msg.timestamp || idx}`}
                            msg={msg}
                            idx={idx}
                            isLastAIMessage={isLastAIMessage}
                            typingText={typingText}
                            typing={typing}
                            userProfilePic={userProfilePic}
                            professorWhizAvatar={professorWhizAvatar}
                            onCopyMessage={handleCopyMessage}
                            copiedMessageId={copiedMessageId}
                            formatTime={formatTime}
                          />
                        );
                      })
                    )}
                    {loading && (
                      <div className="assistant-message assistant-message--ai loading">
                        <div className="assistant-message-avatar">
                          <img 
                            src={professorWhizAvatar} 
                            alt="Profesorul Whiz" 
                            className="assistant-message-avatar-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
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
      </div>
    </div>
  );
};

export default AssistantPopup;