function addLog(message) {
  const logElement = document.getElementById("log");
  if (logElement) {
    logElement.value += `${message}\n`;
    logElement.scrollTop = logElement.scrollHeight;
  } else {
    console.error("Elementul cu ID-ul 'log' nu a fost găsit!");
  }
}

(function logInitialMessage() {
  const msg =
    typeof window.simLbl === "function"
      ? window.simLbl(
          "logs.noFigureYet",
          "Nicio figur\u0103 Lissajous ad\u0103ugat\u0103 deocamdat\u0103!"
        )
      : "Nicio figur\u0103 Lissajous ad\u0103ugat\u0103 deocamdat\u0103!";
  addLog(msg);
})();
