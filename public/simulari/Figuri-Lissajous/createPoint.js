let isDialogOpen = false;
const popup = document.getElementById('create-point-popup');
const overlay = document.getElementById('overlay');
const showPopupButton = document.getElementById('show-popup-button');
const closePopupButton = document.getElementById('close-popup-btn');
const createPointButton = document.getElementById('create-point-btn');
const omega1Input = document.getElementById('omega1Input');
const omega2Input = document.getElementById('omega2Input');
const amplitudineInput = document.getElementById('amplitudineInput');
const unghiulinitialInput = document.getElementById('unghiulinitialInput');
const timeInput = document.getElementById('timeInput');
const time2Input = document.getElementById('time2Input');
const colorInput = document.getElementById('colorInput');
const createLineButton = document.getElementById('create-line-btn');
const pointAInput = document.getElementById('pointAInput');
const pointBInput = document.getElementById('pointBInput');

const openDialog = () => {
    isDialogOpen = true;
    console.log('opened popup');
    popup.style.display = 'flex';
    // Eliminat focus pe letterInput
    amplitudineInput.focus();
    overlay.style.display = 'block';
};

popup.addEventListener("keydown", (event) => {
    const focusableElements = Array.from(popup.querySelectorAll("input"));
    const currentIndex = focusableElements.indexOf(document.activeElement);
    if (event.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
        event.preventDefault();
    } else if (event.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        focusableElements[prevIndex].focus();
        event.preventDefault();
    } else if (event.key === "Enter") {
        const enterIndex = (currentIndex + 2) % focusableElements.length;
        focusableElements[enterIndex].focus();
        event.preventDefault();
    }
});

const hideDialog = () => {
    isDialogOpen = false;
    console.log('closed popup');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    resetValues();
};

const resetValues = () => {
    // Eliminat resetare letterInput
    timeInput.value = '';
    time2Input.value = '';
    omega1Input.value = '';
    omega2Input.value = '';
    amplitudineInput.value = '';
    unghiulinitialInput.value = '';
    colorInput.value = '#ff0000'; // recomand reset la o culoare default
};

const createdPoints = [];

const createPoint = () => {
    // Am eliminat complet citirea literei
    const time = parseFloat(timeInput.value);
    const time2 = parseFloat(time2Input.value);
    const omega1 = parseFloat(omega1Input.value);
    const omega2 = parseFloat(omega2Input.value);
    const amplitudine = parseFloat(amplitudineInput.value);
    const unghiulinitial = parseFloat(unghiulinitialInput.value);
    const color = colorInput.value;

    if (
        isNaN(time) ||
        isNaN(time2) ||
        isNaN(omega1) ||
        isNaN(omega2) ||
        isNaN(amplitudine) ||
        isNaN(unghiulinitial)
    ) {
        addLog("Introdu valori valide în toate câmpurile!");
        return;
    }

    addLog(`Date introduse: A = ${amplitudine} m, 𝛚1 = ${omega1} rad/s, 𝛚2 = ${omega2} rad/s, t ∈ [${time}, ${time2}] s, φ0 = ${unghiulinitial}°, culoare = ${color}`);

    const step = 0.01;
    const w1 = omega1;
    const w2 = omega2;
    const A = amplitudine;
    const f0 = unghiulinitial;

    for (let t = time; t <= time2; t += step) {
        const x = A * Math.sin(w1 * t);
        const y = A * Math.sin(w2 * t + f0);

        gridGroup.append("circle")
            .attr("cx", x * minorSpacing)
            .attr("cy", -y * minorSpacing)
            .attr("r", 2)
            .style("fill", color);

        createdPoints.push({ x, y });
    }

    addLog("Figura Lissajous a fost adăugată cu succes!");
    hideDialog();
};

// ... restul codului pentru createLine rămâne neschimbat

showPopupButton.onclick = openDialog;
closePopupButton.onclick = hideDialog;
createPointButton.onclick = createPoint;
createLineButton.onclick = createLine;
