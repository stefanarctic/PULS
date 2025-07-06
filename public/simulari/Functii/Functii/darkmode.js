let darkmode = false;

const toggleDarkmode = () => {
    darkmode = !darkmode;
    document.body.classList.toggle("darkmode", darkmode);
    // Update CSS variables based on dark mode state
    if (darkmode) {
        document.documentElement.style.setProperty('--primary-color', '#000000');
        document.documentElement.style.setProperty('--secondary-color', '#ffffff');
        document.getElementById('darkmode-button').textContent = '☀️';
    } else {
        document.documentElement.style.setProperty('--primary-color', '#ffffff');
        document.documentElement.style.setProperty('--secondary-color', '#000000');
        document.getElementById('darkmode-button').textContent = '🌙';
    }
};

// Add click event listener to the dark mode button
document.getElementById('darkmode-button').addEventListener('click', toggleDarkmode);

// Initialize dark mode state
toggleDarkmode();