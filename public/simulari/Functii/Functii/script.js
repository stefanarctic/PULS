const initialDate = Date.now();

let mouseX = 0, mouseY = 0;

document.onmousemove = (e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

let func = "sin(x)";
let derivativeFunc = ""; // New variable for derivative function

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan, tg = tan;
const cot = x => 1 / Math.tan(x), ctg = cot;
const asin = Math.asin, arcsin = asin;
const acos = Math.acos, arccos = acos;
const atan = Math.atan, arctg = atan;
const arcctg = x => Math.PI / 2 - atan(x), acot = arcctg;
const PI = Math.PI, pi = PI;
const e = Math.E, exp = e;

const ln = x => x > 0 ? Math.log(x) : NaN;  // Natural logarithm with check for positive numbers
const lg = x => x > 0 ? Math.log10(x) : NaN;  // Base 10 logarithm with check for positive numbers

// Add root functions
const sqrt = x => x >= 0 ? Math.sqrt(x) : NaN;  // Square root
const cbrt = x => Math.cbrt(x);  // Cube root
const root = (n, x) => {  // nth root
    if (n <= 0 || !Number.isInteger(n)) return NaN;
    if (n === 1) return x;
    if (n === 2) return sqrt(x);
    if (n === 3) return cbrt(x);
    // For odd roots, allow negative numbers
    if (n % 2 === 1) {
        return Math.sign(x) * Math.pow(Math.abs(x), 1 / n);
    }
    // For even roots, only allow non-negative numbers
    return x >= 0 ? Math.pow(x, 1 / n) : NaN;
};

const preprocessFactorial = expr => {
    // Înlocuiește orice secvență de forma (expresie)! sau variabilă/număr! cu fact(expresie)
    // Exemplu: x! => fact(x), (x+1)! => fact(x+1), 5! => fact(5)
    return expr.replace(/(\([^()]+\)|[a-zA-Z0-9_.]+)!/g, (match, p1) => `fact(${p1})`);
};

const preprocessPower = expr => {
    // Replace ^ with ** for exponentiation
    return expr.replace(/\^/g, '**');
};

// Symbolic derivatives for common functions
const symbolicDerivatives = {
    'sin(x)': 'cos(x)',
    'cos(x)': '-sin(x)',
    'tan(x)': '1/(cos(x)^2)',
    'tg(x)': '1/(cos(x)^2)',
    'cot(x)': '-1/(sin(x)^2)',
    'ctg(x)': '-1/(sin(x)^2)',
    'ln(x)': '1/x',
    'lg(x)': '1/(x*ln(10))',
    'sqrt(x)': '1/(2*sqrt(x))',
    'cbrt(x)': '1/(3*cbrt(x^2))',
    'arcsin(x)': '1/sqrt(1-x^2)',
    'asin(x)': '1/sqrt(1-x^2)',
    'arccos(x)': '-1/sqrt(1-x^2)',
    'acos(x)': '-1/sqrt(1-x^2)',
    'arctan(x)': '1/(1+x^2)',
    'atan(x)': '1/(1+x^2)',
    'arctg(x)': '1/(1+x^2)',
    'arcctg(x)': '-1/(1+x^2)',
    'acot(x)': '-1/(1+x^2)',
    'e^x': 'e^x',
    'exp(x)': 'e^x'
};

const getSymbolicDerivative = (expr) => {
    expr = expr.trim();

    // 1. Direct lookup for simple functions
    if (symbolicDerivatives[expr]) {
        return symbolicDerivatives[expr];
    }

    // 2. Handle constants (numbers, e, pi)
    if ((!isNaN(parseFloat(expr)) && isFinite(expr)) || expr === 'e' || expr === 'pi') {
        return '0';
    }

    // 3. Handle powers of x (e.g., x, x^5, x*x*x)
    if (expr === 'x') {
        return '1';
    }
    // multiplication based: x*x*x
    if (/^(x\s*\*?\s*)+x$/.test(expr) && !expr.includes('^') && !expr.includes('**')) {
        const n = expr.split('*').length;
        if (n > 1) {
            return `${n}*x^${n - 1}`;
        }
    }
    // caret based: x^n
    let match = expr.match(/^x\s*\^\s*([-\+]?\d*\.?\d+)$/);
    if (match) {
        const n = parseFloat(match[1]);
        if (n === 2) return '2*x';
        if (n === 1) return '1';
        if (n === 0) return '0';
        return `${n}*x^${n - 1}`;
    }

    // 4. Handle roots (e.g., root(3, x))
    match = expr.match(/^root\(\s*(\d+)\s*,\s*x\s*\)$/);
    if (match) {
        const n = parseInt(match[1], 10);
        if (n === 1) return '1';
        if (n <= 0) return null; // Invalid root
        return `(1/${n})*x^((1/${n}) - 1)`;
    }

    // If no rule matches
    return null;
};

// Improved derivative calculation
const calculateDerivative = (expr, x) => {
    try {
        console.log('Calculating derivative for:', expr, 'at x =', x);

        // First try symbolic derivative
        for (const [pattern, derivative] of Object.entries(symbolicDerivatives)) {
            if (expr === pattern) {
                try {
                    const result = eval(derivative.replace(/x/g, x));
                    if (!isNaN(result)) {
                        console.log('Using symbolic derivative:', derivative);
                        return result;
                    }
                } catch (error) {
                    console.log('Symbolic derivative evaluation failed, falling back to numerical method');
                }
            }
        }

        // If symbolic derivative fails, use numerical method
        const evaluateExpr = (xVal) => {
            try {
                // Replace x with the actual value, but keep the expression structure
                const safeExpr = expr.replace(/x/g, `(${xVal})`);
                console.log('Evaluating:', safeExpr);
                const result = eval(safeExpr);
                return isNaN(result) ? NaN : result;
            } catch (error) {
                console.error('Error evaluating expression:', error);
                return NaN;
            }
        };

        // Use a smaller step size for better accuracy
        const h = 0.000001;

        // Calculate using central difference method
        const f1 = evaluateExpr(x + h);
        const f2 = evaluateExpr(x - h);

        if (isNaN(f1) || isNaN(f2)) {
            console.log('Invalid values in derivative calculation');
            return NaN;
        }

        const derivative = (f1 - f2) / (2 * h);
        console.log('Derivative result:', derivative);
        return derivative;
    } catch (error) {
        console.error('Error in derivative calculation:', error);
        return NaN;
    }
};

const preprocessDerivative = expr => {
    try {
        // First handle the derivative operator
        let processed = expr.replace(/\(([^()]+)\)'/g, (match, p1) => {
            const cleanExpr = p1.trim().replace(/'/g, "");
            return `__calculateDerivative__("${cleanExpr}", x)`;
        });

        // Then handle any remaining derivative operators without parentheses
        processed = processed.replace(/([a-zA-Z0-9_]+\([^()]+\))'/g, (match, p1) => {
            return `__calculateDerivative__("${p1}", x)`;
        });

        return processed;
    } catch (error) {
        console.error('Error in preprocessing:', error);
        return expr;
    }
};

