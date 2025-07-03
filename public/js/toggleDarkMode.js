
// Manual Dark Mode with JavaScript

// Function to toggle dark mode styles
function toggleDarkMode() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");

    // Set background and text colors for body
    document.body.style.backgroundColor = isDark ? "#121212" : "#FFFFFF";
    document.body.style.color = isDark ? "#E0E0E0" : "#000000";

    // Adjust all text elements
    document.querySelectorAll("*").forEach(element => {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        const textColor = window.getComputedStyle(element).color;

        if (!element.matches("img, video, svg, canvas")) {
            if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
                element.style.backgroundColor = isDark ? darkenColor(bgColor, 0.7) : "";
            }
            if (textColor && textColor !== "rgba(0, 0, 0, 0)" && textColor !== "transparent") {
                element.style.color = isDark ? lightenColor(textColor, 0.8) : "";
            }
        }
    });
}

// Function to darken color
function darkenColor(color, factor) {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

// Function to lighten color
function lightenColor(color, factor) {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    return `rgb(${Math.min(Math.floor(r + (255 - r) * factor), 255)}, ${Math.min(Math.floor(g + (255 - g) * factor), 255)}, ${Math.min(Math.floor(b + (255 - b) * factor), 255)})`;
}

// Load Dark Mode on Page Load
// document.addEventListener("DOMContentLoaded", () => {
//     const isDark = localStorage.getItem("darkMode") === "enabled";
//     if (isDark) document.body.classList.add("dark-mode");
//     toggleDarkMode();

//     const toggleButton = document.createElement("button");
//     toggleButton.innerText = "Toggle Dark Mode";
//     toggleButton.style.position = "fixed";
//     toggleButton.style.top = "10px";
//     toggleButton.style.right = "10px";
//     toggleButton.onclick = toggleDarkMode;
//     document.body.appendChild(toggleButton);
// });

export { toggleDarkMode, darkenColor, lightenColor };