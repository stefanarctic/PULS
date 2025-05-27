import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const DarkModeToggle = () => {

    const [darkModeOn, setDarkModeOn] = useState(false);

    const toggleDarkMode = () => {
        setDarkModeOn(value => !value);
    }

    useEffect(() => {
        const localStorageDarkMode = localStorage.getItem("darkMode");
        console.log(`Dark mode preference from localStorage: ${localStorageDarkMode}`);
        if(!localStorageDarkMode)
        {
            console.log("No dark mode preference found in localStorage, setting to default (disabled).");
            setDarkModeOn(false);
            return;
        }

        console.log(`Setting dark mode based on localStorage: ${localStorageDarkMode}`);
        setDarkModeOn(localStorageDarkMode === "enabled");
    }, []);

    useEffect(() => {
        // Save preference
        localStorage.setItem("darkMode", darkModeOn ? "enabled" : "disabled");
        console.log(`Dark mode preference saved: ${darkModeOn ? "enabled" : "disabled"}`);

        const documentStyle = document.documentElement.style;
        if (darkModeOn) {
            // Turn on dark mode
            const getVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            documentStyle.setProperty('--primary-background-current-mode', getVar('--primary-background-dark-mode'));
            documentStyle.setProperty('--secondary-background-current-mode', getVar('--secondary-background-dark-mode'));
            documentStyle.setProperty('--tertiary-background-current-mode', getVar('--tertiary-background-dark-mode'));
            documentStyle.setProperty('--quaternary-background-current-mode', getVar('--quaternary-background-dark-mode'));
            documentStyle.setProperty('--primary-color-current-mode', getVar('--primary-color-dark-mode'));
            documentStyle.setProperty('--muted-color-current-mode', getVar('--muted-color-dark-mode'));
            documentStyle.setProperty('--border-color-current-mode', getVar('--border-color-dark-mode'));
            documentStyle.setProperty('--card-background-current-mode', getVar('--card-background-dark-mode'));
            documentStyle.setProperty('--input-background-current-mode', getVar('--input-background-dark-mode'));
            documentStyle.setProperty('--pill-background-current-mode', getVar('--pill-background-dark-mode'));
            documentStyle.setProperty('--pill-hover-background-current-mode', getVar('--pill-hover-background-dark-mode'));

            // BONUS
            for (const card of document.getElementsByClassName('feature-card')) {
                card.classList.add('dark-mode');
            }
            for (const card of document.getElementsByClassName('problem-card')) {
                card.classList.add('dark-mode');
            }
            document.querySelector('.footer').classList.add('dark-mode');
        } else {
            // Turn on white mode
            const getVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            documentStyle.setProperty('--primary-background-current-mode', getVar('--primary-background-white-mode'));
            documentStyle.setProperty('--secondary-background-current-mode', getVar('--secondary-background-white-mode'));
            documentStyle.setProperty('--tertiary-background-current-mode', getVar('--tertiary-background-white-mode'));
            documentStyle.setProperty('--quaternary-background-current-mode', getVar('--quaternary-background-white-mode'));
            documentStyle.setProperty('--primary-color-current-mode', getVar('--primary-color-white-mode'));
            documentStyle.setProperty('--muted-color-current-mode', getVar('--muted-color-white-mode'));
            documentStyle.setProperty('--border-color-current-mode', getVar('--border-color-white-mode'));
            documentStyle.setProperty('--card-background-current-mode', getVar('--card-background-white-mode'));
            documentStyle.setProperty('--input-background-current-mode', getVar('--input-background-white-mode'));
            documentStyle.setProperty('--pill-background-current-mode', getVar('--pill-background-white-mode'));
            documentStyle.setProperty('--pill-hover-background-current-mode', getVar('--pill-hover-background-white-mode'));

            // BONUS
            for (const card of document.getElementsByClassName('feature-card')) {
                card.classList.remove('dark-mode');
            }
            for (const card of document.getElementsByClassName('problem-card')) {
                card.classList.remove('dark-mode');
            }
            document.querySelector('.footer').classList.remove('dark-mode');
        }
    }, [darkModeOn]);

    return (
        <div className="toggle-parent" onClick={toggleDarkMode}>
            { darkModeOn ?
                <Sun size={25} strokeWidth={2.25} className="dark-mode-toggle"></Sun>
                :
                <Moon size={25} strokeWidth={2.25} className="dark-mode-toggle"></Moon>
            }
        </div>
    );
}

export default DarkModeToggle;
