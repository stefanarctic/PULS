import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../scss/components/_assistant-avatar.scss";
import AssistantPopup from "./AssistantPopup";
import useDarkMode from "../hooks/useDarkMode";
import { setAssistantRef } from "../hooks/useAssistant";
import { useI18n } from "../i18n/LanguageContext";

const AssistantAvatar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canonicalRomanianPathname, localizedPath, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  /** true când mesajul vine din /asistent?q= — forțează chat nou în AssistantPopup */
  const [initialMessageInNewChat, setInitialMessageInNewChat] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const avatarSize = 75;

  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage or use default
    const saved = localStorage.getItem("assistantAvatarPosition");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Support both old format {x, y} and new format {right, y}
        if (parsed.right !== undefined && parsed.y !== undefined) {
          return { right: parsed.right, y: parsed.y };
        }
        if (parsed.x !== undefined && parsed.y !== undefined) {
          // Convert old format: right = windowWidth - x - avatarSize
          const w = typeof window !== "undefined" ? window.innerWidth : 1200;
          return { right: w - parsed.x - avatarSize, y: parsed.y };
        }
      } catch (e) {
        // If parsing fails, use default
      }
    }
    // Default position: right side, vertically centered
    return { right: null, y: null }; // null means use CSS default
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const avatarRef = useRef(null);
  const holdTimerRef = useRef(null);
  const asistentDeepLinkConsumedRef = useRef(false);
  const scrollPositionRef = useRef({ top: 0, left: 0 });
    const darkModeOn = useDarkMode();
  const localRef = useRef({
    openWithMessage: (msg) => {
      setInitialMessageInNewChat(false);
      setInitialMessage(msg);
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      // Clear initialMessage when closing to prevent resending
      setTimeout(() => {
        setInitialMessage("");
        setInitialMessageInNewChat(false);
      }, 100);
    },
  });

  useEffect(() => {
    setAssistantRef(localRef.current);
    
    // Cleanup timer on unmount
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  /** Deschidere din link /asistent?q=… (ex. filă nouă din pagina de căutare). */
  useEffect(() => {
    if (canonicalRomanianPathname !== "/asistent") {
      asistentDeepLinkConsumedRef.current = false;
      return;
    }
    const params = new URLSearchParams(location.search);
    const q = params.get("q")?.trim();
    if (!q) {
      asistentDeepLinkConsumedRef.current = false;
      return;
    }
    if (asistentDeepLinkConsumedRef.current) return;
    asistentDeepLinkConsumedRef.current = true;
    setInitialMessageInNewChat(true);
    setInitialMessage(q);
    setOpen(true);
    navigate(localizedPath("/asistent"), { replace: true });
  }, [location.pathname, location.search, navigate, localizedPath, canonicalRomanianPathname]);

  useEffect(() => {
    // Save position to localStorage whenever it changes
    if (position.right !== null && position.y !== null) {
      localStorage.setItem("assistantAvatarPosition", JSON.stringify(position));
    }
  }, [position]);

  useEffect(() => {
    // On resize: keep distance from right (right stays same), clamp y to viewport
    const handleResize = () => {
      if (position.right !== null && position.y !== null) {
        const minY = -avatarSize;
        const maxY = window.innerHeight;
        setPosition(prev => ({
          right: prev.right, // distanța față de dreapta rămâne constantă
          y: Math.max(minY, Math.min(prev.y, maxY)),
        }));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position]);

  // Functions to disable/enable scroll
  const disableScroll = () => {
    // Get the current page scroll position
    scrollPositionRef.current.top =
      window.pageYOffset ||
      document.documentElement.scrollTop;
    scrollPositionRef.current.left =
      window.pageXOffset ||
      document.documentElement.scrollLeft;

    document.body.style.overflow = 'hidden';
    // if any scroll is attempted, set this to the previous value
    window.onscroll = function () {
      window.scrollTo(scrollPositionRef.current.left, scrollPositionRef.current.top);
    };
  };

  const enableScroll = () => {
    document.body.style.overflow = '';
    window.onscroll = function () { };
  };

  useEffect(() => {
    // Disable scroll when dragging is active
    if (isDragging && dragEnabled) {
      disableScroll();
    } else {
      enableScroll();
    }

    // Cleanup on unmount
    return () => {
      enableScroll();
    };
  }, [isDragging, dragEnabled]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setInitialMessage("");
      setInitialMessageInNewChat(false);
    }, 100);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    setIsDragging(true);
    setDragEnabled(false);
    setHasDragged(false);
    const rect = avatarRef.current.getBoundingClientRect();
    // Calculate offset from top-left corner of avatar to the exact click point
    // This ensures the avatar follows the cursor precisely at the click point
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragOffset(offset);
    setStartPosition({ x: e.clientX, y: e.clientY });
    
    // Enable dragging after holding for 150ms
    holdTimerRef.current = setTimeout(() => {
      setDragEnabled(true);
    }, 150);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragEnabled(false);
    setHasDragged(false);
    const touch = e.touches[0]; 
    const rect = avatarRef.current.getBoundingClientRect();
    // Calculate offset from top-left corner of avatar to the exact touch point
    // This ensures the avatar follows the touch precisely at the touch point
    const offset = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    setDragOffset(offset);
    setStartPosition({ x: touch.clientX, y: touch.clientY });
    
    // Enable dragging after holding for 150ms
    holdTimerRef.current = setTimeout(() => {
      setDragEnabled(true);
    }, 150);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      // Only allow movement if dragging is enabled (after hold delay)
      if (!dragEnabled) return;
      
      // Check if mouse moved significantly (more than 5px) to consider it a drag
      const deltaX = Math.abs(e.clientX - startPosition.x);
      const deltaY = Math.abs(e.clientY - startPosition.y);
      if (deltaX > 5 || deltaY > 5) {
        setHasDragged(true);
      }
      
      // Calculate position: newX = left of avatar, newRight = distance from right
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      let newRight = window.innerWidth - newX - avatarSize;
      
      // Constrain to viewport bounds
      const minRight = -avatarSize;
      const maxRight = window.innerWidth;
      const minY = -avatarSize;
      const maxY = window.innerHeight;
      
      newRight = Math.max(minRight, Math.min(newRight, maxRight));
      newY = Math.max(minY, Math.min(newY, maxY));
      
      setPosition({
        right: newRight,
        y: newY,
      });
    };

    const handleTouchMove = (e) => {
      // Only allow movement if dragging is enabled (after hold delay)
      if (!dragEnabled) return;
      
      // Prevent default scrolling behavior when dragging
      e.preventDefault();
      
      const touch = e.touches[0];
      // Check if touch moved significantly (more than 5px) to consider it a drag
      const deltaX = Math.abs(touch.clientX - startPosition.x);
      const deltaY = Math.abs(touch.clientY - startPosition.y);
      if (deltaX > 5 || deltaY > 5) {
        setHasDragged(true);
      }
      
      // Calculate position: newRight = distance from right
      let newX = touch.clientX - dragOffset.x;
      let newY = touch.clientY - dragOffset.y;
      let newRight = window.innerWidth - newX - avatarSize;
      
      // Constrain to viewport bounds
      const minRight = -avatarSize;
      const maxRight = window.innerWidth;
      const minY = -avatarSize;
      const maxY = window.innerHeight;
      
      newRight = Math.max(minRight, Math.min(newRight, maxRight));
      newY = Math.max(minY, Math.min(newY, maxY));
      
      setPosition({
        right: newRight,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      // Clear the hold timer if it's still running
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setIsDragging(false);
      setDragEnabled(false);
      // Reset hasDragged after a short delay to allow click handler to check it
      setTimeout(() => setHasDragged(false), 100);
    };

    const handleTouchEnd = () => {
      // Clear the hold timer if it's still running
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setIsDragging(false);
      setDragEnabled(false);
      // Reset hasDragged after a short delay to allow click handler to check it
      setTimeout(() => setHasDragged(false), 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragEnabled, dragOffset, startPosition]);

  const handleClick = (e) => {
    // Only open popup if we didn't just drag or if dragging was never enabled
    if (!hasDragged && !dragEnabled && !isDragging) {
      setOpen(true);
    } else {
      // Prevent click if dragging occurred
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const avatarSrc = darkModeOn 
    ? "/Modele Asistent/professor-whiz-negru.png"
    : "/Modele Asistent/professor-whiz-alb.png";

  const style = position.right !== null && position.y !== null
    ? {
        right: `${position.right}px`,
        top: `${position.y}px`,
        left: "auto",
        transform: "none",
      }
    : {};

  return (
    <>
      <div
        ref={avatarRef}
        className={`assistant-avatar ${dragEnabled ? "dragging" : ""}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={style}
        title={t("assistant.openFabTitle", "Deschide asistentul virtual")}
      >
        <img src={avatarSrc} alt={t("assistant.avatarAlt", "Asistent virtual")} />
      </div>
      {open && (
        <AssistantPopup
          onClose={handleClose}
          initialMessage={initialMessage}
          initialMessageInNewChat={initialMessageInNewChat}
        />
      )}
    </>
  );
};

export default AssistantAvatar; 