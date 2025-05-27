const majorSpacing = 50; // Distanța dintre liniile groase
const minorSpacing = 10; // Distanța dintre liniile subțiri
const gridExtent = 100000; // Dimensiunea maximă a grilei (în ambele direcții)

let currentX = 0; // Poziția inițială X
let currentY = 0; // Poziția inițială Y

// SVG-ul principal
const svg = d3.select("body")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .style("background-color", "#E0E0E0");

// const imgs = svg.selectAll("image").data([0]);
// imgs.enter()
  // .append("svg:image", '/res/coca-cola-christmas.png');

/*svg.append("image")
  .attr("xlink:href", "/res/coca-cola-christmas3.png")
  .attr("width", "100vw")
  .attr("height", "100%");*/

// Grup pentru grilă
const gridGroup = svg.append("g")
  .attr("transform", `translate(${window.innerWidth / 2}, ${window.innerHeight / 2})`);

// Adaugă grila mare
function drawGrid() {
  // Linii subțiri (minore)
  for (let x = -gridExtent; x <= gridExtent; x += minorSpacing) {
    gridGroup.append("line")
      .attr("x1", x)
      .attr("y1", -gridExtent)
      .attr("x2", x)
      .attr("y2", gridExtent)
      .attr("stroke", "#404040")
      .attr("stroke-width", 0.5);
  }

  for (let y = -gridExtent; y <= gridExtent; y += minorSpacing) {
    gridGroup.append("line")
      .attr("x1", -gridExtent)
      .attr("y1", y)
      .attr("x2", gridExtent)
      .attr("y2", y)
      .attr("stroke", "#404040")
      .attr("stroke-width", 0.5);
  }

  // Linii groase (majore)
  for (let x = -gridExtent; x <= gridExtent; x += majorSpacing) {
    gridGroup.append("line")
      .attr("x1", x)
      .attr("y1", -gridExtent)
      .attr("x2", x)
      .attr("y2", gridExtent)
      .attr("stroke", "#404040")
      .attr("stroke-width", 1);
  }

  for (let y = -gridExtent; y <= gridExtent; y += majorSpacing) {
    gridGroup.append("line")
      .attr("x1", -gridExtent)
      .attr("y1", y)
      .attr("x2", gridExtent)
      .attr("y2", y)
      .attr("stroke", "#404040")
      .attr("stroke-width", 1);
  }
}

// Adaugă axele principale
gridGroup.append("line")
  .attr("x1", -gridExtent)
  .attr("y1", 0)
  .attr("x2", gridExtent)
  .attr("y2", 0)
  .attr("stroke", "#404040")
  .attr("stroke-width", 5);

gridGroup.append("line")
  .attr("x1", 0)
  .attr("y1", -gridExtent)
  .attr("x2", 0)
  .attr("y2", gridExtent)
  .attr("stroke", "#404040")
  .attr("stroke-width", 5);

// Apel funcție pentru desenarea grilei
drawGrid();

// Variabile pentru dragging
let isDragging = false;
let startX, startY;

// Funcții pentru dragging cu "debounce"
let lastMove = 0;
const debounceDelay = 10; // Milisecunde pentru debounce

function dragMove(event) {
  if (isDragging) {
    const now = Date.now();
    if (now - lastMove < debounceDelay) return; // Ignoră evenimentele prea dese
    lastMove = now;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    currentX += dx;
    currentY += dy;

    gridGroup.transition().duration(50) // Tranziție smooth
      .attr("transform", `translate(${currentX}, ${currentY})`);

    startX = event.clientX;
    startY = event.clientY;
  }
}

function dragStart(event) {
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;

  // Elimină tranzițiile pe durata dragging-ului
  gridGroup.interrupt();
}

function dragEnd() {
  isDragging = false;
}

// Adaugă evenimentele pentru dragging
svg.on("mousedown", dragStart)
   .on("mousemove", dragMove)
   .on("mouseup", dragEnd)
   .on("mouseleave", dragEnd);

// Centrează la `(0, 0)` inițial
gridGroup.attr("transform", `translate(${window.innerWidth / 2}, ${window.innerHeight / 2})`);

const points = [];

// Adaugă punctul O(0, 0)
gridGroup.append("circle")
  .attr("cx", 0) // Coordonata X
  .attr("cy", 0) // Coordonata Y
  .attr("r", 7) // Raza cercului
  .style("fill", "grey"); // Culoarea punctului

// Adaugă eticheta pentru punctul O(0, 0)
gridGroup.append("text")
  .attr("x", 10) // Plasat ușor în dreapta punctului
  .attr("y", -10) // Plasat ușor deasupra punctului
  .text("O(0, 0)")
  .style("font-size", "12px")
  .style("fill", "black");