const evalFunc = () => {
    try {
        console.log('Original function:', func);
        f = x => {
            try {
                let funcText = preprocessFactorial(func);
                funcText = preprocessDerivative(funcText);
                funcText = preprocessPower(funcText);

                // Define the derivative calculation function
                const __calculateDerivative__ = (expr, xVal) => {
                    try {
                        return calculateDerivative(expr, xVal);
                    } catch (error) {
                        console.error('Error in derivative calculation:', error);
                        return NaN;
                    }
                };

                const result = eval(funcText);
                const finalResult = result * graph.amp;
                return isNaN(finalResult) || !isFinite(finalResult) ? NaN : finalResult;
            } catch (error) {
                console.error('Error in function evaluation:', error);
                return NaN;
            }
        };
    } catch (error) {
        console.error('Error in evalFunc:', error);
        f = x => NaN;
    }
};

const evalDerivativeFunc = () => {
    try {
        console.log('Derivative function:', derivativeFunc);
        fDerivative = x => {
            try {
                let funcText = preprocessFactorial(derivativeFunc);
                funcText = preprocessDerivative(funcText);
                funcText = preprocessPower(funcText);

                // Define the derivative calculation function
                const __calculateDerivative__ = (expr, xVal) => {
                    try {
                        return calculateDerivative(expr, xVal);
                    } catch (error) {
                        console.error('Error in derivative calculation:', error);
                        return NaN;
                    }
                };

                const result = eval(funcText);
                const finalResult = result * graph.amp;
                return isNaN(finalResult) || !isFinite(finalResult) ? NaN : finalResult;
            } catch (error) {
                console.error('Error in derivative function evaluation:', error);
                return NaN;
            }
        };
    } catch (error) {
        console.error('Error in evalDerivativeFunc:', error);
        fDerivative = x => NaN;
    }
};

