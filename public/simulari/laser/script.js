const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

function resize(){
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resize()
window.addEventListener("resize", resize)

const laserPanel = document.getElementById("laserPanel")
const panelToggle = document.getElementById("panelToggle")
const mqMobilePanel = window.matchMedia("(max-width: 767px)")

function syncLaserPanelUi() {
  if (!laserPanel || !panelToggle) return
  const collapsed = laserPanel.classList.contains("collapsed")
  document.body.classList.toggle("panel-collapsed", collapsed)
  panelToggle.setAttribute("aria-expanded", String(!collapsed))
  panelToggle.setAttribute(
    "aria-label",
    collapsed ? simT("aria.openPanel", "Deschide panoul de controale") : simT("aria.closePanel", "Închide panoul de controale")
  )
}

if (laserPanel && mqMobilePanel.matches) {
  laserPanel.classList.add("collapsed")
}
syncLaserPanelUi()

panelToggle?.addEventListener("click", () => {
  laserPanel?.classList.toggle("collapsed")
  syncLaserPanelUi()
})

const angleSlider = document.getElementById("angle")
const powerSlider = document.getElementById("power")
const toolSelect = document.getElementById("tool")
const addBtn = document.getElementById("add")

const laserSelect = document.getElementById("laserSelect")
const laserTypeSelect = document.getElementById("laserType")
const laserColorSelect = document.getElementById("laserColor")
const addLaserBtn = document.getElementById("addLaser")
const resetLaserBtn = document.getElementById("resetLaser")
const deleteSelectedBtn = document.getElementById("deleteSelected")
const detailsDiv = document.getElementById("details")

const LASER_TYPE_PRESETS = {
  diode: { label: "Diodă", multiplier: 1.0, note: "de bază" },
  hene: { label: "He-Ne", multiplier: 1.1, note: "stabil" },
  argon: { label: "Argon", multiplier: 1.35, note: "mai puternic" },
  fiber: { label: "Fibră", multiplier: 1.55, note: "eficient" },
  yag: { label: "Nd:YAG", multiplier: 1.8, note: "industrial" },
  ruby: { label: "Rubin", multiplier: 2.25, note: "premium" }
}

const LASER_COLOR_PRESETS = {
  red: { label: "Roșu", multiplier: 1.0, wavelength: "650 nm", rgb: [255, 50, 50] },
  green: { label: "Verde", multiplier: 1.35, wavelength: "532 nm", rgb: [80, 255, 110] },
  blue: { label: "Albastru", multiplier: 1.18, wavelength: "450 nm", rgb: [70, 150, 255] },
  violet: { label: "Violet", multiplier: 1.12, wavelength: "405 nm", rgb: [185, 110, 255] },
  yellow: { label: "Galben", multiplier: 1.08, wavelength: "589 nm", rgb: [255, 220, 90] }
}

const BALLOON_PRESETS = {
  balloon_black: { label: "Balon negru", color: [28, 28, 28], absorption: 1.0, popThreshold: 7.0, outline: [90, 90, 90] },
  balloon_red: { label: "Balon roșu", color: [220, 70, 70], absorption: 0.72, popThreshold: 10.0, outline: [255, 170, 170] },
  balloon_blue: { label: "Balon albastru", color: [70, 120, 235], absorption: 0.64, popThreshold: 11.5, outline: [180, 210, 255] },
  balloon_green: { label: "Balon verde", color: [70, 210, 110], absorption: 0.58, popThreshold: 12.5, outline: [170, 255, 195] },
  balloon_yellow: { label: "Balon galben", color: [245, 220, 90], absorption: 0.46, popThreshold: 14.0, outline: [255, 245, 190] },
  balloon_white: { label: "Balon alb", color: [238, 238, 238], absorption: 0.28, popThreshold: 18.0, outline: [255, 255, 255] }
}
const FIREWORK_IGNITION_THRESHOLD = 10.5
const AMBIENT_TEMPERATURE = 24

function simT(path, ro) {
  return typeof window.simLbl === "function" ? window.simLbl(path, ro) : ro
}

function simFmt(path, vars, roTpl) {
  let s = simT(path, roTpl)
  for (const k of Object.keys(vars)) {
    s = s.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]))
  }
  return s
}

function laserTypeLabel(key) {
  const d = LASER_TYPE_PRESETS[key] || LASER_TYPE_PRESETS.diode
  return simT("laserTypes." + key + ".label", d.label)
}

function laserTypeNote(key) {
  const d = LASER_TYPE_PRESETS[key] || LASER_TYPE_PRESETS.diode
  return simT("laserTypes." + key + ".note", d.note)
}

function laserColorLabel(key) {
  const d = LASER_COLOR_PRESETS[key] || LASER_COLOR_PRESETS.red
  return simT("laserColors." + key + ".label", d.label)
}

function toolLabel(typeKey) {
  return simT("tools." + typeKey, typeKey)
}

function populateSelectFromMap(select, source, i18nPrefix) {
  if(!select) return
  select.innerHTML = ""
  for(const [key, data] of Object.entries(source)){
    const opt = document.createElement("option")
    opt.value = key
    opt.textContent = i18nPrefix ? simT(i18nPrefix + "." + key + ".label", data.label) : data.label
    select.appendChild(opt)
  }
}

function getLaserTypeData(l){
  return LASER_TYPE_PRESETS[l.typeKey] || LASER_TYPE_PRESETS.diode
}
function getLaserColorData(l){
  return LASER_COLOR_PRESETS[l.colorKey] || LASER_COLOR_PRESETS.red
}
function getLaserEffectivePower(l){
  return (l.power || 1) * getLaserTypeData(l).multiplier * getLaserColorData(l).multiplier
}
function getLaserBeamRgb(l){
  return getLaserColorData(l).rgb
}
function rgbString(rgb, alpha = 1){
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
}
function getBalloonData(el){
  return BALLOON_PRESETS[el.type] || BALLOON_PRESETS.balloon_red
}

let laser = {
  x: 250,
  y: 300,
  angle: 0,
  burned: false,
  id: "laser-1",
  power: Number(powerSlider?.value) || 8,
  typeKey: "ruby",
  colorKey: "red",
  temperature: AMBIENT_TEMPERATURE
}
const lasers = [laser]
let activeLaserIndex = 0
let laserIdCounter = 2

function degToRad(deg){
  return deg * Math.PI / 180
}
function radToDeg(rad){
  return rad * 180 / Math.PI
}
function normalizeDeg(deg){
  while(deg > 180) deg -= 360
  while(deg < -180) deg += 360
  return deg
}

function renderLaserSelect(){
  if(!laserSelect) return
  laserSelect.innerHTML = ""
  for(let i = 0; i < lasers.length; i++){
    const l = lasers[i]
    const opt = document.createElement("option")
    opt.value = String(i)
    const burned = l.burned ? simT("laserSelect.burnedSuffix", " (ARS)") : ""
    const label =
      simFmt(
        "laserSelect.line",
        { n: i + 1, type: laserTypeLabel(l.typeKey), color: laserColorLabel(l.colorKey) },
        "Laser " + (i + 1) + " - " + getLaserTypeData(l).label + " / " + getLaserColorData(l).label
      ) + burned
    opt.textContent = label
    laserSelect.appendChild(opt)
  }
  laserSelect.value = String(activeLaserIndex)
}

function setActiveLaserIndex(idx){
  activeLaserIndex = idx
  laser = lasers[activeLaserIndex]
  activeElementId = laser.id
  angleSlider.value = Math.round(normalizeDeg(radToDeg(laser.angle)))
  powerSlider.value = String(laser.power || 8)
  if(laserTypeSelect) laserTypeSelect.value = laser.typeKey
  if(laserColorSelect) laserColorSelect.value = laser.colorKey
  renderLaserSelect()
}

// init active laser
populateSelectFromMap(laserTypeSelect, LASER_TYPE_PRESETS, "laserTypes")
populateSelectFromMap(laserColorSelect, LASER_COLOR_PRESETS, "laserColors")
laser.angle = degToRad(Number(angleSlider.value) || 0)
angleSlider.value = Math.round(normalizeDeg(radToDeg(laser.angle)))
powerSlider.value = String(laser.power || 8)
if(laserTypeSelect) laserTypeSelect.value = laser.typeKey
if(laserColorSelect) laserColorSelect.value = laser.colorKey
renderLaserSelect()

