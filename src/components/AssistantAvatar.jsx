import React, { useState, useRef, useEffect } from "react";
import "../scss/components/_assistant-avatar.scss";
import AssistantPopup from "./AssistantPopup";
import useDarkMode from "../hooks/useDarkMode";
import { setAssistantRef } from "../hooks/useAssistant";

const AssistantAvatar = () => {
  const [open, setOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage or use default
    const saved = localStorage.getItem("assistantAvatarPosition");
    if (saved) {
      try {
        const { x, y } = JSON.parse(saved);
        return { x, y };
      } catch (e) {
        // If parsing fails, use default
      }
    }
    // Default position: right side, vertically centered
    return { x: null, y: null }; // null means use CSS default
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const avatarRef = useRef(null);
  const holdTimerRef = useRef(null);
  const scrollPositionRef = useRef({ top: 0, left: 0 });
    const darkModeOn = useDarkMode();
  const localRef = useRef({
    openWithMessage: (msg) => {
      setInitialMessage(msg);
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      // Clear initialMessage when closing to prevent resending
      setTimeout(() => setInitialMessage(""), 100);
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

  useEffect(() => {
    // Save position to localStorage whenever it changes
    if (position.x !== null && position.y !== null) {
      localStorage.setItem("assistantAvatarPosition", JSON.stringify(position));
    }
  }, [position]);

  useEffect(() => {
    // Keep button within bounds on window resize
    const handleResize = () => {
      if (position.x !== null && position.y !== null) {
        const avatarSize = 75;
        const maxX = window.innerWidth - avatarSize;
        const maxY = window.innerHeight - avatarSize;
        
        setPosition(prev => ({
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY)),
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
    // Clear initialMessage when closing to prevent resending
    setTimeout(() => setInitialMessage(""), 100);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    setIsDragging(true);
    setDragEnabled(false);
    setHasDragged(false);
    const rect = avatarRef.current.getBoundingClientRect();
    // Calculate offset so that button center follows cursor
    // Offset is half the button size so center aligns with cursor
    const offset = {
      x: rect.width / 2,
      y: rect.height / 2,
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
    // Calculate offset so that button center follows touch
    // Offset is half the button size so center aligns with touch
    const offset = {
      x: rect.width / 2,
      y: rect.height / 2,
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
      
      // Calculate position so center of button follows cursor
      const avatarSize = 75;
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport bounds (keeping center within viewport)
      const minX = 0;
      const maxX = window.innerWidth - avatarSize;
      const minY = 0;
      const maxY = window.innerHeight - avatarSize;
      
      // Ensure center stays within bounds
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
      
      setPosition({
        x: newX,
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
      
      // Calculate position so center of button follows touch
      const avatarSize = 75;
      let newX = touch.clientX - dragOffset.x;
      let newY = touch.clientY - dragOffset.y;
      
      // Constrain to viewport bounds (keeping center within viewport)
      const minX = 0;
      const maxX = window.innerWidth - avatarSize;
      const minY = 0;
      const maxY = window.innerHeight - avatarSize;
      
      // Ensure center stays within bounds
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
      
      setPosition({
        x: newX,
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

  const style = position.x !== null && position.y !== null
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: "auto",
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
        title="Deschide asistentul virtual"
      >
        <img src={avatarSrc} alt="Asistent Virtual" />
      </div>
      {open && <AssistantPopup onClose={handleClose} initialMessage={initialMessage} />}
    </>
  );
};

export default AssistantAvatar; 