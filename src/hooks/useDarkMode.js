import { useEffect, useState } from 'react';

const useDarkMode = () => {
    const getValue = value =>
        getComputedStyle(document.documentElement).getPropertyValue(value).trim();

    const getIsDarkMode = () =>
        getValue('--primary-background-current-mode') === getValue('--primary-background-dark-mode');

    const [darkModeOn, setDarkModeOn] = useState(getIsDarkMode);

    useEffect(() => {
        setDarkModeOn(getIsDarkMode());

        const observer = new MutationObserver(() => {
            setDarkModeOn(getIsDarkMode());
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

        return () => observer.disconnect();
    }, []);

    return darkModeOn;
};

export default useDarkMode;