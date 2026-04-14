import { getState, computePressure, PARTICLE_COUNT, MATERIALS } from "./physics.js";

const HINTS = {
  gas: "Particulele se mișcă haotic, fără legături — comportament de gaz.",
  liquid: "Atracție ușoară între vecini: se grupează dar încă curg.",
  solid: "Rețea ordonată: poziții aproape fixe, doar vibrații mici.",
};

const STATE_LABEL = {
  gas: "\uD83D\uDD25 Gas (chaotic)",
  liquid: "\uD83D\uDCA7 Liquid (fluid)",
  solid: "\u2744\uFE0F Solid (cristalin)",
};

const INSIGHT_DEFAULT =
  "Mișcă temperatura sau volumul — aici apare legătura cu presiunea și starea.";

export function initUI(callbacks = {}) {
  const {
    onTemperatureChange,
    onVolumeChange,
    onMaterialChange,
    onInsight,
  } = callbacks;

  const slider = document.getElementById("temp-slider");
  const volSlider = document.getElementById("volume-slider");
  const materialSelect = document.getElementById("material-select");
  const tempValue = document.getElementById("temp-value");
  const volValue = document.getElementById("volume-value");
  const stateLabel = document.getElementById("state-label");
  const stateHint = document.getElementById("state-hint");
  const pressureLabel = document.getElementById("pressure-label");
  const zeroWarning = document.getElementById("zero-warning");
  const challengeFreeze = document.getElementById("challenge-freeze-status");
  const challengePressure = document.getElementById("challenge-pressure-status");
  const insightDynamic = document.getElementById("insight-dynamic");

  let lastTemp = Number(slider.value);
  let lastVol = Number(volSlider.value);
  let lastMat = materialSelect.value;
  let lastRatio = 1;

  function pulseInsightIfChanged(newText) {
    if (!insightDynamic || insightDynamic.textContent === newText) return;
    insightDynamic.textContent = newText;
    insightDynamic.classList.remove("insight-dynamic--flash");
    requestAnimationFrame(() => {
      insightDynamic.classList.add("insight-dynamic--flash");
    });
  }

  function emitInsightFromControls(kind) {
    const temp = Number(slider.value);
    const vol = Number(volSlider.value);
    const mat = materialSelect.value;
    const dt = temp - lastTemp;
    const dv = vol - lastVol;

    let msg = "";

    if (kind === "temp" && Math.abs(dt) >= 1.5) {
      if (dt > 0) {
        msg =
          "T crește → viteze mai mari (culoarea se „încălzește”) → la același volum, presiunea tinde să crească (pV = nRT).";
      } else {
        msg =
          "T scade → mai puțină agitație → presiunea scade dacă volumul rămâne la fel; poți ajunge la lichid/solid.";
      }
    } else if (kind === "vol" && Math.abs(dv) >= 1.5) {
      if (dv < 0) {
        msg =
          "Volum mai mic → particulele mai aproape → mai multe coliziuni → presiunea crește (la T similară).";
      } else {
        msg =
          "Volum mai mare → spațiu liber → coliziuni mai rare → presiunea tinde să scadă.";
      }
    } else if (kind === "material" && mat !== lastMat) {
      const m = MATERIALS[mat];
      msg = `Material: ${m.label}. Îngheț ~${m.T_freeze} K, fierbere ~${m.T_boil} K — la aceeași T poți fi într-o altă stare decât înainte.`;
    }

    if (msg) {
      pulseInsightIfChanged(msg);
      onInsight?.(msg);
    }

    lastTemp = temp;
    lastVol = vol;
    lastMat = mat;
  }

  function refreshDerived() {
    const temp = Number(slider.value);
    const mat = materialSelect.value;
    const state = getState(temp, mat);
    stateLabel.textContent = STATE_LABEL[state];
    stateHint.textContent = HINTS[state];

    if (temp < 20) {
      zeroWarning.hidden = false;
    } else {
      zeroWarning.hidden = true;
    }
  }

  function refreshTempVol() {
    tempValue.textContent = String(Math.round(Number(slider.value)));
    volValue.textContent = `${Number(volSlider.value)}%`;
    refreshDerived();
  }

  let tempInsightTimer = null;
  let volInsightTimer = null;
  let tempFlushRaf = 0;
  let volFlushRaf = 0;

  function flushTempInsight() {
    if (tempInsightTimer) {
      clearTimeout(tempInsightTimer);
      tempInsightTimer = null;
    }
    if (tempFlushRaf) cancelAnimationFrame(tempFlushRaf);
    tempFlushRaf = requestAnimationFrame(() => {
      tempFlushRaf = 0;
      emitInsightFromControls("temp");
    });
  }

  function flushVolInsight() {
    if (volInsightTimer) {
      clearTimeout(volInsightTimer);
      volInsightTimer = null;
    }
    if (volFlushRaf) cancelAnimationFrame(volFlushRaf);
    volFlushRaf = requestAnimationFrame(() => {
      volFlushRaf = 0;
      emitInsightFromControls("vol");
    });
  }

  slider.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    refreshTempVol();
    onTemperatureChange?.(v);
    if (tempInsightTimer) clearTimeout(tempInsightTimer);
    tempInsightTimer = setTimeout(() => {
      tempInsightTimer = null;
      emitInsightFromControls("temp");
    }, 220);
  });

  slider.addEventListener("change", flushTempInsight);
  slider.addEventListener("pointerup", flushTempInsight);
  slider.addEventListener("touchend", flushTempInsight, { passive: true });

  volSlider.addEventListener("input", (e) => {
    refreshTempVol();
    onVolumeChange?.(Number(e.target.value) / 100);
    if (volInsightTimer) clearTimeout(volInsightTimer);
    volInsightTimer = setTimeout(() => {
      volInsightTimer = null;
      emitInsightFromControls("vol");
    }, 220);
  });

  volSlider.addEventListener("change", flushVolInsight);
  volSlider.addEventListener("pointerup", flushVolInsight);
  volSlider.addEventListener("touchend", flushVolInsight, { passive: true });

  materialSelect.addEventListener("change", (e) => {
    emitInsightFromControls("material");
    refreshDerived();
    onMaterialChange?.(e.target.value);
  });

  refreshTempVol();
  if (insightDynamic) {
    insightDynamic.textContent = INSIGHT_DEFAULT;
  }

  return {
    getTemperature: () => Number(slider.value),
    getVolumeFrac: () => Number(volSlider.value) / 100,
    getVolumeSliderPercent: () => Number(volSlider.value),
    getMaterial: () => materialSelect.value,
    getStateLabelText: () => stateLabel.textContent,
    getPressureLabelText: () => pressureLabel.textContent,
    refreshTempVol,
    refreshDerived,
    /** Apelat din bucla simulării când se schimbă presiunea mult */
       maybeInsightFromPressure(ratio) {
      if (!insightDynamic) return;
      if (ratio > 1.32 && lastRatio <= 1.05) {
        pulseInsightIfChanged(
          "Presiune mare acum: multe particule într-un volum mic sau T ridicată — observă mișcarea haotică."
        );
      } else if (ratio < 0.55 && lastRatio >= 0.75) {
        pulseInsightIfChanged(
          "Presiune mică: volum mare sau T mică — particulele au mai mult loc."
        );
      }
      lastRatio = ratio;
    },
    setPressureDisplay(areaPx, maxAreaPx) {
      const temp = Number(slider.value);
      const { label, ratio } = computePressure(
        PARTICLE_COUNT,
        temp,
        areaPx,
        maxAreaPx
      );
      pressureLabel.textContent = `Pressure: ${label}`;
      pressureLabel.dataset.ratio = String(ratio);
      return { label, ratio };
    },
    setChallengeFreeze(done) {
      challengeFreeze.textContent = done
        ? "\u2713 Stare solidă atinsă."
        : "Coboară T până la solid pentru materialul ales.";
    },
    setChallengePressure(done, hint) {
      challengePressure.textContent = done
        ? "\u2713 Presiune mare la T nemărită."
        : hint ||
          "Micșorează volumul fără să crești temperatura (provocare).";
    },
  };
}
