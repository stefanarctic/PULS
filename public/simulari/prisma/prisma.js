const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let incidentAngle = 0;
let dispersing = false;
let animationStep = 0;

// Prisme
const prism = {
  A: { x: 300, y: 300 },
  B: { x: 400, y: 100 },
  C: { x: 500, y: 300 },
};

// Setează slider-ul
const angleSlider = document.getElementById('angleSlider');
angleSlider.addEventListener('input', (e) => {
  incidentAngle = e.target.value;
  document.getElementById('angleValue').textContent = incidentAngle;
  resetScene();
});

// Butonul pentru activarea/dispersiei
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', () => {
  dispersing = !dispersing;
  animationStep = dispersing ? 7 : 0;
  toggleButton.textContent = dispersing ? 'Dezactivează Dispersia' : 'Activează Dispersia';
  resetScene();
});


function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function intersectRayWithSegment(rayOrigin, rayDir, segA, segB) {
  const x1 = rayOrigin.x, y1 = rayOrigin.y;
  const x2 = x1 + rayDir.x * 1000, y2 = y1 + rayDir.y * 1000;
  const x3 = segA.x, y3 = segA.y;
  const x4 = segB.x, y4 = segB.y;

  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (den === 0) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

  if (t >= 0 && u >= 0 && u <= 1) {
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  }
  return null;
}

function intersectHorizontalWithSegment(y, segA, segB) {
  const { x: x1, y: y1 } = segA;
  const { x: x2, y: y2 } = segB;
  if ((y1 < y && y2 < y) || (y1 > y && y2 > y)) return null;

  const t = (y - y1) / (y2 - y1);
  const x = x1 + t * (x2 - x1);
  return { x, y };
}


function drawWhiteRay() {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;

  const angle = toRadians(incidentAngle);
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  const origin = { x: 100, y: 250 };
  const rayDir = { x: dirX, y: dirY };

  const hit = intersectRayWithSegment(origin, rayDir, prism.A, prism.B);
  if (hit) {
    drawArrow(origin.x, origin.y, hit.x, hit.y, 'white', 3);


    // refracția la intrarea în prismă
    const normalIn = {
      x: prism.B.y - prism.A.y,
      y: -(prism.B.x - prism.A.x)
    };
    const normLen = Math.hypot(normalIn.x, normalIn.y);
    normalIn.x /= normLen;
    normalIn.y /= normLen;

    const dot = rayDir.x * normalIn.x + rayDir.y * normalIn.y;
    const cosi = -dot;
    const eta = 1 / 1.5; // n_air / n_glass

    const k = 1 - eta * eta * (1 - cosi * cosi);
    if (k < 0) return null; // reflexie totală

    const refractedIn = {
      x: eta * rayDir.x + (eta * cosi - Math.sqrt(k)) * normalIn.x,
      y: eta * rayDir.y + (eta * cosi - Math.sqrt(k)) * normalIn.y
    };

    // ieșirea din prismă — calculăm intersecția cu latura BC
    const exit = intersectRayWithSegment(hit, refractedIn, prism.C, prism.B);
    if (exit) {
      if (dispersing) {
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
        for (let i = 0; i < colors.length; i++) {
          const offset = (i - 3) * 0.8;//pas intre culori
          ctx.beginPath();
          ctx.moveTo(hit.x + offset, hit.y + offset);
          ctx.lineTo(exit.x + offset, exit.y + offset);
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // refracție la ieșire
      const normalOut = {
        x: prism.B.y - prism.C.y,
        y: -(prism.B.x - prism.C.x)
      };
      const normLenOut = Math.hypot(normalOut.x, normalOut.y);
      normalOut.x /= normLenOut;
      normalOut.y /= normLenOut;

      const dotOut = refractedIn.x * normalOut.x + refractedIn.y * normalOut.y;
      const cosiOut = -dotOut;
      const etaOut = 1.5 / 1; // n_glass / n_air

      const kOut = 1 - etaOut * etaOut * (1 - cosiOut * cosiOut);
      if (kOut < 0) return null;

      const refractedOut = {
        x: etaOut * refractedIn.x + (etaOut * cosiOut - Math.sqrt(kOut)) * normalOut.x,
        y: etaOut * refractedIn.y + (etaOut * cosiOut - Math.sqrt(kOut)) * normalOut.y
      };

      if (dispersing) {
        return { x: exit.x, y: exit.y, dirX: refractedOut.x, dirY: refractedOut.y };
      } else {
        // Dacă dispersia e oprită, nu mai returna nimic — evită desenul extern
        return null;
      }
    }
  }
  return null;
}



function drawArrow(fromx, fromy, tox, toy, color, width) {
  const headlen = 10;
  const angle = Math.atan2(toy - fromy, tox - fromx);

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(tox, toy);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}


function drawRainbowRays(rayData) {
  if (!dispersing || !rayData) return;

  const { x, y } = rayData;
  const spreadStep = 0.03;
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

  for (let i = 0; i < animationStep; i++) {
    const angle = toRadians(20) + (i - 3) * spreadStep; // unghi de plecare + dispersie
    const endX = x + Math.cos(angle) * 300;
    const endY = y + Math.sin(angle) * 300;

    drawArrow(x, y, endX, endY, colors[i], 2);
  }
}

function drawPrism() {
  ctx.save();
  ctx.shadowColor = 'white';
  ctx.shadowBlur = 20;

  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(prism.A.x, prism.A.y);
  ctx.lineTo(prism.B.x, prism.B.y);
  ctx.lineTo(prism.C.x, prism.C.y);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function resetScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPrism();
  const rayData = drawWhiteRay();
  drawRainbowRays(rayData);
}

resetScene();


document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const unitformBar = document.getElementById("unitformbar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const toggleUnitformBar = document.getElementById("toggleUnitformbar");

  toggleSidebar.addEventListener("click", function () {
    sidebar.classList.toggle("visible");
  });

  toggleUnitformBar.addEventListener("click", function () {
    unitformBar.classList.toggle("visible");
  });
});



