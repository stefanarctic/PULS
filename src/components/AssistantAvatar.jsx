import React, { useState } from "react";
import "../scss/components/_assistant-avatar.scss";
import AssistantPopup from "./AssistantPopup";
import useDarkMode from "../hooks/useDarkMode";

const AssistantAvatar = () => {
  const [open, setOpen] = useState(false);
  const darkModeOn = useDarkMode();

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
      {open && <AssistantPopup onClose={() => setOpen(false)} />}
    </>
  );
};

export default AssistantAvatar; 