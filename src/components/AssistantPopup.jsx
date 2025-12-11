import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "../scss/components/_assistant-popup.scss";
import Assistant3DViewer from "./Assistant3DViewer";
import { X, Send } from "lucide-react";
import { searchKnowledgeBase } from "../lib/assistant-knowledge-base.js";
import MathJaxRender from "./MathJaxRender.jsx";

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

  // Typeset MathJax for all AI message bubbles
  const typesetAllAIBubbles = () => {
    try {
      if (!chatRef.current) return;
      const bubbles = chatRef.current.querySelectorAll('.assistant-popup-chat-bubble.ai');
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
      const bubbles = chatRef.current.querySelectorAll('.assistant-popup-chat-bubble.ai');
      const last = bubbles[bubbles.length - 1];
      if (!last) return;
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([last]);
      } else if (window.MathJax && window.MathJax.typeset) {
        window.MathJax.typeset([last]);
      }
    } catch (_) {}
  };

  const simulateTyping = (text, callback) => {
    setTyping(true);
    let currentText = "";
    let index = 0;
    let lastTypesetTime = Date.now();
    let lastScrollTime = Date.now();
    const typesetInterval = 300; // Typeset MathJax every 300ms during typing
    const scrollInterval = 100; // Scroll every 100ms during typing
    
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
        
        // Scroll to bottom periodically during typing
        const now = Date.now();
        if (now - lastScrollTime >= scrollInterval && chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
          lastScrollTime = now;
        }
        
        // Typeset MathJax periodically during typing (every 300ms)
        if (now - lastTypesetTime >= typesetInterval) {
          setTimeout(() => {
            typesetLastAIBubble();
          }, 50);
          lastTypesetTime = now;
        }
      } else {
        clearInterval(typeInterval);
        setTyping(false);
        // Final scroll and typeset after typing is complete
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
          typesetLastAIBubble();
          if (callback) callback();
        }, 200);
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
      const response = await fetch("/api/webhook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      
      // Check content type and get response text first
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      console.log("Response status:", response.status);
      console.log("Content-Type:", contentType);
      console.log("Response text length:", responseText.length);
      console.log("Response preview:", responseText.substring(0, 200));
      
      if (!response.ok) {
        // Try to parse error response if it's JSON
        let errorMessage = `Eroare ${response.status}: ${response.statusText}`;
        if (contentType && contentType.includes("application/json") && responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error("Backend error:", errorData);
          } catch (e) {
            console.error("Failed to parse error response:", e);
            errorMessage = responseText || errorMessage;
          }
        } else if (responseText) {
          errorMessage = responseText.substring(0, 200);
        }
        throw new Error(errorMessage);
      }
      
      // Parse JSON response
      let data;
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Serverul a returnat un răspuns gol. Verifică în n8n: 1) Nodul 'Respond to Webhook' este conectat la finalul workflow-ului, 2) Nodul 'Respond to Webhook' trimite datele corecte (verifică parametrul 'Respond With'), 3) Workflow-ul este activat.");
      }
      
      let aiText;
      
      // Try to parse as JSON first
      if (contentType && contentType.includes("application/json")) {
        try {
          data = JSON.parse(responseText);
          
          // If parsed result is a string, use it directly
          if (typeof data === 'string') {
            aiText = data;
          } 
          // If it's an array, extract the first element
          else if (Array.isArray(data)) {
            console.log("Received data structure: Array with", data.length, "items");
            if (data.length > 0) {
              const firstItem = data[0];
              // Try to find message in the first item
              aiText = firstItem.message || firstItem.reply || firstItem.output || firstItem.text || 
                       firstItem.response || firstItem.answer || 
                       (typeof firstItem === 'string' ? firstItem : String(firstItem));
            } else {
              aiText = "(Răspunsul nu a putut fi preluat - array gol)";
            }
          }
          // If it's an object, try to find the message in various fields
          else if (typeof data === 'object' && data !== null) {
            console.log("Received data structure:", data);
            console.log("Available keys:", Object.keys(data));
            
            // Try multiple possible field names that n8n might use
            aiText = data.message || data.reply || data.output || data.text || data.response || data.answer || 
                     (data.json && (data.json.message || data.json.output)) ||
                     "(Răspunsul nu a putut fi preluat)";
            
            if (aiText === "(Răspunsul nu a putut fi preluat)") {
              console.warn("Could not find message in response. Full data:", JSON.stringify(data, null, 2));
            }
          } else {
            aiText = String(data);
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e, "Response:", responseText);
          // If JSON parsing fails but content-type says JSON, try as plain text
          aiText = responseText;
        }
      } else {
        // If not JSON, treat as plain text message
        aiText = responseText;
      }
      
      // Add AI message with empty text first
      setMessages((msgs) => [...msgs, { role: "ai", text: "" }]);
      setLoading(false);
      
      // Simulate typing effect, then typeset MathJax only for the finished AI message
      setTimeout(() => {
        simulateTyping(aiText, () => {
          // Wait a bit for React to render, then typeset MathJax
          setTimeout(() => {
            typesetLastAIBubble();
          }, 200);
        });
      }, 500);
      
    } catch (err) {
      console.error("Chat error:", err);
      const errorText = err.message || "A apărut o eroare la conectarea cu serverul. Încearcă din nou mai târziu.";
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", text: errorText },
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

  useEffect(() => {
    if (chatMode && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    // Typeset MathJax when messages change (but not while typing)
    if (!typing && messages.length > 0) {
      setTimeout(() => {
        typesetAllAIBubbles();
      }, 100);
    }
  }, [messages, chatMode, typing]);

  const [loadingDots, setLoadingDots] = useState("");

  // Animate loading dots
  useEffect(() => {
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

  // Function to preprocess text: convert plain URLs to markdown links if no markdown links exist
  const preprocessTextForMarkdown = (text) => {
    // Check if text already contains markdown links
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    if (markdownLinkRegex.test(text)) {
      // Text already has markdown links, return as-is
      return text;
    }
    
    // No markdown links found, check for plain URLs and convert them
    // Regex to find URLs - capture everything until space or end of text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Replace plain URLs with markdown links
    return text.replace(urlRegex, (url) => {
      // Return as markdown link format: [url](url)
      return `[${url}](${url})`;
    });
  };

  // useEffect(() => {
  //   if (typeof window?.MathJax !== "undefined") {
  //     window.MathJax.typeset()
  //   }
  // });

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
                        <>
                          <ReactMarkdown
                            components={{
                              a: ({node, ...props}) => (
                                <a {...props} className="assistant-link" target="_self" rel="noopener noreferrer" />
                              )
                            }}
                          >
                            {preprocessTextForMarkdown(msg.text)}
                          </ReactMarkdown>
                          {/* Render MathJax even during typing for real-time formatting */}
                          <MathJaxRender />
                        </>
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
        <MathJaxRender />
      </div>
    </div>
  );
};

export default AssistantPopup; 