const BURN_POWER_THRESHOLD = 10  // putere >= 10 și fasciculul intoars pe lentilă = ars
const MIRROR_REFLECTIVITY = 0.99
const CURVED_MIRROR_REFLECTIVITY = 0.985
angleSlider.addEventListener("input", () => {
  laser.angle = angleSlider.value * Math.PI / 180
})
powerSlider?.addEventListener("input", () => {
  laser.power = Number(powerSlider.value) || 1
})

laserSelect?.addEventListener("change", () => {
  const idx = parseInt(laserSelect.value, 10)
  if(!Number.isNaN(idx)) setActiveLaserIndex(idx)
})

laserTypeSelect?.addEventListener("change", () => {
  laser.typeKey = laserTypeSelect.value
  renderLaserSelect()
})

laserColorSelect?.addEventListener("change", () => {
  laser.colorKey = laserColorSelect.value
  renderLaserSelect()
})

addLaserBtn?.addEventListener("click", () => {
  const base = lasers[activeLaserIndex]
  const nl = {
    x: Math.min(canvas.width - 80, Math.max(80, base.x + 90)),
    y: Math.min(canvas.height - 80, Math.max(80, base.y + 30)),
    angle: base.angle,
    burned: false,
    id: "laser-" + laserIdCounter++,
    power: base.power,
    typeKey: base.typeKey,
    colorKey: base.colorKey,
    temperature: AMBIENT_TEMPERATURE
  }
  lasers.push(nl)
  activeLaserIndex = lasers.length - 1
  laser = lasers[activeLaserIndex]
  activeElementId = laser.id
  powerSlider.value = String(laser.power || 8)
  if(laserTypeSelect) laserTypeSelect.value = laser.typeKey
  if(laserColorSelect) laserColorSelect.value = laser.colorKey
  renderLaserSelect()
  if(laserSelect) laserSelect.value = String(activeLaserIndex)
  angleSlider.value = Math.round(normalizeDeg(radToDeg(laser.angle)))
})

resetLaserBtn?.addEventListener("click", () => {
  lasers[activeLaserIndex].burned = false
  renderLaserSelect()
})

function deleteSelected(){
  if(!activeElementId) return
  const laserIdx = lasers.findIndex(l => l.id === activeElementId)
  if(laserIdx >= 0){
    if(lasers.length === 1) return
    lasers.splice(laserIdx, 1)
    if(activeLaserIndex >= lasers.length) activeLaserIndex = lasers.length - 1
    setActiveLaserIndex(activeLaserIndex)
    activeDragId = null
    activeRotateId = null
    activeLaserDrag = false
    activeLaserRotate = false
    renderLaserSelect()
    return
  }

  const idx = elements.findIndex(e => e.id === activeElementId)
  if(idx >= 0){
    elements.splice(idx, 1)
    activeElementId = null
    activeDragId = null
    activeRotateId = null
    activeLaserDrag = false
    activeLaserRotate = false
  }
}

deleteSelectedBtn?.addEventListener("click", deleteSelected)
window.addEventListener("keydown", (evt) => {
  if(evt.key !== "Delete") return
  // nu ștergem dacă focus e pe un input
  const tag = (evt.target && evt.target.tagName) ? evt.target.tagName.toLowerCase() : ""
  if(tag === "input" || tag === "select" || tag === "textarea") return
  deleteSelected()
})

// ELEMENTS (mirrors / prism) + DRAG
const elements = []
let activeDragId = null
let dragOffsetX = 0
let dragOffsetY = 0
let activeElementId = null
let activeRotateId = null
let activeLaserDrag = false
let activeLaserRotate = false
let detectorReadings = {}  // id -> total power received (filled in drawBeam)

