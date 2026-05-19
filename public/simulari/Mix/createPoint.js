
let isDialogOpen = false;
const popup = document.getElementById('create-point-popup');
const overlay = document.getElementById('overlay');
const showPopupButton = document.getElementById('show-popup-button');
const closePopupButton = document.getElementById('close-popup-btn');
const createPointButton = document.getElementById('create-point-btn');
const omega1Input = document.getElementById('omega1Input');
const omega2Input = document.getElementById('omega2Input');
const amplitudeInputEl = document.getElementById('amplitudineInput');
const unghiulinitial = document.getElementById('unghiulinitialInput');
const letterInput = document.getElementById('letterInput');
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
    letterInput.focus();
    overlay.style.display = 'block';
}
popup.addEventListener("keydown", (event) => {
    const focusableElements = Array.from(popup.querySelectorAll("input"));
    const currentIndex = focusableElements.indexOf(document.activeElement);
    if (event.key === "ArrowRight") {
        // Mergi la următorul câmp
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
        event.preventDefault();
    } else if (event.key === "ArrowLeft") {
        // Mergi la câmpul anterior
        const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        focusableElements[prevIndex].focus();
        event.preventDefault();
    }
    else if (event.key === "Enter") {
        const enterIndex = (currentIndex + 2) % focusableElements.length;
        focusableElements[enterIndex].focus();
        event.preventDefault();
    }
})
const hideDialog = () => {
    isDialogOpen = false;
    console.log('closed popup');
    popup.style.display = 'none';
    overlay.style.display = 'none';
    resetValues();
}

