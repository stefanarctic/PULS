/**
 * Scenarii: corp · reactor · fizică — vanilla JS
 */

function simLbl(path, fallback) {
  return typeof window.simLbl === "function" ? window.simLbl(path, fallback) : fallback;
}

var H_HEX = "#2563eb";
var D_HEX = "#7c3aed";
var O_HEX = "#ec4899";

function el(tag, attrs, children) {
  var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  attrs = attrs || {};
  children = children || [];
  for (var k in attrs) {
    if (attrs[k] !== undefined && attrs[k] !== null) {
      n.setAttribute(k, String(attrs[k]));
    }
  }
  for (var i = 0; i < children.length; i++) {
    var c = children[i];
    if (typeof c === "string") {
      n.appendChild(document.createTextNode(c));
    } else if (c) {
      n.appendChild(c);
    }
  }
  return n;
}

function buildMolecule(isD2O) {
  var w = 220;
  var h = 160;
  var ox = 110;
  var oy = 80;
  var hColor = isD2O ? D_HEX : H_HEX;
  var hLabel = isD2O ? "D" : "H";

  var svg = el("svg", {
    viewBox: "0 0 " + w + " " + h,
    width: String(w),
    height: String(h),
    "aria-hidden": "true",
  });

  var bondLen = 52;
  var angle = (104.5 * Math.PI) / 180;
  var half = angle / 2;
  var x1 = ox - bondLen * Math.sin(half);
  var y1 = oy + bondLen * Math.cos(half);
  var x2 = ox + bondLen * Math.sin(half);
  var y2 = y1;

  var gBonds = el("g", {
    stroke: "rgba(15, 23, 42, 0.2)",
    "stroke-width": "6",
    "stroke-linecap": "round",
  });
  gBonds.appendChild(el("line", { x1: String(ox), y1: String(oy), x2: String(x1), y2: String(y1) }));
  gBonds.appendChild(el("line", { x1: String(ox), y1: String(oy), x2: String(x2), y2: String(y2) }));
  svg.appendChild(gBonds);

  svg.appendChild(
    el("circle", {
      cx: String(ox),
      cy: String(oy),
      r: "28",
      fill: O_HEX,
      stroke: "rgba(255,255,255,0.5)",
      "stroke-width": "2",
    })
  );
  svg.appendChild(
    el(
      "text",
      {
        x: String(ox),
        y: String(oy + 6),
        "text-anchor": "middle",
        fill: "#fff",
        "font-size": "18",
        "font-weight": "700",
        "font-family": "Outfit, sans-serif",
      },
      ["O"]
    )
  );

  var coords = [
    [x1, y1],
    [x2, y2],
  ];
  for (var j = 0; j < coords.length; j++) {
    var hx = coords[j][0];
    var hy = coords[j][1];
    var r = isD2O ? 22 : 18;
    svg.appendChild(
      el("circle", {
        cx: String(hx),
        cy: String(hy),
        r: String(r),
        fill: hColor,
        stroke: "rgba(255,255,255,0.45)",
        "stroke-width": "2",
      })
    );
    svg.appendChild(
      el(
        "text",
        {
          x: String(hx),
          y: String(hy + 6),
          "text-anchor": "middle",
          fill: "#fff",
          "font-size": isD2O ? "15" : "14",
          "font-weight": "700",
          "font-family": "Outfit, sans-serif",
        },
        [hLabel]
      )
    );
  }

  return svg;
}

function clearNeutrons() {
  for (var i = 0; i < neutrons.length; i++) {
    if (neutrons[i].el && neutrons[i].el.parentNode) {
      neutrons[i].el.remove();
    }
  }
  neutrons = [];
}

function setupScenarioModes() {
  var buttons = document.querySelectorAll(".scenario-card");
  var panels = document.querySelectorAll(".panel[role='tabpanel']");

  function showMode(mode) {
    clearNeutrons();
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var on = b.getAttribute("data-mode") === mode;
      b.setAttribute("aria-selected", on ? "true" : "false");
    }
    for (var p = 0; p < panels.length; p++) {
      var panel = panels[p];
      var pid = panel.id.replace("panel-", "");
      var active = pid === mode;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    }
  }

  for (var k = 0; k < buttons.length; k++) {
    buttons[k].addEventListener("click", function () {
      showMode(this.getAttribute("data-mode"));
    });
  }
}

