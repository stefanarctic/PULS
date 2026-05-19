function addLog(message) {
    const logElement = document.getElementById("log");
    if (logElement) {
        logElement.value += `${message}\n`; // Adaugă mesajul la sfârșitul logului
        logElement.scrollTop = logElement.scrollHeight; // Derulează automat la ultimul mesaj
    } else {
        console.error(window.gsT("logs.logNotFoundErr", "Elementul cu ID-ul 'log' nu a fost găsit!"));
    }
}

async function graficeSimpleAppendIntroLogs() {
    const p = window.__graficeSimpleI18nPromise;
    try {
        if (p && typeof p.then === "function") await p;
    } catch (_) {
        /* ignore */
    }
    const gt = typeof window.gsT === "function" ? window.gsT : (_, f) => f;
    addLog(gt("logs.introCaseTitle", "In cazul acesta avem:"));
    addLog(gt("logs.introEqx", "x = A* sin(𝛚1 * t)           ,unde A = 10m, 𝛚1 = 3"));
    addLog(gt("logs.introEqy", "y = A*sin(𝛚2 * t  + π/2)     ,unde A = 10m, 𝛚2 = 6"));
    addLog(gt("logs.introExample", "La A, t = 3, la B , t = 6, la C, t = 9, la D, t = 12 , iar la O, t = 0"));
}

graficeSimpleAppendIntroLogs();