const resetValues = () => {
    letterInput.value = '';
    timeInput.value = '';
    time2Input.value = ''; // Resetăm și t2
    omega1Input.value = '';
    omega2Input.value = '';
    amplitudeInputEl.value = '';
    unghiulinitial.value = '';
    colorInput.value = '';
}
/*
    𝛚1 = 3;
    𝛚2 = 6;
    φ0 = 90;
*/
const createdPoints = []; // Array pentru stocarea punctelor create
const createPoint = () => {
    const letter = letterInput.value;
    const time = parseFloat(timeInput.value); // Asigură-te că e un număr
    const time2 = parseFloat(time2Input.value);
    const omega1 = parseFloat(omega1Input.value);
    const omega2 = parseFloat(omega2Input.value);
    const amplitudeVal = parseFloat(amplitudeInputEl.value);
    const unghiulinitialVal = parseFloat(unghiulinitial.value);
    const color = colorInput.value;
    if (isNaN(time) || isNaN(time2) || isNaN(omega1) || isNaN(omega2) || isNaN(amplitudeVal) || isNaN(unghiulinitialVal)) {
        addLog(window.gsT("logs.enterValidNumbers", "Introdu valori valide în toate câmpurile!"));
        return;
    }
    // Logăm valorile înainte de resetare
    addLog(
        window.gsFmt(
            "logs.enteredData",
            `Date introduse: A = ${amplitudeVal} m, 𝛚1 = ${omega1} rad/s, 𝛚2 = ${omega2} rad/s, t = ${time} s, t2 = ${time2} s, φ0 = ${unghiulinitialVal}°, culoare = ${color}`,
            {
                "{AMP}": String(amplitudeVal),
                "{W1}": String(omega1),
                "{W2}": String(omega2),
                "{T}": String(time),
                "{T2}": String(time2),
                "{PHI}": String(unghiulinitialVal),
                "{CLR}": String(color),
            }
        )
    );
    //const A = 10;
    //const w1 = 3;
    //const w2 = 6;
    //const f0 = 90;
    const t = time;
    const t2 = time2;
    const w1 = omega1;
    const w2 = omega2;
    const f0 = unghiulinitialVal;
    const A = amplitudeVal;
    const x = A * Math.sin(w1 * t);
    const y = A * Math.sin(w2 * t2 + f0);
    gridGroup.append("circle")
        .attr("cx", x * minorSpacing)
        .attr("cy", -y * minorSpacing)
        .attr("r", 4)
        .style("fill", color);

    gridGroup.append("text")
        .attr("x", x * minorSpacing - 10) // Lângă punct pe axa X
        .attr("y", -y * minorSpacing - 10) // Deasupra punctului pe axa Y
        .text(`${letter} (${x.toFixed(2)}, ${y.toFixed(2)})`) // Numele punctului cu coordonate formatate
        .style("font-size", "12px")
        .style("fill", "black");

    // const lastPoint = points[points.length - 1];
    // gridGroup.append("line")
    //     .attr("x1", lastPoint.x * minorSpacing) // Coordonata X a punctului A
    //     .attr("y1", -lastPoint.y * minorSpacing) // Coordonata Y a punctului A
    //     .attr("x2", x * minorSpacing) // Coordonata X a punctului B
    //     .attr("y2", -y * minorSpacing) // Coordonata Y a punctului B
    //     .attr("stroke", color) // Culoarea liniei
    //     .attr("stroke-width", 2); // Grosimea liniei
    addLog(window.gsT("logs.pointCreatedOk", "Punct creat cu succes!"));
    createdPoints.push({ name: letter, x, y }); // Adaugă punctul în array
    hideDialog();
}
// Funcție pentru crearea unei linii între două puncte
const createLine = () => {
    const pointAIndex = parseInt(pointAInput.value, 10);
    const pointBIndex = parseInt(pointBInput.value, 10);
    const lineColor = document.getElementById('lineColorInput').value;


    if (isNaN(pointAIndex) || isNaN(pointBIndex)) {
        addLog(window.gsT("logs.indicesNotNumeric", "Indexurile introduse nu sunt numere valide."));
        return;
    }
    if (pointAIndex === pointBIndex) {
        addLog(window.gsT("logs.sameIndices", "Indexurile introduse sunt identice!"));
        return;
    }
    if (pointAIndex < 0 || pointAIndex >= createdPoints.length || pointBIndex < 0 || pointBIndex >= createdPoints.length) {
        addLog(
            window.gsFmt(
                "logs.indicesOutOfRange",
                "Indexurile sunt în afara limitelor! A: {IA}, B: {IB}",
                { "{IA}": String(pointAIndex), "{IB}": String(pointBIndex) }
            )
        );
        return;
    }

    // Obținem punctele selectate
    const pointA = createdPoints[pointAIndex];
    const pointB = createdPoints[pointBIndex];

    if (!pointA || !pointB) {
        addLog(window.gsT("logs.pointsMissing", "Punctele nu au fost găsite. Verifică array-ul createdPoints."));
        return;
    }

    console.log("Array-ul complet după adăugare:", JSON.stringify(createdPoints, null, 2));
    console.log("Array-ul createdPoints la momentul creării liniei:", JSON.stringify(createdPoints, null, 2));
    console.log("Punctul A selectat:", pointA);
    console.log("Punctul B selectat:", pointB);
    // Creăm linia în SVG
    gridGroup.append("line")
        .attr("x1", pointA.x * minorSpacing)
        .attr("y1", -pointA.y * minorSpacing)
        .attr("x2", pointB.x * minorSpacing)
        .attr("y2", -pointB.y * minorSpacing)
        .attr("stroke", lineColor)
        .attr("stroke-width", 2);

    addLog(
        window.gsFmt(
            "logs.lineCreatedBetween",
            "Linie creată între punctele {NA} și {NB}",
            { "{NA}": String(pointA.name), "{NB}": String(pointB.name) }
        )
    );
    hideDialog(); // Închidem dialogul după crearea liniei
};


showPopupButton.onclick = openDialog;
closePopupButton.onclick = hideDialog;
createPointButton.onclick = createPoint;
createLineButton.onclick = createLine;