var neutronRaf = 0;
var neutrons = [];

function spawnNeutron(container, useD2O) {
  var layer = container.getBoundingClientRect();
  var w = layer.width;
  var h = layer.height;
  var slow = useD2O;
  var speed = slow ? 0.35 + Math.random() * 0.25 : 0.85 + Math.random() * 0.55;
  return {
    x: Math.random() * w,
    y: -8,
    vx: (Math.random() - 0.5) * 1.2,
    vy: speed,
    slow: slow,
    el: null,
  };
}

function isReactorPanelVisible() {
  var reactorPanel = document.getElementById("panel-reactor");
  return reactorPanel && !reactorPanel.hidden;
}

function tickNeutrons() {
  var container = document.getElementById("neutrons");
  if (!container || !isReactorPanelVisible()) {
    neutronRaf = requestAnimationFrame(tickNeutrons);
    return;
  }

  var rect = container.getBoundingClientRect();
  var h = rect.height;
  var w = rect.width;

  var spawnRate = 0.12;
  var modBox = document.getElementById("mod-d2o");
  var useD2O = modBox && modBox.checked;
  if (!useD2O) {
    spawnRate = 0.06;
  }

  if (Math.random() < spawnRate) {
    var n = spawnNeutron(container, useD2O);
    var dot = document.createElement("div");
    dot.className = "n-dot" + (n.slow ? " slow" : "");
    dot.style.left = n.x + "px";
    dot.style.top = n.y + "px";
    container.appendChild(dot);
    n.el = dot;
    neutrons.push(n);
  }

  var absorbRate = modBox && modBox.checked ? 0.012 : 0.1;

  neutrons = neutrons.filter(function (n) {
    n.x += n.vx + (Math.random() - 0.5) * 0.4;
    n.y += n.vy;
    if (n.slow) {
      n.vy *= 0.998;
    }
    n.el.style.left = n.x + "px";
    n.el.style.top = n.y + "px";
    if (n.y > h + 10 || n.x < -10 || n.x > w + 10) {
      n.el.remove();
      return false;
    }
    if (Math.random() < absorbRate && n.y > h * 0.55) {
      n.el.style.opacity = "0";
      setTimeout(function () {
        if (n.el && n.el.parentNode) {
          n.el.remove();
        }
      }, 200);
      return false;
    }
    return true;
  });

  neutronRaf = requestAnimationFrame(tickNeutrons);
}

function setupModerator() {
  var chk = document.getElementById("mod-d2o");
  var label = document.getElementById("mod-label");
  var hint = document.getElementById("mod-hint");
  var meterFill = document.getElementById("meter-fill");
  var meterVal = document.getElementById("meter-val");
  var stage = document.getElementById("reactor-stage");
  var chainFill = document.getElementById("chain-fill");
  var chainLabel = document.getElementById("chain-label");
  var fate = document.getElementById("reactor-fate");
  var coreBar = document.getElementById("core-bar-text");
  if (!chk || !label || !hint) return;

  function sync() {
    var d2o = chk.checked;
    document.body.setAttribute("data-moderator", d2o ? "d2o" : "h2o");
    label.textContent = d2o ? "D₂O" : "H₂O";
    hint.textContent = d2o
      ? simLbl(
          "reactor.hintD2o",
          "D₂O: secțiune mică de captură pe deuteriu; neutronii pierd energie prin ciocniri elastice și rămân disponibili pentru fisiune în combustibil (model simplificat)."
        )
      : simLbl(
          "reactor.hintH2o",
          "H₂O: hidrogenul absoarbe neutroni termici în moderator; scade numărul de neutroni disponibili pentru combustibil — în multe reactoare cu apă ușoară se folosește uraniu îmbogățit."
        );

    if (meterFill) {
      meterFill.classList.toggle("is-high", !d2o);
    }
    if (meterVal) {
      meterVal.textContent = d2o
        ? simLbl("reactor.meterLow", "scăzută (model)")
        : simLbl("reactor.meterHigh", "ridicată (model)");
    }

    if (stage) {
      stage.classList.toggle("is-alive", d2o);
      stage.classList.toggle("is-dead", !d2o);
    }
    if (chainFill) {
      chainFill.classList.toggle("is-dead", !d2o);
    }
    if (chainLabel) {
      chainLabel.textContent = d2o
        ? simLbl("reactor.chainOn", "activ")
        : simLbl("reactor.chainOff", "stins");
    }
    if (fate) {
      fate.innerHTML = d2o
        ? simLbl(
            "reactor.fateD2o",
            "Moderator <strong>D₂O</strong>: pierderi mici de neutroni în apă; în design CANDU, lanțul poate fi menținut cu uraniu natural (²³⁵U ~0,7%)."
          )
        : simLbl(
            "reactor.fateH2o",
            "Moderator <strong>H₂O</strong>: pierderi mai mari pe hidrogen; în acest model, lanțul se subțiază — în practică se compensează cu combustibil îmbogățit sau alte soluții."
          );
    }
    if (coreBar) {
      coreBar.textContent = simLbl("reactor.fuelBar", "Combustibil · fisiune");
    }
  }
  chk.addEventListener("change", sync);
  sync();
}

