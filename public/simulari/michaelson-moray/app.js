function simLbl(path, fallback) {
  return typeof window.simLbl === "function" ? window.simLbl(path, fallback) : fallback;
}

const c = 299792458;
const fringes = document.getElementById("fringes");
const ctx = fringes.getContext("2d");
const graph = document.getElementById("graph");
const gctx = graph.getContext("2d");

const Lslider = document.getElementById("L");
const vslider = document.getElementById("v");
const lambdaslider = document.getElementById("lambda");
const speedSlider = document.getElementById("speed");
const densitySlider = document.getElementById("density");
const opacitySlider = document.getElementById("opacity");

const Lval = document.getElementById("Lval");
const vval = document.getElementById("vval");
const lamval = document.getElementById("lamval");
const speedVal = document.getElementById("speedVal");
const densityVal = document.getElementById("densityVal");
const opacityVal = document.getElementById("opacityVal");

const angleVal = document.getElementById("angleVal");
const phaseVal = document.getElementById("phaseVal");
const shiftVal = document.getElementById("shiftVal");

// theory readouts
const thL = document.getElementById("thL");
const thV = document.getElementById("thV");
const thLam = document.getElementById("thLam");
const thDt = document.getElementById("thDt");
const thN = document.getElementById("thN");
const thPhi = document.getElementById("thPhi");

const toggle = document.getElementById("toggle");
const reset = document.getElementById("reset");
const random = document.getElementById("random");
const rot90 = document.getElementById("rot90");
const saveBtn = document.getElementById("save");

const arm1 = document.getElementById("arm1");
const arm2 = document.getElementById("arm2");
const relativistic = document.getElementById("relativistic");
const noiseSlider = document.getElementById("noise");
const noiseVal = document.getElementById("noiseVal");

let running = true;
let theta = 0;
let phaseData = [];

function wavelengthToRGB(w) {
  let R=0,G=0,B=0;
  if (w>=380 && w<440) {R=-(w-440)/(440-380); B=1;}
  else if (w<490){G=(w-440)/(490-440); B=1;}
  else if (w<510){G=1; B=-(w-510)/(510-490);}
  else if (w<580){R=(w-510)/(580-510); G=1;}
  else if (w<645){R=1; G=-(w-645)/(645-580);}
  else if (w<=780){R=1;}
  return [R*255,G*255,B*255];
}

function drawInterference(L,v_km,λnm,θ,periodPx,alpha){
  const v = v_km*1000;
  const λ = λnm*1e-9;
  const n = (2*L*v*v)/(λ*c*c);
  const Δφ = n*2*Math.PI*Math.cos(2*θ);
  const W=fringes.width,H=fringes.height;
  const img = ctx.createImageData(W,H);
  const col = wavelengthToRGB(λnm);
  const noiseAmp = parseFloat(noiseSlider.value);
  for(let x=0;x<W;x++){
    const φ = (relativistic.checked ? 0 : Δφ) + 2*Math.PI*(x/periodPx);
    let I = 0.5*(1+Math.cos(φ));
    if(noiseAmp>0){
      I = Math.min(1, Math.max(0, I + (Math.random()-0.5)*2*noiseAmp));
    }
    const r = Math.floor(col[0]*I);
    const g = Math.floor(col[1]*I);
    const b = Math.floor(col[2]*I);
    for(let y=0;y<H;y++){
      const i=(y*W+x)*4;
      img.data[i]=r; img.data[i+1]=g; img.data[i+2]=b; img.data[i+3]=Math.floor(255*alpha);
    }
  }
  ctx.putImageData(img,0,0);
  angleVal.textContent = `${(θ*180/Math.PI).toFixed(1)}°`;
  phaseVal.textContent = Δφ.toExponential(3);
  shiftVal.textContent = n.toExponential(3);
  return Δφ;
}

function rotateArms(θ){
  const L=100;
  const x1=125+L*Math.cos(θ), y1=125+L*Math.sin(θ);
  const x2=125+L*Math.cos(θ+Math.PI/2), y2=125+L*Math.sin(θ+Math.PI/2);
  arm1.setAttribute("x2",x1);
  arm1.setAttribute("y2",y1);
  arm2.setAttribute("x2",x2);
  arm2.setAttribute("y2",y2);
}

function drawGraph(){
  gctx.clearRect(0,0,graph.width,graph.height);
  gctx.strokeStyle="#38bdf8";
  gctx.beginPath();
  gctx.moveTo(0,graph.height/2);
  for(let i=0;i<phaseData.length;i++){
    const y = graph.height/2 - (phaseData[i]/Math.PI)*30;
    gctx.lineTo(i, y);
  }
  gctx.stroke();
}

function update(){
  const L=parseFloat(Lslider.value);
  const v=parseFloat(vslider.value);
  const λ=parseFloat(lambdaslider.value);
  const speed=parseFloat(speedSlider.value);
  const periodPx=parseFloat(densitySlider.value);
  const alpha=parseFloat(opacitySlider.value);
  noiseVal.textContent=noiseSlider.value;
  if(running) theta += 0.01*speed;
  Lval.textContent=L;
  vval.textContent=v;
  lamval.textContent=`${λ} nm`;
  speedVal.textContent=`${speed.toFixed(1)}×`;
  densityVal.textContent=`${periodPx} px`;
  opacityVal.textContent=`${Math.round(alpha*100)}%`;
  const φ=drawInterference(L,v,λ,theta,periodPx,alpha);
  rotateArms(theta);
  phaseData.push(φ);
  if(phaseData.length>graph.width) phaseData.shift();
  drawGraph();

  // update theory block (max values for 90° rotation)
  const v_si = v*1000;
  const lam_si = λ*1e-9;
  const dt_max = (2*L*v_si*v_si)/(c*c*c);
  const N_max = (2*L*v_si*v_si)/(lam_si*c*c);
  const phi_max = 2*Math.PI*N_max;
  thL.textContent=L.toFixed(2);
  thV.textContent=v.toFixed(0);
  thLam.textContent=`${λ.toFixed(0)}`;
  thDt.textContent=dt_max.toExponential(3);
  thN.textContent=N_max.toExponential(3);
  thPhi.textContent=phi_max.toExponential(3);
  requestAnimationFrame(update);
}

toggle.onclick = () => {
  running = !running;
  toggle.textContent = running
    ? simLbl("buttons.pause", "⏸ Pauză")
    : simLbl("buttons.play", "▶️ Rulează");
};
reset.onclick=()=>{theta=0;phaseData=[];};
random.onclick=()=>{lambdaslider.value=Math.floor(400+Math.random()*300);};
rot90.onclick=()=>{theta+=Math.PI/2;};
saveBtn.onclick=()=>{
  const a=document.createElement('a');
  a.download=`fringes_${Date.now()}.png`;
  a.href=fringes.toDataURL('image/png');
  a.click();
};

update();