let f = x => 0; // Default function
let fDerivative = x => 0; // Default derivative function

const graph = {
    size: 0,
    posX: 0,
    posY: 0,
    centerX: 0,
    centerY: 0,
    endX: 0,
    endY: 0,
    svg: null,
    data: [],
    amp: 1,
    lineThickness: 5,
    step: 5,
    init: () => {
        const screenWidth = document.body.clientWidth;
        const screenHeight = document.body.clientHeight;
        graph.size = Math.max(screenWidth, screenHeight);
        graph.centerX = screenWidth / 2;
        graph.centerY = screenHeight / 2;
        graph.endX = graph.centerX + graph.size;
        graph.endY = graph.centerY - graph.size;
        graph.lineSize = Math.min(screenWidth - 80, screenHeight - 80);
        graph.amp = 8;
        graph.lineThickness = 3;
        graph.graphThickness = 3;
        graph.step = 5;
        graph.svgScale = 1;
        graph.data = [];
    },
    clear: () => {
        if (graph.svg) graph.svg.remove();
    },
    getCenterX: () => graph.centerX,
    getCenterY: () => graph.centerY,
    renderBody: () => {
        graph.svg = d3.select("body")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("background-color", "var(--secondary-color)");

        graph.currentTransform = d3.zoomIdentity;

        const zoomed = e => {
            graph.currentTransform = e.transform;
            graph.redrawGraph();
        };

        graph.zoom = d3.zoom().on("zoom", zoomed);
        graph.svg.call(graph.zoom);
    },
    drawLines: () => {
        // Draw X axis
        graph.svg.append("line")
            .attr("x1", graph.centerX - graph.lineSize / 2)
            .attr("y1", graph.centerY)
            .attr("x2", graph.centerX + graph.lineSize / 2)
            .attr("y2", graph.centerY)
            .attr("stroke", "var(--primary-color)")
            .attr("stroke-width", graph.lineThickness)
            .attr("class", "x-axis");

        // Draw Y axis
        graph.svg.append("line")
            .attr("x1", graph.centerX)
            .attr("y1", graph.centerY + graph.lineSize / 2)
            .attr("x2", graph.centerX)
            .attr("y2", graph.centerY - graph.lineSize / 2)
            .attr("stroke", "var(--primary-color)")
            .attr("stroke-width", graph.lineThickness)
            .attr("class", "y-axis");

        // Add X axis markers
        const xRange = Math.floor(graph.lineSize / (2 * graph.amp));
        for (let i = -xRange; i <= xRange; i++) {
            if (i === 0) continue; // Skip 0 as it's the center

            const x = graph.centerX + i * graph.amp;
            // Draw tick
            graph.svg.append("line")
                .attr("x1", x)
                .attr("y1", graph.centerY - 5)
                .attr("x2", x)
                .attr("y2", graph.centerY + 5)
                .attr("stroke", "var(--primary-color)")
                .attr("stroke-width", 1);

            // Add number only for multiples of 5
            if (i % 5 === 0) {
                graph.svg.append("text")
                    .attr("x", x)
                    .attr("y", graph.centerY + 12)
                    .attr("text-anchor", "middle")
                    .attr("fill", "var(--primary-color)")
                    .style("font-size", "12px")
                    .text(i);
            }
        }

        // Add Y axis markers
        const yRange = Math.floor(graph.lineSize / (2 * graph.amp));
        for (let i = -yRange; i <= yRange; i++) {
            if (i === 0) continue; // Skip 0 as it's the center

            const y = graph.centerY - i * graph.amp;
            // Draw tick
            graph.svg.append("line")
                .attr("x1", graph.centerX - 5)
                .attr("y1", y)
                .attr("x2", graph.centerX + 5)
                .attr("y2", y)
                .attr("stroke", "var(--primary-color)")
                .attr("stroke-width", 1);

            // Add number only for multiples of 5
            if (i % 5 === 0) {
                graph.svg.append("text")
                    .attr("x", graph.centerX - 12)
                    .attr("y", y)
                    .attr("text-anchor", "end")
                    .attr("dominant-baseline", "middle")
                    .attr("fill", "var(--primary-color)")
                    .style("font-size", "12px")
                    .text(i);
            }
        }

        // Add origin point (0,0)
        graph.svg.append("text")
            .attr("x", graph.centerX - 12)
            .attr("y", graph.centerY + 12)
            .attr("text-anchor", "end")
            .attr("fill", "var(--primary-color)")
            .style("font-size", "12px")
            .text("0");
    },
    drawGraph: () => {
        // Draw original function
        graph.data = [];
        const beginX = graph.centerX - graph.lineSize / 2;
        const endX = graph.centerX + graph.lineSize / 2;
        const step = Math.max(1, Math.floor(graph.step / 2));
        for (let xCoord = beginX; xCoord <= endX; xCoord += step) {
            const x = (xCoord - graph.centerX) / graph.amp;
            // Prevent drawing for invalid x (e.g., x <= 0 for ln, lg)
            if ((func.includes('ln') || func.includes('lg')) && x <= 0) continue;
            try {
                const y = f(x);
                if (!isNaN(y)) {
                    const yCoord = graph.centerY - y;
                    if (yCoord > -graph.lineSize && yCoord < graph.lineSize * 2) {
                        const transformedPoint = graph.currentTransform.apply([xCoord, yCoord]);
                        graph.data.push({ x: transformedPoint[0], y: transformedPoint[1] });
                    }
                }
            } catch (error) {
                // skip invalid points
            }
        }
        graph.data.sort((a, b) => a.x - b.x);
        const line = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveBasis)
            .defined(d => !isNaN(d.y));
        graph.svg.append("path")
            .attr("d", line(graph.data))
            .attr("fill", "none")
            .attr("stroke-width", graph.graphThickness)
            .attr("stroke", "red");

        // Draw derivative function if it exists
        if (derivativeFunc && derivativeFunc.trim() !== "") {
            graph.derivativeData = [];
            for (let xCoord = beginX; xCoord <= endX; xCoord += step) {
                const x = (xCoord - graph.centerX) / graph.amp;
                // Prevent drawing for invalid x (e.g., x <= 0 for ln, lg)
                if ((derivativeFunc.includes('ln') || derivativeFunc.includes('lg')) && x <= 0) continue;
                try {
                    const y = fDerivative(x);
                    if (!isNaN(y)) {
                        const yCoord = graph.centerY - y;
                        if (yCoord > -graph.lineSize && yCoord < graph.lineSize * 2) {
                            const transformedPoint = graph.currentTransform.apply([xCoord, yCoord]);
                            graph.derivativeData.push({ x: transformedPoint[0], y: transformedPoint[1] });
                        }
                    }
                } catch (error) {
                    // skip invalid points
                }
            }
            graph.derivativeData.sort((a, b) => a.x - b.x);
            const derivativeLine = d3.line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveBasis)
                .defined(d => !isNaN(d.y));
            graph.svg.append("path")
                .attr("d", derivativeLine(graph.derivativeData))
                .attr("fill", "none")
                .attr("stroke-width", graph.graphThickness)
                .attr("stroke", "blue");
        }
    },
    getZoom: () => graph.zoom,
    getSVG: () => graph.svg,
    redrawGraph: () => {
        graph.clear();
        graph.renderBody();
        graph.drawLines();
        graph.drawGraph();
    }
};

