import React, { useState, useRef, useEffect } from "react";
import "../scss/components/_assistant-avatar.scss";
import AssistantPopup from "./AssistantPopup";
import useDarkMode from "../hooks/useDarkMode";
import { setAssistantRef } from "../hooks/useAssistant";

const AssistantAvatar = () => {
  const [open, setOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const darkModeOn = useDarkMode();
  const localRef = useRef({
    openWithMessage: (msg) => {
      setInitialMessage(msg);
      setOpen(true);
    },
    close: () => setOpen(false),
  });

  useEffect(() => {
    setAssistantRef(localRef.current);
  }, []);

  const avatarSrc = darkModeOn 
    ? "/Modele Asistent/professor-whiz-negru.png"
    : "/Modele Asistent/professor-whiz-alb.png";

  return (
    <>
      <div
        className="assistant-avatar"
        onClick={() => setOpen(true)}
        title="Deschide asistentul virtual"
      >
        <img src={avatarSrc} alt="Asistent Virtual" />
      </div>
      {open && <AssistantPopup onClose={() => setOpen(false)} initialMessage={initialMessage} />}
    </>
  );
};

export default AssistantAvatar; 