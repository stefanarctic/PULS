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
        if(darkModeOn)
        {
            // Turn on dark mode
            const darkPrimaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--primary-background-dark-mode').trim();
            const darkSecondaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--secondary-background-dark-mode').trim();
            const darkTertiaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--tertiary-background-dark-mode').trim();
            const darkQuaternaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--quaternary-background-dark-mode').trim();
            const darkPrimaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color-dark-mode').trim();
            
            documentStyle.setProperty('--primary-background-current-mode', darkPrimaryBackground);
            documentStyle.setProperty('--secondary-background-current-mode', darkSecondaryBackground);
            documentStyle.setProperty('--tertiary-background-current-mode', darkTertiaryBackground);
            documentStyle.setProperty('--quaternary-background-current-mode', darkQuaternaryBackground);
            documentStyle.setProperty('--primary-color-current-mode', darkPrimaryColor);

            // BONUS
            for(const card of document.getElementsByClassName('feature-card'))
            {
                card.classList.add('dark-mode');
            }

            for(const card of document.getElementsByClassName('problem-card'))
            {
                card.classList.add('dark-mode');
            }

            document.querySelector('.footer').classList.add('dark-mode');
        }
        else
        {
            // Turn on white mode
            const whitePrimaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--primary-background-white-mode').trim();
            const whiteSecondaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--secondary-background-white-mode').trim();
            const whiteTertiaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--tertiary-background-white-mode').trim();
            const whiteQuaternaryBackground = getComputedStyle(document.documentElement).getPropertyValue('--quaternary-background-white-mode').trim();
            const whitePrimaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color-white-mode').trim();
            
            documentStyle.setProperty('--primary-background-current-mode', whitePrimaryBackground);
            documentStyle.setProperty('--secondary-background-current-mode', whiteSecondaryBackground);
            documentStyle.setProperty('--tertiary-background-current-mode', whiteTertiaryBackground);
            documentStyle.setProperty('--quaternary-background-current-mode', whiteQuaternaryBackground);
            documentStyle.setProperty('--primary-color-current-mode', whitePrimaryColor);

            // BONUS
            for(const card of document.getElementsByClassName('feature-card'))
            {
                card.classList.remove('dark-mode');
            }

            for(const card of document.getElementsByClassName('problem-card'))
            {
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