const zoomIn = () => {
    graph.lineSize *= 1.5;
    graph.amp *= 1.5;  // Scale amplitude with zoom
    graph.step = Math.max(1, graph.step + 1);  // Ensure step doesn't get too small
    console.log('Zoomed in', graph.lineSize);
    graph.redrawGraph();
};

const zoomOut = () => {
    graph.lineSize /= 1.5;
    graph.amp /= 1.5;  // Scale amplitude with zoom
    graph.step = Math.max(1, graph.step - 1);  // Ensure step doesn't get too small
    console.log('Zoomed out', graph.lineSize);
    graph.redrawGraph();
};

const update = (timestamp) => {
    const now = Date.now();
    const time = new Date(now - initialDate);
};

const redrawGraphAndInit = () => {
    graph.clear();
    graph.init();
    graph.redrawGraph();
};

window.onload = () => {
    evalFunc();
    evalDerivativeFunc();
    graph.init();
    graph.redrawGraph();
    insertFunctionPopup.init();
};

window.onresize = () => {
    redrawGraphAndInit();
};

const insertFunctionPopup = {
    showing: true,
    htmlElement: null,
    inputElement: null,
    derivativeElement: null,
    derivativeInputElement: null,
    isShowing: function () {
        return this.showing;
    },
    init: function () {
        this.showing = true;
        this.htmlElement = document.getElementById('insert-function-div');
        this.inputElement = document.getElementById('insert-function-input');
        this.derivativeElement = document.getElementById('insert-derivative-div');
        this.derivativeInputElement = document.getElementById('insert-derivative-input');
        this.htmlElement.style.display = 'flex';
        this.derivativeElement.style.display = 'flex';

        // Event listener for main function input
        this.inputElement.addEventListener('input', () => {
            func = this.inputElement.value;
            evalFunc();

            const symbolicDerivative = getSymbolicDerivative(func);
            if (symbolicDerivative !== null) {
                this.derivativeInputElement.value = symbolicDerivative;
            } else {
                this.derivativeInputElement.value = ''; // Clear if no derivative found
            }
            
            derivativeFunc = this.derivativeInputElement.value;
            evalDerivativeFunc();
            redrawGraphAndInit();
        });

        // Event listener for derivative input (manual override)
        this.derivativeInputElement.addEventListener('input', () => {
            derivativeFunc = this.derivativeInputElement.value;
            evalDerivativeFunc();
            redrawGraphAndInit();
        });
    },
    open: function () {
        this.showing = true;
        this.htmlElement.style.display = 'flex';
        this.derivativeElement.style.display = 'flex';
        this.inputElement.focus();
    },
    close: function () {
        this.showing = false;
        this.htmlElement.style.display = 'none';
        this.derivativeElement.style.display = 'none';
        this.inputElement.value = '';
        this.derivativeInputElement.value = '';
    },
    getText: function () {
        return this.inputElement.value;
    }
};

const keys = {};

window.onkeydown = e => {
    keys[e.key] = true;

    if (e.key === 'Enter' && insertFunctionPopup.isShowing()) {
        func = insertFunctionPopup.inputElement.value.trim();
        evalFunc();

        const symbolicDerivative = getSymbolicDerivative(func);
        if (symbolicDerivative !== null) {
            derivativeFunc = symbolicDerivative;
            insertFunctionPopup.derivativeInputElement.value = derivativeFunc;
            console.log('Symbolic derivative found: ', derivativeFunc);
        } else {
            derivativeFunc = '';
            insertFunctionPopup.derivativeInputElement.value = '';
        }
        evalDerivativeFunc();
        redrawGraphAndInit();
    }

    if (keys['Control']) {
        if (keys['=']) {
            e.preventDefault();
            zoomIn();
        }
        else if (keys['-']) {
            e.preventDefault();
            zoomOut();
        }
    }
};

window.onkeyup = e => {
    keys[e.key] = false;
};

window.onclick = e => { };

const fact = x => {
    if (x < 0 || !Number.isInteger(x)) return NaN;
    if (x === 0 || x === 1) return 1;
    let res = 1;
    for (let i = 2; i <= x; i++) res *= i;
    return res;
};