function setupThermo() {
  var hBtn = document.getElementById("pick-h2o");
  var dBtn = document.getElementById("pick-d2o");
  var fill = document.getElementById("thermo-fill");
  var lbl = document.getElementById("thermo-label");
  var temp = document.getElementById("thermo-temp");
  if (!hBtn || !dBtn || !fill || !lbl || !temp) return;

  function setMode(isD2O) {
    hBtn.setAttribute("aria-pressed", isD2O ? "false" : "true");
    dBtn.setAttribute("aria-pressed", isD2O ? "true" : "false");
    fill.classList.toggle("is-d2o", isD2O);
    lbl.textContent = isD2O ? "D₂O" : "H₂O";
    temp.textContent = isD2O ? "101,4 °C" : "100,0 °C";
  }

  hBtn.addEventListener("click", function () {
    setMode(false);
  });
  dBtn.addEventListener("click", function () {
    setMode(true);
  });
}

function setupMassExperiment() {
  var slider = document.getElementById("mass-slider");
  var out = document.getElementById("freq-ratio");
  var waveD = document.getElementById("wave-d");
  var waveH = document.getElementById("wave-h");
  if (!slider || !out || !waveD) return;

  function update() {
    var raw = parseInt(slider.value, 10);
    var r = raw / 100;
    var freqRatio = 1 / Math.sqrt(r);
    out.textContent = freqRatio.toFixed(2).replace(".", ",");
    var secD = 1.15 * Math.sqrt(r);
    waveD.style.animationDuration = secD.toFixed(2) + "s";
    if (waveH) {
      waveH.style.animationDuration = "0.55s";
    }
  }
  slider.addEventListener("input", update);
  update();
}

function setupQuiz() {
  var root = document.getElementById("quiz");
  if (!root) return;

  root.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.classList || !t.classList.contains("q-btn")) return;
    var q = t.getAttribute("data-q");
    var ok = t.getAttribute("data-correct") === "true";
    var row = t.parentNode;
    var btns = row.querySelectorAll(".q-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove("reveal-ok", "reveal-bad");
    }
    for (var j = 0; j < btns.length; j++) {
      var btn = btns[j];
      var correct = btn.getAttribute("data-correct") === "true";
      if (correct) {
        btn.classList.add("reveal-ok");
      } else if (btn === t && !ok) {
        btn.classList.add("reveal-bad");
      }
    }
    var fb = document.getElementById("fb-" + q);
    if (fb) {
      fb.hidden = false;
      if (q === "1") {
        fb.textContent = ok
          ? simLbl(
              "physics.quiz1ok",
              "La presiune atmosferică standard, D₂O fierbe la ~101,4 °C, puțin peste H₂O (100 °C), din cauza legăturilor și masei."
            )
          : simLbl(
              "physics.quiz1bad",
              "D₂O are punct de fierbere mai mare decât H₂O la aceeași presiune."
            );
      } else {
        fb.textContent = ok
          ? simLbl(
              "physics.quiz2ok",
              "Reactoarele CANDU cu uraniu natural folosesc moderator D₂O pentru a limita pierderile de neutroni."
            )
          : simLbl(
              "physics.quiz2bad",
              "Cu H₂O, captura pe hidrogen e mare; designul CANDU clasic nu folosește moderator de apă ușoară cu uraniu natural."
            );
      }
    }
  });
}