function randId(){
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function addElement(type){
  const el = {
    id: randId(),
    type,
    x: Math.min(canvas.width - 80, Math.max(80, canvas.width * 0.6)),
    y: Math.min(canvas.height - 80, Math.max(80, canvas.height * 0.5)),
    angle: 0
  }
  if (type === "lens_converging" || type === "lens_diverging") el.focalLength = 120
  if (type.startsWith("balloon_")) {
    el.radius = 26
    el.popped = false
    el.popBurstUntil = 0
  }
  if (type === "firework") {
    el.ignited = false
    el.exploded = false
    el.ignitedAt = 0
    el.particles = []
    el.fuseProgress = 0
  }
  elements.push(el)
}

addBtn?.addEventListener("click", () => {
  addElement(toolSelect?.value || "mirror_flat")
})

function getPointerPos(evt){
  const rect = canvas.getBoundingClientRect()
  const x = (evt.clientX - rect.left) * (canvas.width / rect.width)
  const y = (evt.clientY - rect.top) * (canvas.height / rect.height)
  return { x, y }
}

function rotatePoint(px, py, angle){
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return { x: px * c - py * s, y: px * s + py * c }
}

function getRotateHandleLocalOffset(el){
  if(el.type === "prism") return { x: 0, y: -70 }
  if(el.type === "lens_converging" || el.type === "lens_diverging") return { x: 55, y: 0 }
  if(el.type === "beamsplitter") return { x: 0, y: -90 }
  if(el.type === "detector") return { x: 42, y: 0 }
  if(el.type === "firework") return { x: 0, y: -72 }
  if(el.type === "protractor") return { x: 0, y: -145 }
  return { x: 0, y: -90 }
}

function getRotateHandleWorldPos(el){
  const o = getRotateHandleLocalOffset(el)
  const r = rotatePoint(o.x, o.y, el.angle)
  return { x: el.x + r.x, y: el.y + r.y }
}

function hitTestRotateHandle(el, px, py){
  const h = getRotateHandleWorldPos(el)
  const dx = px - h.x
  const dy = py - h.y
  const rr = 11
  return (dx*dx + dy*dy) <= (rr*rr)
}

function getLaserHandleWorldPos(){
  const o = rotatePoint(0, -55, laser.angle)
  return { x: laser.x + o.x, y: laser.y + o.y }
}

function hitTestLaserHandle(px, py){
  const h = getLaserHandleWorldPos()
  const dx = px - h.x
  const dy = py - h.y
  const rr = 11
  return (dx*dx + dy*dy) <= (rr*rr)
}

function hitTestLaserBody(px, py){
  const lx = px - laser.x
  const ly = py - laser.y
  const p = rotatePoint(lx, ly, -laser.angle)
  return p.x >= -45 && p.x <= 55 && p.y >= -28 && p.y <= 28
}

function angleBetween(a, start, end){
  // normalize to (-PI, PI]
  const wrap = (v) => {
    v = (v + Math.PI) % (Math.PI * 2)
    if(v < 0) v += Math.PI * 2
    return v - Math.PI
  }
  a = wrap(a); start = wrap(start); end = wrap(end)
  if(start <= end) return a >= start && a <= end
  return a >= start || a <= end
}

function hitTestElement(el, px, py){
  const lx = px - el.x
  const ly = py - el.y
  const p = rotatePoint(lx, ly, -el.angle)

  if(el.type === "mirror_flat"){
    // capsule hit around a 200px segment centered at origin
    const half = 100
    const thickness = 16
    const dx = Math.max(Math.abs(p.x) - half, 0)
    const dy = Math.max(Math.abs(p.y) - thickness, 0)
    return (dx*dx + dy*dy) <= (thickness*thickness)
  }

  if(el.type === "mirror_concave" || el.type === "mirror_convex"){
    const radius = 140
    const thickness = 14
    const convex = el.type === "mirror_convex"
    const start = convex ? Math.PI * 0.75 : -Math.PI * 0.25
    const end = convex ? Math.PI * 1.25 : Math.PI * 0.25
    const r = Math.hypot(p.x, p.y)
    const a = Math.atan2(p.y, p.x)
    return Math.abs(r - radius) <= thickness && angleBetween(a, start, end)
  }

  if(el.type === "prism"){
    return p.x >= -55 && p.x <= 55 && p.y >= -45 && p.y <= 45
  }

  if(el.type === "lens_converging" || el.type === "lens_diverging"){
    const L = 50
    const thickness = 18
    return Math.abs(p.x) <= thickness && p.y >= -L && p.y <= L
  }

  if(el.type === "beamsplitter"){
    const half = 100, thickness = 20
    return Math.abs(p.x) <= half && Math.abs(p.y) <= thickness
  }

  if(el.type === "detector"){
    const W = 36, H = 18
    return p.x >= -W && p.x <= W && p.y >= -H && p.y <= H
  }

  if(el.type.startsWith("balloon_")){
    if(el.popped) return false
    const r = el.radius || 26
    return (p.x * p.x + p.y * p.y) <= r * r
  }

  if(el.type === "firework"){
    const bodyHit = p.x >= -8 && p.x <= 8 && p.y >= -26 && p.y <= 16
    const fuseDx = p.x - 0
    const fuseDy = p.y + 30
    const fuseHit = (fuseDx * fuseDx + fuseDy * fuseDy) <= 8 * 8
    return bodyHit || fuseHit
  }

  if(el.type === "protractor"){
    const R = 128
    if (p.x * p.x + p.y * p.y > R * R) return false
    return p.y >= -12
  }

  return false
}

function getElementAt(px, py){
  for(let i = elements.length - 1; i >= 0; i--){
    if(hitTestElement(elements[i], px, py)) return elements[i]
  }
  return null
}

canvas.addEventListener("mousedown", (evt) => {
  const {x, y} = getPointerPos(evt)

  // laser rotate handle / body first
  {
    const savedLaser = laser
    for(let i = lasers.length - 1; i >= 0; i--){
      laser = lasers[i]
      if(hitTestLaserHandle(x, y)){
        activeLaserIndex = i
        activeElementId = laser.id
        activeLaserRotate = true
        activeLaserDrag = false
        return
      }
      if(hitTestLaserBody(x, y)){
        activeLaserIndex = i
        activeElementId = laser.id
        activeLaserDrag = true
        activeLaserRotate = false
        dragOffsetX = x - laser.x
        dragOffsetY = y - laser.y
        return
      }
    }
    laser = savedLaser
  }

  // if an element is selected, allow grabbing rotate handle
  if(activeElementId && activeElementId !== laser.id){
    const selected = elements.find(e => e.id === activeElementId)
    if(selected && hitTestRotateHandle(selected, x, y)){
      activeRotateId = selected.id
      return
    }
  }

  const el = getElementAt(x, y)
  if(!el){
    activeElementId = null
    return
  }

  activeDragId = el.id
  activeElementId = el.id
  dragOffsetX = x - el.x
  dragOffsetY = y - el.y
})

window.addEventListener("mousemove", (evt) => {
  const {x, y} = getPointerPos(evt)

  if(activeLaserRotate){
    const dx = x - laser.x
    const dy = y - laser.y
    laser.angle = Math.atan2(dy, dx) + Math.PI/2
    angleSlider.value = Math.round(laser.angle * 180 / Math.PI)
    return
  }

  if(activeLaserDrag){
    laser.x = x - dragOffsetX
    laser.y = y - dragOffsetY
    return
  }

  if(activeRotateId){
    const el = elements.find(e => e.id === activeRotateId)
    if(!el) return

    const dx = x - el.x
    const dy = y - el.y
    // handle base is at local (0, negative) => base angle is -PI/2
    el.angle = Math.atan2(dy, dx) + Math.PI/2
    return
  }

  if(!activeDragId) return
  const el = elements.find(e => e.id === activeDragId)
  if(!el) return

  el.x = x - dragOffsetX
  el.y = y - dragOffsetY
})

window.addEventListener("mouseup", () => {
  activeDragId = null
  activeRotateId = null
  activeLaserDrag = false
  activeLaserRotate = false
})

canvas.addEventListener("wheel", (evt) => {
  if(!activeElementId) return
  evt.preventDefault()

  const baseStep = evt.shiftKey ? 0.02 : 0.08
  const dir = evt.deltaY > 0 ? 1 : -1

  if(activeElementId === laser.id){
    laser.angle += dir * baseStep
    angleSlider.value = Math.round(laser.angle * 180 / Math.PI)
    return
  }

  const el = elements.find(e => e.id === activeElementId)
  if(!el) return
  el.angle += dir * baseStep
}, { passive: false })

function drawElement(el){
  ctx.save()
  ctx.translate(el.x, el.y)
  ctx.rotate(el.angle)

  if(el.type === "mirror_flat"){
    ctx.strokeStyle = "rgba(207,216,255,0.35)"
    ctx.lineWidth = 10
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(-100, 0)
    ctx.lineTo(100, 0)
    ctx.stroke()

    ctx.strokeStyle = "rgba(255,255,255,0.08)"
    ctx.lineWidth = 22
    ctx.beginPath()
    ctx.moveTo(-100, 0)
    ctx.lineTo(100, 0)
    ctx.stroke()
  }else if(el.type === "mirror_concave" || el.type === "mirror_convex"){
    const convex = el.type === "mirror_convex"
    ctx.strokeStyle = "rgba(207,216,255,0.35)"
    ctx.lineWidth = 10
    ctx.lineCap = "round"
    ctx.beginPath()
    const radius = 140
    const start = convex ? Math.PI * 0.75 : -Math.PI * 0.25
    const end = convex ? Math.PI * 1.25 : Math.PI * 0.25
    ctx.arc(0, 0, radius, start, end)
    ctx.stroke()

    ctx.strokeStyle = "rgba(255,255,255,0.07)"
    ctx.lineWidth = 22
    ctx.beginPath()
    ctx.arc(0, 0, radius, start, end)
    ctx.stroke()
  }else if(el.type === "prism"){
    ctx.fillStyle = "rgba(80,160,255,0.12)"
    ctx.strokeStyle = "rgba(160,220,255,0.7)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-55, 45)
    ctx.lineTo(55, 45)
    ctx.lineTo(0, -45)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (el.type === "lens_converging" || el.type === "lens_diverging") {
    const L = 50
    const w = 10
    const R = Math.hypot(w, L)
    const converging = el.type === "lens_converging"
    ctx.fillStyle = "rgba(200,230,255,0.25)"
    ctx.strokeStyle = "rgba(180,220,255,0.9)"
    ctx.lineWidth = 2
    ctx.beginPath()
    if (converging) {
      ctx.arc(-w, 0, R, Math.atan2(-L, w), Math.atan2(L, w))
      ctx.arc(w, 0, R, Math.atan2(L, -w), Math.atan2(-L, -w))
    } else {
      ctx.arc(w, 0, R, Math.atan2(L, w), Math.atan2(-L, w))
      ctx.arc(-w, 0, R, Math.atan2(-L, -w), Math.atan2(L, -w))
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else if (el.type === "beamsplitter") {
    const half = 100
    ctx.fillStyle = "rgba(220,240,255,0.35)"
    ctx.strokeStyle = "rgba(180,210,255,0.7)"
    ctx.lineWidth = 2
    ctx.fillRect(-half, -8, half * 2, 16)
    ctx.strokeRect(-half, -8, half * 2, 16)
  } else if (el.type === "detector") {
    const W = 36, H = 18
    ctx.fillStyle = "rgba(40,45,55,0.95)"
    ctx.strokeStyle = "rgba(100,220,140,0.9)"
    ctx.lineWidth = 2
    ctx.fillRect(-W, -H, W * 2, H * 2)
    ctx.strokeRect(-W, -H, W * 2, H * 2)
    ctx.fillStyle = "rgba(80,255,120,0.4)"
    ctx.fillRect(-W + 4, -H + 4, W * 2 - 8, H * 2 - 8)
  } else if (el.type.startsWith("balloon_")) {
    const r = el.radius || 26
    const b = getBalloonData(el)
    if (!el.popped) {
      ctx.fillStyle = rgbString(b.color, 0.95)
      ctx.strokeStyle = rgbString(b.outline, 0.9)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.strokeStyle = "rgba(255,255,255,0.22)"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(-7, -7, r * 0.35, Math.PI * 1.1, Math.PI * 1.8)
      ctx.stroke()
      ctx.strokeStyle = "rgba(220,220,220,0.7)"
      ctx.beginPath()
      ctx.moveTo(0, r)
      ctx.lineTo(0, r + 16)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, r + 16)
      ctx.lineTo(-5, r + 26)
      ctx.lineTo(3, r + 34)
      ctx.stroke()
    } else {
      const burstAlpha = el.popBurstUntil ? Math.max(0, Math.min(1, (el.popBurstUntil - Date.now()) / 1200)) : 0.6
      if (burstAlpha <= 0) {
        ctx.restore()
        return
      }
      ctx.strokeStyle = rgbString(b.outline, burstAlpha)
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4)
        ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22)
        ctx.stroke()
      }
    }
  } else if (el.type === "firework") {
    if (!el.exploded) {
      ctx.strokeStyle = "rgba(170,120,80,0.95)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 16)
      ctx.lineTo(0, 48)
      ctx.stroke()

      ctx.fillStyle = "rgba(180,40,40,0.95)"
      ctx.strokeStyle = "rgba(255,210,120,0.9)"
      ctx.lineWidth = 1.5
      ctx.fillRect(-8, -26, 16, 42)
      ctx.strokeRect(-8, -26, 16, 42)

      ctx.strokeStyle = "rgba(250,220,120,0.9)"
      ctx.beginPath()
      ctx.moveTo(0, -26)
      ctx.quadraticCurveTo(10, -32, 0, -38)
      ctx.stroke()
      if (el.ignited) {
        ctx.fillStyle = "rgba(255,180,40,0.95)"
        ctx.beginPath()
        ctx.arc(0, -38, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (el.type === "protractor") {
    const R = 120
    ctx.fillStyle = "rgba(255,255,240,0.12)"
    ctx.strokeStyle = "rgba(240,240,200,0.9)"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI)
    ctx.lineTo(-R, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = "rgba(255,255,220,0.85)"
    ctx.lineWidth = 1.5
    for (let deg = 1; deg < 180; deg++) {
      const a = (deg * Math.PI) / 180
      const is5 = deg % 5 === 0
      const is10 = deg % 10 === 0
      const r1 = is10 ? R - 18 : (is5 ? R - 10 : R - 5)
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R)
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(-R, 0)
    ctx.lineTo(R, 0)
    ctx.stroke()
    ctx.fillStyle = "rgba(255,255,230,0.95)"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    for (let deg = 0; deg <= 180; deg += 10) {
      const a = (deg * Math.PI) / 180
      const rr = R - 32
      ctx.save()
      ctx.translate(Math.cos(a) * rr, Math.sin(a) * rr)
      ctx.rotate(a)
      ctx.fillText(deg + "°", 0, 0)
      ctx.restore()
    }
  }

  ctx.restore()

  if (el.type === "protractor") {
    ctx.save()
    ctx.translate(el.x, el.y)
    ctx.fillStyle = "rgba(255,255,220,0.75)"
    ctx.font = "11px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(simT("protractor.hint", "0° pe linie — rotește și măsoară pe arc"), 0, 38)
    ctx.restore()
  }

  if (el.type === "firework" && Array.isArray(el.particles) && el.particles.length > 0) {
    ctx.save()
    for (const p of el.particles) {
      ctx.fillStyle = rgbString(p.color, Math.max(0, p.life))
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  if (el.type === "detector") {
    const reads = detectorReadings[el.id]
    const initialPower = getLaserEffectivePower(laser)
    let totalPower = 0
    let intensity = 0
    let interferenceInfo = ""
    const LAMBDA_PX = 80
    if (Array.isArray(reads) && reads.length > 0) {
      totalPower = reads.reduce((s, r) => s + r.power, 0)
      let re = 0, im = 0
      for (const r of reads) {
        const phase = (2 * Math.PI * r.pathLength) / LAMBDA_PX
        const amp = Math.sqrt(r.power)
        re += amp * Math.cos(phase)
        im += amp * Math.sin(phase)
      }
      const I_combined = re * re + im * im
      intensity = initialPower > 0 ? (I_combined / (initialPower * initialPower)) : 0
      if (reads.length >= 2) {
        const delta = Math.abs(reads[0].pathLength - reads[1].pathLength)
        const phaseDiff = (2 * Math.PI * delta) / LAMBDA_PX
        const cosD = Math.cos(phaseDiff)
        interferenceInfo = cosD > 0.5 ? simT("detector.interferenceConstructive", " (constructiv)") : cosD < -0.5 ? simT("detector.interferenceDestructive", " (destructiv)") : simT("detector.interferenceMixed", " (interferență)")
      }
    }
    const powerMw = totalPower * 0.4
    ctx.save()
    ctx.translate(el.x, el.y)
    ctx.rotate(el.angle)
    ctx.fillStyle = "rgba(200,255,220,0.95)"
    ctx.font = "12px monospace"
    ctx.textAlign = "center"
    ctx.fillText(
      simFmt(
        "detector.intensityLine",
        { v: intensity.toFixed(2), interfer: interferenceInfo },
        "Intensity: " + intensity.toFixed(2) + interferenceInfo
      ),
      0,
      -28
    )
    ctx.fillText(
      simFmt("detector.powerLine", { v: powerMw.toFixed(1) }, "Power: " + powerMw.toFixed(1) + " mW"),
      0,
      -14
    )
    ctx.fillText(simT("detector.lambdaLine", "λ: 632 nm"), 0, 0)
    ctx.restore()
  }

  if(activeElementId === el.id){
    const h = getRotateHandleWorldPos(el)
    ctx.save()
    ctx.strokeStyle = "rgba(255,255,255,0.22)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(el.x, el.y)
    ctx.lineTo(h.x, h.y)
    ctx.stroke()

    ctx.fillStyle = "rgba(255,255,255,0.10)"
    ctx.strokeStyle = "rgba(207,216,255,0.70)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(h.x, h.y, 10, 0, Math.PI*2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
}

// DRAW DEVICE
function drawDevice(){

ctx.save()

ctx.translate(laser.x,laser.y)
ctx.rotate(laser.angle)

// body
ctx.fillStyle = laser.burned ? "#222" : "#333"
ctx.fillRect(-40,-20,80,40)

// front ring / lentila
ctx.fillStyle = laser.burned ? "#1a0a0a" : "#555"
ctx.beginPath()
ctx.arc(40,0,10,0,Math.PI*2)
ctx.fill()
if (laser.burned) {
  ctx.strokeStyle = "rgba(80,0,0,0.9)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(40,0,10,0,Math.PI*2)
  ctx.stroke()
  ctx.fillStyle = "rgba(40,0,0,0.6)"
  ctx.beginPath()
  ctx.arc(42,0,4,0,Math.PI*2)
  ctx.fill()
  ctx.fillStyle = "#2a0a0a"
  ctx.font = "10px sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(simT("device.burnedLabel", "ARS"), 0, 5)
} else {
  const beamRgb = getLaserBeamRgb(laser)
  ctx.fillStyle = rgbString(beamRgb, 1)
  ctx.beginPath()
  ctx.arc(42,0,4,0,Math.PI*2)
  ctx.fill()
}

ctx.restore()

ctx.save()
ctx.translate(laser.x, laser.y)
ctx.fillStyle = laser.temperature >= 220 ? "rgba(255,120,90,0.95)" : laser.temperature >= 100 ? "rgba(255,210,110,0.95)" : "rgba(180,220,255,0.95)"
ctx.font = "12px monospace"
ctx.textAlign = "center"
ctx.fillText(`${(laser.temperature || AMBIENT_TEMPERATURE).toFixed(0)}°C`, 0, -34)
ctx.restore()

if(activeElementId === laser.id){
  const h = getLaserHandleWorldPos()
  ctx.save()
  ctx.strokeStyle = "rgba(255,255,255,0.22)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(laser.x, laser.y)
  ctx.lineTo(h.x, h.y)
  ctx.stroke()

  ctx.fillStyle = "rgba(255,255,255,0.10)"
  ctx.strokeStyle = "rgba(255,120,120,0.70)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(h.x, h.y, 10, 0, Math.PI*2)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

}

// DRAW LASER
function drawBeam(){

if(laser.burned) return

let angle = laser.angle
let power = getLaserEffectivePower(laser)
const beamRgb = getLaserBeamRgb(laser)

let startX = laser.x + Math.cos(angle)*42
let startY = laser.y + Math.sin(angle)*42

const maxBounces = 10  // suficient pentru ricosele TIR în prismă
const maxLen = 2500
const eps = 0.0001

function reflect(d, n){
  const dot = d.x * n.x + d.y * n.y
  return { x: d.x - 2 * dot * n.x, y: d.y - 2 * dot * n.y }
}

function intersectFlatMirror(el, ox, oy, dx, dy){
  const lx = ox - el.x
  const ly = oy - el.y
  const o = rotatePoint(lx, ly, -el.angle)
  const d = rotatePoint(dx, dy, -el.angle)

  if(Math.abs(d.y) < 1e-8) return null
  const t = -o.y / d.y
  if(t <= eps) return null

  const xHit = o.x + d.x * t
  const half = 100
  if(xHit < -half || xHit > half) return null

  const hitLocal = { x: xHit, y: 0 }
  const hitWorldRel = rotatePoint(hitLocal.x, hitLocal.y, el.angle)
  const hit = { x: el.x + hitWorldRel.x, y: el.y + hitWorldRel.y }

  // local normal is (0, 1); rotate to world
  const n = rotatePoint(0, 1, el.angle)
  return { t, hit, n }
}

function intersectBeamSplitter(el, ox, oy, dx, dy) {
  const res = intersectFlatMirror(el, ox, oy, dx, dy)
  if (!res) return null
  return { ...res, beamsplitter: true }
}

function intersectArcMirror(el, ox, oy, dx, dy){
  const radius = 140
  const lx = ox - el.x
  const ly = oy - el.y
  const o = rotatePoint(lx, ly, -el.angle)
  const d = rotatePoint(dx, dy, -el.angle)

  // ray-circle intersection in local space: |o + t*d|^2 = radius^2
  const A = d.x*d.x + d.y*d.y
  const B = 2 * (o.x*d.x + o.y*d.y)
  const C = o.x*o.x + o.y*o.y - radius*radius
  const disc = B*B - 4*A*C
  if(disc < 0) return null

  const s = Math.sqrt(disc)
  const t1 = (-B - s) / (2*A)
  const t2 = (-B + s) / (2*A)
  const t = (t1 > eps) ? t1 : (t2 > eps ? t2 : null)
  if(!t) return null

  const p = { x: o.x + d.x*t, y: o.y + d.y*t }
  const r = Math.hypot(p.x, p.y)
  if(r < 1e-6) return null
  // ensure we're on the circle (numerical tolerance)
  if(Math.abs(r - radius) > 2) return null

  const convex = el.type === "mirror_convex"
  const start = convex ? Math.PI * 0.75 : -Math.PI * 0.25
  const end = convex ? Math.PI * 1.25 : Math.PI * 0.25
  const a = Math.atan2(p.y, p.x)
  if(!angleBetween(a, start, end)) return null

  // front-face: ray must hit the reflective side (normal points toward ray origin)
  // convex: surface bulges out, normal = p/r (away from center). Need dot(n, -d) > 0 => p·d < 0
  // concave: bowl inward, normal = -p/r (toward center). Need dot(n, -d) > 0 => p·d > 0
  const pDotD = p.x*d.x + p.y*d.y
  if(convex && pDotD >= 0) return null
  if(!convex && pDotD <= 0) return null

  const hitWorldRel = rotatePoint(p.x, p.y, el.angle)
  const hit = { x: el.x + hitWorldRel.x, y: el.y + hitWorldRel.y }

  const nl = convex ? { x: p.x/r, y: p.y/r } : { x: -p.x/r, y: -p.y/r }
  const n = rotatePoint(nl.x, nl.y, el.angle)
  return { t, hit, n }
}

// Prism: triunghi A=(-55,45), B=(55,45), C=(0,-45); y crește în jos, baza e jos, vârful sus
// Normală outward = din prismă spre exterior (pentru Snell: n în mediul de unde vine raza)
const PRISM_VERTS = [
  { x: -55, y: 45 },
  { x: 55, y: 45 },
  { x: 0, y: -45 }
]
const PRISM_EDGES = [
  { i: 0, j: 1, n: { x: 0, y: 1 } },     // AB baza (jos): exterior e dedesubt → n = (0,1)
  { i: 1, j: 2, n: { x: -90, y: 55 } },  // BC: exterior în dreapta-jos
  { i: 2, j: 0, n: { x: -90, y: -55 } }  // CA: exterior în stânga-jos
]
const N_GLASS = 1.52  // sticlă tipică, deviație ~37–40°
// Reflexie totală internă (TIR): θc = arcsin(n2/n1). Pentru sticlă→aer: θc ≈ 41.1°
const CRITICAL_ANGLE_GLASS_AIR = Math.asin(1 / N_GLASS)

function norm2(x, y) {
  const L = Math.hypot(x, y)
  return L > 1e-8 ? { x: x/L, y: y/L } : { x: 0, y: 0 }
}
PRISM_EDGES[1].n = norm2(PRISM_EDGES[1].n.x, PRISM_EDGES[1].n.y)
PRISM_EDGES[2].n = norm2(PRISM_EDGES[2].n.x, PRISM_EDGES[2].n.y)

function pointInTriangleLocal(px, py, el) {
  const ax = PRISM_VERTS[0].x, ay = PRISM_VERTS[0].y
  const bx = PRISM_VERTS[1].x, by = PRISM_VERTS[1].y
  const cx = PRISM_VERTS[2].x, cy = PRISM_VERTS[2].y
  const sign = (x1, y1, x2, y2, x3, y3) => (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3)
  const d1 = sign(px, py, ax, ay, bx, by)
  const d2 = sign(px, py, bx, by, cx, cy)
  const d3 = sign(px, py, cx, cy, ax, ay)
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)
  return !(hasNeg && hasPos)
}

function intersectPrism(el, ox, oy, dx, dy) {
  const lx = ox - el.x
  const ly = oy - el.y
  const o = rotatePoint(lx, ly, -el.angle)
  const d = rotatePoint(dx, dy, -el.angle)

  let best = null
  const entering = !pointInTriangleLocal(o.x, o.y, el)

  for (let e = 0; e < 3; e++) {
    const E = PRISM_EDGES[e]
    const p0 = PRISM_VERTS[E.i]
    const p1 = PRISM_VERTS[E.j]
    const ex = p1.x - p0.x
    const ey = p1.y - p0.y
    const den = d.x * ey - d.y * ex
    if (Math.abs(den) < 1e-10) continue
    const t = ((p0.x - o.x) * ey - (p0.y - o.y) * ex) / den
    if (t <= eps) continue
    const hx = o.x + d.x * t
    const hy = o.y + d.y * t
    const s = Math.abs(ex) > Math.abs(ey) ? (hx - p0.x) / ex : (hy - p0.y) / ey
    if (s < -0.001 || s > 1.001) continue

    // front-face: normală trebuie să fie spre mediul de unde vine raza (pentru Snell)
    const toOriginX = o.x - hx
    const toOriginY = o.y - hy
    if (entering) {
      if (E.n.x * toOriginX + E.n.y * toOriginY <= 0) continue
    } else {
      if (-E.n.x * toOriginX - E.n.y * toOriginY <= 0) continue
    }

    const hitWorldRel = rotatePoint(hx, hy, el.angle)
    const hit = { x: el.x + hitWorldRel.x, y: el.y + hitWorldRel.y }
    const nl = entering ? { x: E.n.x, y: E.n.y } : { x: -E.n.x, y: -E.n.y }
    const n = rotatePoint(nl.x, nl.y, el.angle)
    if (!best || t < best.t) best = { t, hit, n, refract: true, entering }
  }
  return best
}

// Snell: n1*sin(theta1) = n2*sin(theta2). n = normală unitară în mediul de unde vine raza.
function refract(d, n, n1, n2) {
  const eta = n1 / n2
  const nd = n.x * d.x + n.y * d.y
  const c1 = -nd
  const c2 = 1 - eta * eta * (1 - c1 * c1)
  if (c2 < 0) return reflect(d, n)
  const c = eta * c1 - Math.sqrt(c2)
  const rx = eta * d.x + c * n.x
  const ry = eta * d.y + c * n.y
  const len = Math.hypot(rx, ry) || 1
  return { x: rx / len, y: ry / len }
}

// Fresnel (Schlick): fracțiune reflectată R ≈ R0 + (1-R0)(1-cos θ)^5. cosIncidence = -d·n.
function fresnelReflectance(cosIncidence, n1, n2) {
  const r0 = ((n1 - n2) / (n1 + n2)) ** 2
  const c = Math.max(0, cosIncidence)
  return r0 + (1 - r0) * Math.pow(1 - c, 5)
}

// Lentilă subțire: 1/f = 1/do + 1/di. Apertură = segment vertical în local (axa optică = Ox).
const LENS_HALF = 50

function intersectLensElement(el, ox, oy, dx, dy) {
  const lx = ox - el.x
  const ly = oy - el.y
  const o = rotatePoint(lx, ly, -el.angle)
  const d = rotatePoint(dx, dy, -el.angle)
  if (Math.abs(d.x) < 1e-10) return null
  const t = -o.x / d.x
  if (t <= eps) return null
  const yHit = o.y + d.y * t
  if (yHit < -LENS_HALF || yHit > LENS_HALF) return null
  const hitLocal = { x: 0, y: yHit }
  const hitWorldRel = rotatePoint(hitLocal.x, hitLocal.y, el.angle)
  const hit = { x: el.x + hitWorldRel.x, y: el.y + hitWorldRel.y }
  const f = el.focalLength || 120
  const fromLeft = o.x < 0
  const converging = el.type === "lens_converging"
  let dxOut, dyOut
  if (converging) {
    const fx = fromLeft ? f : -f
    const l = Math.hypot(fx, -yHit) || 1
    dxOut = fx / l
    dyOut = -yHit / l
  } else {
    const fx = fromLeft ? -f : f
    const l = Math.hypot(fx, yHit) || 1
    dxOut = -fx / l
    dyOut = yHit / l
  }
  const outWorld = rotatePoint(dxOut, dyOut, el.angle)
  const len = Math.hypot(outWorld.x, outWorld.y) || 1
  return { t, hit, lens: true, lensDir: { x: outWorld.x / len, y: outWorld.y / len } }
}

const DETECTOR_W = 36
const DETECTOR_H = 18

function intersectDetector(el, ox, oy, dx, dy) {
  const lx = ox - el.x
  const ly = oy - el.y
  const o = rotatePoint(lx, ly, -el.angle)
  const d = rotatePoint(dx, dy, -el.angle)
  const W = DETECTOR_W
  const H = DETECTOR_H
  let tLo = -Infinity
  let tHi = Infinity
  if (Math.abs(d.x) >= 1e-10) {
    const t1 = (-W - o.x) / d.x
    const t2 = (W - o.x) / d.x
    tLo = Math.min(t1, t2)
    tHi = Math.max(t1, t2)
  } else if (o.x < -W || o.x > W) return null
  if (Math.abs(d.y) >= 1e-10) {
    const t1 = (-H - o.y) / d.y
    const t2 = (H - o.y) / d.y
    const tyLo = Math.min(t1, t2)
    const tyHi = Math.max(t1, t2)
    tLo = Math.max(tLo, tyLo)
    tHi = Math.min(tHi, tyHi)
  } else if (o.y < -H || o.y > H) return null
  if (tLo > tHi || tHi < eps) return null
  const t = tLo > eps ? tLo : tHi
  if (t <= eps) return null
  const hx = o.x + d.x * t
  const hy = o.y + d.y * t
  const hitWorldRel = rotatePoint(hx, hy, el.angle)
  const hit = { x: el.x + hitWorldRel.x, y: el.y + hitWorldRel.y }
  return { t, hit, detector: true }
}

function intersectBalloon(el, ox, oy, dx, dy) {
  if (el.popped) return null
  const r = el.radius || 26
  const ux = ox - el.x
  const uy = oy - el.y
  const A = dx * dx + dy * dy
  const B = 2 * (ux * dx + uy * dy)
  const C = ux * ux + uy * uy - r * r
  const disc = B * B - 4 * A * C
  if (disc < 0) return null
  const s = Math.sqrt(disc)
  const t1 = (-B - s) / (2 * A)
  const t2 = (-B + s) / (2 * A)
  const t = (t1 > eps) ? t1 : (t2 > eps ? t2 : null)
  if (t == null) return null
  return {
    t,
    hit: { x: ox + dx * t, y: oy + dy * t },
    balloon: true
  }
}

function intersectFirework(el, ox, oy, dx, dy) {
  if (el.exploded) return null
  const lx = ox - el.x
  const ly = oy - el.y
  const o = rotatePoint(lx, ly, -el.angle)
  const d = rotatePoint(dx, dy, -el.angle)
  const cx = 0
  const cy = -38
  const r = 7
  const ux = o.x - cx
  const uy = o.y - cy
  const A = d.x * d.x + d.y * d.y
  const B = 2 * (ux * d.x + uy * d.y)
  const C = ux * ux + uy * uy - r * r
  const disc = B * B - 4 * A * C
  if (disc < 0) return null
  const s = Math.sqrt(disc)
  const t1 = (-B - s) / (2 * A)
  const t2 = (-B + s) / (2 * A)
  const t = (t1 > eps) ? t1 : (t2 > eps ? t2 : null)
  if (t == null) return null
  return {
    t,
    hit: { x: ox + dx * t, y: oy + dy * t },
    firework: true
  }
}

function findNearestHit(ox, oy, dx, dy){
  let best = null
  for(const el of elements){
    let res = null
    if(el.type === "mirror_flat") res = intersectFlatMirror(el, ox, oy, dx, dy)
    else if(el.type === "mirror_concave" || el.type === "mirror_convex") res = intersectArcMirror(el, ox, oy, dx, dy)
    else if(el.type === "prism") res = intersectPrism(el, ox, oy, dx, dy)
    else if(el.type === "lens_converging" || el.type === "lens_diverging") res = intersectLensElement(el, ox, oy, dx, dy)
    else if(el.type === "beamsplitter") res = intersectBeamSplitter(el, ox, oy, dx, dy)
    else if(el.type === "detector") res = intersectDetector(el, ox, oy, dx, dy)
    else if(el.type.startsWith("balloon_")) res = intersectBalloon(el, ox, oy, dx, dy)
    else if(el.type === "firework") res = intersectFirework(el, ox, oy, dx, dy)
    if(!res) continue
    if(!best || res.t < best.t) best = { ...res, el }
  }
  return best
}

function intersectLaserLens(targetLaser, ox, oy, dx, dy) {
  const lx = ox - targetLaser.x
  const ly = oy - targetLaser.y
  const o = rotatePoint(lx, ly, -targetLaser.angle)
  const d = rotatePoint(dx, dy, -targetLaser.angle)

  // Lentila este în fața laserului; ca să "intre prin lentilă",
  // raza trebuie să vină dinspre față spre interiorul laserului.
  if (d.x >= -0.05) return null

  const cx = 42
  const cy = 0
  const R = 10
  const ux = o.x - cx
  const uy = o.y - cy
  const A = d.x * d.x + d.y * d.y
  const B = 2 * (ux * d.x + uy * d.y)
  const C = ux * ux + uy * uy - R * R
  const disc = B * B - 4 * A * C
  if (disc < 0) return null

  const s = Math.sqrt(disc)
  const t1 = (-B - s) / (2 * A)
  const t2 = (-B + s) / (2 * A)
  const minT = targetLaser.id === laser.id ? 20 : 0.5
  const t = (t1 > minT) ? t1 : (t2 > minT ? t2 : null)
  if (t == null) return null

  const hitLocal = { x: o.x + d.x * t, y: o.y + d.y * t }
  const hitWorldRel = rotatePoint(hitLocal.x, hitLocal.y, targetLaser.angle)
  return {
    t,
    hit: { x: targetLaser.x + hitWorldRel.x, y: targetLaser.y + hitWorldRel.y },
    targetLaser
  }
}

function findNearestLaserLensHit(ox, oy, dx, dy) {
  let best = null
  for (const target of lasers) {
    const res = intersectLaserLens(target, ox, oy, dx, dy)
    if (!res) continue
    if (!best || res.t < best.t) best = res
  }
  return best
}

detectorReadings = {}

const allPaths = []  // { segments, power } - fiecare cale (refractată + reflectată Fresnel)
const MAX_RAYS = 40  // limită ca să nu explodeze numărul de raze

// coadă: { ox, oy, dir, power, remaining, segments, bounces, pathLength? }
let queue = [{
  ox: startX, oy: startY,
  dir: { x: Math.cos(angle), y: Math.sin(angle) },
  power, remaining: maxLen, segments: [], bounces: 0, pathLength: 0
}]

while (queue.length > 0 && allPaths.length < MAX_RAYS) {
  const ray = queue.shift()
  let { ox, oy, dir, power, remaining, segments, bounces } = ray
  if (power < 0.3 || bounces >= maxBounces) {
    if (segments.length > 0) allPaths.push({ segments, power: ray.power })
    continue
  }

  const hit = findNearestHit(ox, oy, dir.x, dir.y)
  const lensHit = findNearestLaserLensHit(ox, oy, dir.x, dir.y)
  const maxDist = hit ? Math.min(hit.t, remaining) : remaining
  if (lensHit && lensHit.t < maxDist && lensHit.t > 0) {
    segments = [...segments, { x1: ox, y1: oy, x2: lensHit.hit.x, y2: lensHit.hit.y }]
    if (power >= BURN_POWER_THRESHOLD) {
      lensHit.targetLaser.burned = true
      renderLaserSelect()
    }
    allPaths.push({ segments, power })
    continue
  }
  if (!hit || hit.t > remaining) {
    segments = [...segments, { x1: ox, y1: oy, x2: ox + dir.x * remaining, y2: oy + dir.y * remaining }]
    allPaths.push({ segments, power })
    continue
  }

  const segToHit = { x1: ox, y1: oy, x2: hit.hit.x, y2: hit.hit.y }
  const nextRemaining = remaining - hit.t
  const step = 2
  const nextBounces = bounces + 1

  if (hit.detector) {
    const pathLen = (ray.pathLength !== undefined ? ray.pathLength : 0) + hit.t
    if (!detectorReadings[hit.el.id]) detectorReadings[hit.el.id] = []
    detectorReadings[hit.el.id].push({ power, pathLength: pathLen })
    allPaths.push({ segments: [...segments, segToHit], power })
    continue
  }

  if (hit.balloon) {
    const balloonData = getBalloonData(hit.el)
    const absorbedPower = power * balloonData.absorption
    if (absorbedPower >= balloonData.popThreshold) {
      hit.el.popped = true
      hit.el.popBurstUntil = Date.now() + 1200
    }
    allPaths.push({ segments: [...segments, segToHit], power })
    continue
  }

  if (hit.firework) {
    if (!hit.el.ignited && !hit.el.exploded && power >= FIREWORK_IGNITION_THRESHOLD) {
      hit.el.ignited = true
      hit.el.ignitedAt = Date.now()
    }
    allPaths.push({ segments: [...segments, segToHit], power })
    continue
  }

  if (hit.beamsplitter) {
    const R = 0.5
    const T = 0.5
    const reflDir = reflect(dir, hit.n)
    const rLen = Math.hypot(reflDir.x, reflDir.y) || 1
    queue.push({
      ox: hit.hit.x + (reflDir.x / rLen) * step,
      oy: hit.hit.y + (reflDir.y / rLen) * step,
      dir: { x: reflDir.x / rLen, y: reflDir.y / rLen },
      power: power * R, remaining: nextRemaining, bounces: nextBounces,
      segments: [...segments, segToHit],
      pathLength: (ray.pathLength !== undefined ? ray.pathLength : 0) + hit.t
    })
    queue.push({
      ox: hit.hit.x + dir.x * step,
      oy: hit.hit.y + dir.y * step,
      dir: { x: dir.x, y: dir.y },
      power: power * T, remaining: nextRemaining, bounces: nextBounces,
      segments: [...segments, segToHit],
      pathLength: (ray.pathLength !== undefined ? ray.pathLength : 0) + hit.t
    })
    continue
  }

  const nextPathLen = (ray.pathLength !== undefined ? ray.pathLength : 0) + hit.t

  if (hit.lens) {
    queue.push({
      ox: hit.hit.x + hit.lensDir.x * step,
      oy: hit.hit.y + hit.lensDir.y * step,
      dir: hit.lensDir,
      power, remaining: nextRemaining, bounces: nextBounces,
      segments: [...segments, segToHit], pathLength: nextPathLen
    })
  } else if (hit.refract) {
    const n1 = hit.entering ? 1 : N_GLASS
    const n2 = hit.entering ? N_GLASS : 1
    const cosIncidence = -(dir.x * hit.n.x + dir.y * hit.n.y)
    const refractedDir = refract(dir, hit.n, n1, n2)
    // TIR: sin(θ1) > n2/n1 ⇒ nu mai refractă, doar reflectă (ricosează în prismă)
    const isTIR = (1 - (n1 / n2) ** 2 * (1 - cosIncidence * cosIncidence)) < 0
    segToHit.tir = isTIR && !hit.entering
    if (isTIR) {
      const reflDir = reflect(dir, hit.n)
      const len = Math.hypot(reflDir.x, reflDir.y) || 1
      queue.push({
        ox: hit.hit.x + (reflDir.x / len) * step,
        oy: hit.hit.y + (reflDir.y / len) * step,
        dir: { x: reflDir.x / len, y: reflDir.y / len },
        power, remaining: nextRemaining, bounces: nextBounces,
        segments: [...segments, segToHit], pathLength: nextPathLen
      })
    } else {
      const R = fresnelReflectance(cosIncidence, n1, n2)
      const reflDir = reflect(dir, hit.n)
      const rLen = Math.hypot(reflDir.x, reflDir.y) || 1
      const tLen = Math.hypot(refractedDir.x, refractedDir.y) || 1
      queue.push({
        ox: hit.hit.x + (reflDir.x / rLen) * step,
        oy: hit.hit.y + (reflDir.y / rLen) * step,
        dir: { x: reflDir.x / rLen, y: reflDir.y / rLen },
        power: power * R, remaining: nextRemaining, bounces: nextBounces,
        segments: [...segments, segToHit], pathLength: nextPathLen
      })
      queue.push({
        ox: hit.hit.x + (refractedDir.x / tLen) * step,
        oy: hit.hit.y + (refractedDir.y / tLen) * step,
        dir: { x: refractedDir.x / tLen, y: refractedDir.y / tLen },
        power: power * (1 - R), remaining: nextRemaining, bounces: nextBounces,
        segments: [...segments, segToHit], pathLength: nextPathLen
      })
    }
  } else {
    const reflDir = reflect(dir, hit.n)
    const len = Math.hypot(reflDir.x, reflDir.y) || 1
    let reflectedPower = power
    if (hit.el?.type === "mirror_flat") reflectedPower *= MIRROR_REFLECTIVITY
    else if (hit.el?.type === "mirror_concave" || hit.el?.type === "mirror_convex") reflectedPower *= CURVED_MIRROR_REFLECTIVITY
    queue.push({
      ox: hit.hit.x + (reflDir.x / len) * step,
      oy: hit.hit.y + (reflDir.y / len) * step,
      dir: { x: reflDir.x / len, y: reflDir.y / len },
      power: reflectedPower, remaining: nextRemaining, bounces: nextBounces,
      segments: [...segments, segToHit], pathLength: nextPathLen
    })
  }
}

// Desenăm toate căile; segmentele TIR (ricoseale în prismă) în portocaliu
for (const { segments: segs, power: p } of allPaths) {
  const effectivePower = Math.max(1, Math.round(p))
  for (let i = 0; i < effectivePower; i++) {
    ctx.lineWidth = 1 + i * 3
    ctx.globalAlpha = 0.03
    let px = null, py = null
    for (const s of segs) {
      ctx.strokeStyle = s.tir ? "rgba(224,120,32,1)" : rgbString(beamRgb, 1)
      ctx.beginPath()
      if (px !== null) ctx.moveTo(px, py)
      else ctx.moveTo(s.x1, s.y1)
      ctx.lineTo(s.x2, s.y2)
      ctx.stroke()
      px = s.x2
      py = s.y2
    }
  }
}

ctx.globalAlpha=1

}

// GRID
function drawGrid(){

ctx.strokeStyle="#111"

for(let x=0;x<canvas.width;x+=80){

ctx.beginPath()
ctx.moveTo(x,0)
ctx.lineTo(x,canvas.height)
ctx.stroke()

}

for(let y=0;y<canvas.height;y+=80){

ctx.beginPath()
ctx.moveTo(0,y)
ctx.lineTo(canvas.width,y)
ctx.stroke()

}

}

let lastDetailsUpdate = 0
let lastAnimationTs = 0

function updateLaserTemperatures(dt){
  for(const l of lasers){
    const target = l.burned
      ? Math.max(160, AMBIENT_TEMPERATURE + getLaserEffectivePower(l) * 22)
      : AMBIENT_TEMPERATURE + getLaserEffectivePower(l) * 9
    const response = l.burned ? 1.6 : 1.1
    l.temperature += (target - l.temperature) * Math.min(1, dt * response)
  }
}

function explodeFirework(el){
  el.exploded = true
  el.ignited = false
  el.particles = []
  for(let i = 0; i < 28; i++){
    const a = (i / 28) * Math.PI * 2 + Math.random() * 0.25
    const speed = 70 + Math.random() * 120
    const palette = [
      [255, 90, 90],
      [255, 220, 90],
      [110, 180, 255],
      [140, 255, 180],
      [255, 140, 255]
    ]
    el.particles.push({
      x: el.x,
      y: el.y - 24,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 1,
      color: palette[i % palette.length]
    })
  }
}

function updateFireworks(dt, now){
  for(const el of elements){
    if(el.type !== "firework") continue
    if(el.ignited && !el.exploded && now - el.ignitedAt > 700){
      explodeFirework(el)
    }
    if(Array.isArray(el.particles) && el.particles.length > 0){
      el.particles = el.particles.filter((p) => {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 220 * dt
        p.life -= dt * 0.9
        return p.life > 0
      })
    }
  }
}

function updateDetails(){
  if(!detailsDiv) return
  const now = Date.now()
  if(now - lastDetailsUpdate < 160) return
  lastDetailsUpdate = now

  const activeL = lasers[activeLaserIndex]
  const activeDeg = Math.round(normalizeDeg(radToDeg(activeL.angle)))
  const colorData = getLaserColorData(activeL)
  const basePower = Number(activeL.power || 0)
  const effectivePower = getLaserEffectivePower(activeL)
  const temperature = Number(activeL.temperature || AMBIENT_TEMPERATURE)

  let selectedEl = null
  if(activeElementId && activeElementId !== activeL.id){
    selectedEl = elements.find(e => e.id === activeElementId) || null
  }

  const typeMult = getLaserTypeData(activeL).multiplier
  const lines = []
  const burnedActive = activeL.burned ? simT("details.burnedTag", " (ARS)") : ""
  lines.push(simFmt("details.active", { id: activeL.id, burned: burnedActive }, "Activ: " + activeL.id + (activeL.burned ? " (ARS)" : "")))
  lines.push(simFmt("details.position", { x: Math.round(activeL.x), y: Math.round(activeL.y) }, "Pozitie: x=" + Math.round(activeL.x) + ", y=" + Math.round(activeL.y)))
  lines.push(simFmt("details.angle", { deg: activeDeg }, "Unghi: " + activeDeg + "°"))
  lines.push(simFmt("details.typeLine", { label: laserTypeLabel(activeL.typeKey), mult: typeMult.toFixed(2) }, "Tip: " + getLaserTypeData(activeL).label + " x" + typeMult.toFixed(2)))
  lines.push(simFmt("details.colorLine", { label: laserColorLabel(activeL.colorKey), wl: colorData.wavelength, mult: colorData.multiplier.toFixed(2) }, "Culoare: " + colorData.label + " (" + colorData.wavelength + ") x" + colorData.multiplier.toFixed(2)))
  lines.push(simFmt("details.basePower", { v: basePower.toFixed(1) }, "Putere bază: " + basePower.toFixed(1)))
  lines.push(simFmt("details.effPower", { v: effectivePower.toFixed(1) }, "Putere efectivă: " + effectivePower.toFixed(1)))
  lines.push(simFmt("details.temp", { v: temperature.toFixed(1) }, "Temperatură: " + temperature.toFixed(1) + "°C"))
  const rubyX = activeL.typeKey === "ruby" ? simT("details.rubyExtra", " - cel mai puternic din listă") : ""
  lines.push(simFmt("details.noteLine", { note: laserTypeNote(activeL.typeKey), ruby: rubyX }, "Notă: " + getLaserTypeData(activeL).note + (activeL.typeKey === "ruby" ? " - cel mai puternic din listă" : "")))
  lines.push(simFmt("details.opticsCount", { n: elements.length }, "Optică: " + elements.length + " elemente"))

  if(selectedEl){
    const deg = Math.round(normalizeDeg(radToDeg(selectedEl.angle)))
    lines.push(simFmt("details.selectedHeader", { type: toolLabel(selectedEl.type) }, "Selectat: " + selectedEl.type))
    lines.push(simFmt("details.selectedPos", { x: Math.round(selectedEl.x), y: Math.round(selectedEl.y) }, "  poziție x=" + Math.round(selectedEl.x) + " y=" + Math.round(selectedEl.y)))
    lines.push(simFmt("details.selectedAngle", { deg }, "  unghi=" + deg + "°"))
    if(selectedEl.type === "firework"){
      lines.push(
        selectedEl.exploded
          ? simT("details.fireworkExploded", "  fitil=explodat")
          : selectedEl.ignited
            ? simT("details.fireworkLit", "  fitil=aprins")
            : simT("details.fireworkCold", "  fitil=stins")
      )
    }
  } else {
    lines.push(simT("details.noneSelected", "Selectat: (nimic optic)"))
  }

  const laserStates = lasers.map((l, i) => {
    const d = Math.round(normalizeDeg(radToDeg(l.angle)))
    const burned = l.burned ? simT("details.burnedShort", " ARS") : ""
    return simFmt(
      "details.laserListItem",
      { n: i + 1, type: laserTypeLabel(l.typeKey), color: laserColorLabel(l.colorKey), deg: d, burned },
      "L" + (i + 1) + ":" + getLaserTypeData(l).label + "/" + getLaserColorData(l).label + " " + d + "°" + (l.burned ? " ARS" : "")
    )
  })
  lines.push(simT("details.laserListPrefix", "Laser listă: ") + laserStates.join(" | "))

  detailsDiv.textContent = lines.join("\n")
}

// ANIMATION
function animate(ts = 0){
const dt = lastAnimationTs ? Math.min(0.05, (ts - lastAnimationTs) / 1000) : 0.016
lastAnimationTs = ts

ctx.fillStyle="black"
ctx.fillRect(0,0,canvas.width,canvas.height)

updateLaserTemperatures(dt)
updateFireworks(dt, ts)

drawGrid()
const activeLaser = lasers[activeLaserIndex]
// 1) tragem fasciculele și dispozitivele pentru toate laserele
for(const l of lasers){
  laser = l
  drawBeam()
  drawDevice()
}
// 2) desenăm elementele optice (inclusiv raportor) folosind laserul activ
laser = activeLaser
for(const el of elements) drawElement(el)

updateDetails()

requestAnimationFrame(animate)

}

animate()