function initThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    function themeToggleLabel(isDark) {
        const bag = window.__SIMULATOR_UI_I18N__?.buttons || window.__PENDUL_SIMPLU_I18N?.buttons;
        if (bag?.themeLight && bag?.themeDark) {
            return isDark ? bag.themeLight : bag.themeDark;
        }
        return isDark ? "☀️ Schimbă tema" : "🌙 Schimbă tema";
    }

    if (!themeToggle) return;

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        themeToggle.textContent = themeToggleLabel(true);
    }

    themeToggle.addEventListener("click", function () {
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            themeToggle.textContent = themeToggleLabel(true);
            localStorage.setItem("theme", "dark");
        } else {
            themeToggle.textContent = themeToggleLabel(false);
            localStorage.setItem("theme", "light");
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
} else {
    initThemeToggle();
}