function buildCellGrid() {
  var grid = document.getElementById("cell-grid");
  if (!grid) return;
  var total = 40;
  for (var i = 0; i < total; i++) {
    var cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("aria-hidden", "true");
    grid.appendChild(cell);
  }
}

function getBodyStory(pct) {
  if (pct <= 0.05) {
    return simLbl(
      "body.story.vlow",
      "Valoare foarte mică, apropiată de fondul natural al deuteriului din apă (~140 ppm). În model, efectul vizual rămâne practic nul."
    );
  }
  if (pct <= 10) {
    return simLbl(
      "body.story.low",
      "Fracție mică: aproape toate moleculele sunt încă H₂O; în realitate, organismul tolerează urme de D₂O fără efecte vizibile."
    );
  }
  if (pct <= 25) {
    return simLbl(
      "body.story.mid",
      "Fracție moderată: în model, crește ponderea D₂O; în experimente pe animale, fracții moderate de D₂O afectează vitezele unor reacții dependente de hidrogen."
    );
  }
  if (pct <= 70) {
    return simLbl(
      "body.story.high",
      "Fracție mare: toxicitatea reală crește cu doza; la oameni, fracții mari de D₂O în organism sunt periculoase"
    );
  }
  if (pct < 100) {
    return simLbl(
      "body.story.vhigh",
      "Fracție foarte mare: scenariu extrem, doar pentru demonstrație pe ecran."
    );
  }
  return simLbl(
    "body.story.max",
    "100%: valoare maximă în model. În realitate, expunerea masivă la D₂O nu este testabilă și este dăunătoare."
  );
}

function updateBodyBadge(badge, pct) {
  badge.classList.remove("warn", "bad", "dead");
  if (pct <= 10) {
    badge.textContent = simLbl("badges.ok", "OK");
  } else if (pct <= 25) {
    badge.textContent = simLbl("badges.warn", "Atenție");
    badge.classList.add("warn");
  } else if (pct <= 70) {
    badge.textContent = simLbl("badges.bad", "Ridicat");
    badge.classList.add("bad");
  } else {
    badge.textContent = simLbl("badges.dead", "Critic");
    badge.classList.add("dead");
  }
}

function formatBodyPct(pct) {
  var text;
  if (pct === 0) {
    text = "0";
  } else if (pct < 1) {
    text = pct.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  } else if (Math.abs(pct - Math.round(pct)) < 0.000001) {
    text = String(Math.round(pct));
  } else {
    text = pct.toFixed(1).replace(/\.0$/, "");
  }
  return text.replace(".", ",");
}

function setupBodySim() {
  var slider = document.getElementById("body-d2o");
  var story = document.getElementById("body-story");
  var pctVal = document.getElementById("body-pct-val");
  var badge = document.getElementById("body-badge");
  var grid = document.getElementById("cell-grid");
  if (!slider || !story || !pctVal || !badge || !grid) return;

  var cells = grid.querySelectorAll(".cell");

  function update() {
    var pct = parseFloat(slider.value);
    pctVal.textContent = formatBodyPct(pct);
    story.textContent = getBodyStory(pct);
    updateBodyBadge(badge, pct);

    var n = cells.length;
    var infected = Math.floor((n * pct) / 100);
    for (var i = 0; i < n; i++) {
      cells[i].className = "cell";
      if (i < infected) {
        if (pct < 28) {
          cells[i].classList.add("cell-warn");
        } else if (pct < 72) {
          cells[i].classList.add("cell-bad");
        } else {
          cells[i].classList.add("cell-dead");
        }
      }
    }
  }

  slider.addEventListener("input", update);
  update();
}

function mountMolecules() {
  var h2o = document.getElementById("mol-h2o");
  var d2o = document.getElementById("mol-d2o");
  if (h2o) {
    h2o.appendChild(buildMolecule(false));
  }
  if (d2o) {
    d2o.appendChild(buildMolecule(true));
  }
}

function init() {
  document.body.setAttribute("data-moderator", "d2o");
  mountMolecules();
  buildCellGrid();
  setupScenarioModes();
  setupBodySim();
  setupModerator();
  setupThermo();
  setupMassExperiment();
  setupQuiz();
  cancelAnimationFrame(neutronRaf);
  clearNeutrons();
  neutronRaf = requestAnimationFrame(tickNeutrons);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
