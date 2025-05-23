import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const DarkModeToggle = () => {

    const [darkModeOn, setDarkModeOn] = useState(false);

    // useEffect(() => {
    //     const localStorageDarkMode = localStorage.getItem("darkMode");
    //     if(!localStorageDarkMode)
    //     {
    //         setDarkModeOn(true);
    //         return;
    //     }

    //     setDarkModeOn(localStorageDarkMode === "enabled");
    // }, []);

    // useEffect(() => {
    //     localStorage.setItem("darkMode", darkModeOn ? "enabled" : "disabled");

    //     document.body.style.backgroundColor = darkModeOn ? "#121212" : "#FFFFFF";
    //     document.body.style.color = darkModeOn ? "#E0E0E0" : "#000000";
    //     document.body.style.filter = !darkModeOn ? "invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2)" : "none";

    //     document.querySelectorAll("*").forEach(element => {
    //         const bgColor = window.getComputedStyle(element).backgroundColor;
    //         const textColor = window.getComputedStyle(element).color;

    //         if (!element.matches("img, video, svg, canvas")) {
    //             if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
    //                 element.style.backgroundColor = darkModeOn ? darkenColor(bgColor, 0.7) : "";
    //             }
    //             if (textColor && textColor !== "rgba(0, 0, 0, 0)" && textColor !== "transparent") {
    //                 element.style.color = darkModeOn ? lightenColor(textColor, 0.8) : "";
    //             }
    //         }
    //     });
    // }, [darkModeOn]);

    const toggleDarkMode = () => {
        setDarkModeOn(value => !value);
    }

    // const darkenColor = (color, factor) => {
    //     const [r, g, b] = color.match(/\d+/g).map(Number);
    //     return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
    // }

    // const lightenColor = (color, factor) => {
    //     const [r, g, b] = color.match(/\d+/g).map(Number);
    //     return `rgb(${Math.min(Math.floor(r + (255 - r) * factor), 255)}, ${Math.min(Math.floor(g + (255 - g) * factor), 255)}, ${Math.min(Math.floor(b + (255 - b) * factor), 255)})`;
    // }

    return (
        <div className="toggle-parent" onClick={toggleDarkMode}>
            { darkModeOn ?
                <Sun size={25} color="white" strokeWidth={2.25} className="dark-mode-toggle"></Sun>
                :
                <Moon size={25} color="white" strokeWidth={2.25} className="dark-mode-toggle"></Moon>
            }
        </div>
    );
}

{/* <Sun
    className="dark-mode-toggle"
    onClick={() => {
        const body = document.body;
        body.classList.toggle("dark-mode");
        const isDarkMode = body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDarkMode);
    }}
    style={{
        cursor: "pointer",
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        width: "24px",
        height: "24px",
        color: "#000"
    }}
/>  */}
export default DarkModeToggle;