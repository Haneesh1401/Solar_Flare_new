// =====================================
// GLOBAL SHARED SIMULATION STATE
// =====================================
// Ensuring the animation can read the dashboard state
if (!window.simulationState) {
    window.simulationState = {
        flareIntensity: 0.2,
        riskLevel: "STABLE"
    };
}

// ============================
// SOLAR FLARE SIMULATION
// ============================
const solarCanvas = document.getElementById("solarCanvas");
const sCtx = solarCanvas.getContext("2d");

let angleOffset = 0;
let shockwaveRadius = 0;

// ============================
// CME PARTICLE SYSTEM
// ============================
let cmeParticles = [];
let cmeActive = false;
let cmeDirection = Math.PI / 4;

// ML-driven value (fallback if backend not ready)
function getFlareIntensity() {
    return window.simulationState?.flareIntensity ?? 0.2;
}

// =====================================
// CME TARGET DIRECTION (SUN → EARTH)
// =====================================
function getEarthDirectionFromSun() {
    const sunCanvasRect = solarCanvas.getBoundingClientRect();
    const earthCanvas = document.getElementById("spaceCanvas");
    const earthRect = earthCanvas.getBoundingClientRect();

    const sunX = sunCanvasRect.left + solarCanvas.width / 2;
    const sunY = sunCanvasRect.top + solarCanvas.height / 2;

    const earthXGlobal = earthRect.left + earthCanvas.width / 2;
    const earthYGlobal = earthRect.top + earthCanvas.height / 2;

    const dx = earthXGlobal - sunX;
    const dy = earthYGlobal - sunY;

    return Math.atan2(dy, dx);
}

function maybeTriggerCME() {
    const intensity = getFlareIntensity();

    if (intensity > 0.7 && !cmeActive && Math.random() < 0.01) {
        cmeActive = true;
        cmeDirection = getEarthDirectionFromSun();
        cmeParticles = [];

        const particleCount = 120 + Math.floor(intensity * 200);

        for (let i = 0; i < particleCount; i++) {
            cmeParticles.push({
                angle: cmeDirection + (Math.random() - 0.5) * 0.8,
                radius: 60,
                speed: 2 + Math.random() * 4 + intensity * 5,
                size: Math.random() * 3 + 1,
                alpha: 1
            });
        }
    }
}

// ---------- SUN ----------
function drawSun() {
    // Dynamic Center point based on current canvas size
    const centerX = solarCanvas.width / 2;
    const centerY = solarCanvas.height / 2;
    
    const flareIntensity = getFlareIntensity();
    const t = Date.now() * 0.0015;

    // =====================================================
    // LAYER 0 — BACK SHADOW (DEPTH)
    // =====================================================
    sCtx.beginPath();
    sCtx.fillStyle = "rgba(0,0,0,0.4)";
    sCtx.arc(centerX, centerY, 110, 0, Math.PI * 2);
    sCtx.fill();

    // =====================================================
    // LAYER 1 — WHITE HOT CORE
    // =====================================================
    const coreRadius = 45 + Math.sin(t * 2.0) * 4 + flareIntensity * 10;

    const coreGradient = sCtx.createRadialGradient(
        centerX - 8, centerY - 8, 4,
        centerX, centerY, coreRadius
    );

    coreGradient.addColorStop(0.0, "#ffffff");
    coreGradient.addColorStop(0.25, "#fffde7");
    coreGradient.addColorStop(0.45, "#fff59d");
    coreGradient.addColorStop(0.65, "#ffeb3b");
    coreGradient.addColorStop(0.85, "#ffb300");
    coreGradient.addColorStop(1.0, "#ff8f00");

    sCtx.fillStyle = coreGradient;
    sCtx.beginPath();
    sCtx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    sCtx.fill();

    // =====================================================
    // LAYER 2 — INNER PLASMA SHELL
    // =====================================================
    const plasmaRadius = 70 + Math.sin(t) * 3;

    const plasmaGradient = sCtx.createRadialGradient(
        centerX, centerY, coreRadius * 0.8,
        centerX, centerY, plasmaRadius
    );

    plasmaGradient.addColorStop(0.0, "rgba(255,200,0,0.0)");
    plasmaGradient.addColorStop(0.4, "rgba(255,180,0,0.4)");
    plasmaGradient.addColorStop(0.8, "rgba(255,140,0,0.7)");
    plasmaGradient.addColorStop(1.0, "rgba(200,80,0,0.9)");

    sCtx.fillStyle = plasmaGradient;
    sCtx.beginPath();
    sCtx.arc(centerX, centerY, plasmaRadius, 0, Math.PI * 2);
    sCtx.fill();

    // =====================================================
    // LAYER 3 — SURFACE GRANULATION (TEXTURE)
    // =====================================================
    for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (plasmaRadius - 10);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        const grainSize = Math.random() * 2 + 0.5;

        sCtx.beginPath();
        sCtx.fillStyle = "rgba(255,255,255,0.05)";
        sCtx.arc(x, y, grainSize, 0, Math.PI * 2);
        sCtx.fill();
    }

    // =====================================================
    // LAYER 4 — CORONA GLOW
    // =====================================================
    const coronaRadius = plasmaRadius + 20 + flareIntensity * 50;
    const coronaGradient = sCtx.createRadialGradient(
        centerX, centerY, plasmaRadius,
        centerX, centerY, coronaRadius
    );

    coronaGradient.addColorStop(0.0, "rgba(255,160,0,0.4)");
    coronaGradient.addColorStop(0.5, "rgba(255,100,0,0.15)");
    coronaGradient.addColorStop(1.0, "rgba(255,60,0,0.0)");

    sCtx.fillStyle = coronaGradient;
    sCtx.beginPath();
    sCtx.arc(centerX, centerY, coronaRadius, 0, Math.PI * 2);
    sCtx.fill();
}

// ---------- MAGNETIC FLARES ----------
function drawFlareArcs() {
    const centerX = solarCanvas.width / 2;
    const centerY = solarCanvas.height / 2;
    const flareIntensity = getFlareIntensity();
    const time = Date.now() * 0.001;

    const flareCount = Math.floor(3 + flareIntensity * 8);

    for (let i = 0; i < flareCount; i++) {
        const baseAngle = angleOffset + (Math.PI * 2 * i / flareCount);
        const separation = 0.3 + Math.sin(time + i) * 0.1;

        const a1 = baseAngle - separation;
        const a2 = baseAngle + separation;
        const surfaceRadius = 65;

        const x1 = centerX + Math.cos(a1) * surfaceRadius;
        const y1 = centerY + Math.sin(a1) * surfaceRadius;
        const x2 = centerX + Math.cos(a2) * surfaceRadius;
        const y2 = centerY + Math.sin(a2) * surfaceRadius;

        const loopHeight = 20 + flareIntensity * 80 + Math.sin(time * 2 + i) * 10;
        const midAngle = (a1 + a2) / 2;
        const cx = centerX + Math.cos(midAngle) * (surfaceRadius + loopHeight);
        const cy = centerY + Math.sin(midAngle) * (surfaceRadius + loopHeight);

        sCtx.strokeStyle = `rgba(255, ${150 - i * 10}, 50, ${0.4 + flareIntensity * 0.5})`;
        sCtx.lineWidth = 1.5 + flareIntensity * 2;
        sCtx.beginPath();
        sCtx.moveTo(x1, y1);
        sCtx.quadraticCurveTo(cx, cy, x2, y2);
        sCtx.stroke();
    }
}

function drawCME() {
    if (!cmeActive) return;
    const centerX = solarCanvas.width / 2;
    const centerY = solarCanvas.height / 2;

    for (let i = 0; i < cmeParticles.length; i++) {
        const p = cmeParticles[i];
        p.radius += p.speed;
        p.alpha -= 0.005;

        const x = centerX + Math.cos(p.angle) * p.radius;
        const y = centerY + Math.sin(p.angle) * p.radius;

        sCtx.fillStyle = `rgba(255, ${180 + Math.random() * 75}, 50, ${p.alpha})`;
        sCtx.beginPath();
        sCtx.arc(x, y, p.size, 0, Math.PI * 2);
        sCtx.fill();
    }
    cmeParticles = cmeParticles.filter(p => p.alpha > 0);
    if (cmeParticles.length === 0) cmeActive = false;
}

function animateSolar() {
    sCtx.clearRect(0, 0, solarCanvas.width, solarCanvas.height);
    
    maybeTriggerCME();
    drawSun();
    drawFlareArcs();
    drawCME();

    angleOffset += 0.005 + getFlareIntensity() * 0.02;
    requestAnimationFrame(animateSolar);
}

// ============================
// SATELLITE ORBIT SIMULATION
// ============================
const spaceCanvas = document.getElementById("spaceCanvas");
const spaceCtx = spaceCanvas.getContext("2d");

const satellites = [
    { angle: 0, radius: 70, signal: 100, alive: true, rotation: 0, spin: 0.01, panelAngle: 0 },
    { angle: 2.1, radius: 100, signal: 100, alive: true, rotation: 0, spin: 0.012, panelAngle: 0 },
    { angle: 4.3, radius: 135, signal: 100, alive: true, rotation: 0, spin: 0.008, panelAngle: 0 }
];

function drawEarth() {
    const ex = spaceCanvas.width / 2;
    const ey = spaceCanvas.height / 2;
    const flareIntensity = getFlareIntensity();

    // Core
    const earthRadius = 24;
    const earthGradient = spaceCtx.createRadialGradient(ex - 5, ey - 5, 2, ex, ey, earthRadius);
    earthGradient.addColorStop(0, "#4fc3f7");
    earthGradient.addColorStop(0.5, "#1565c0");
    earthGradient.addColorStop(1, "#0d47a1");

    spaceCtx.fillStyle = earthGradient;
    spaceCtx.beginPath();
    spaceCtx.arc(ex, ey, earthRadius, 0, Math.PI * 2);
    spaceCtx.fill();

    // Atmosphere
    const atmosphereGradient = spaceCtx.createRadialGradient(ex, ey, earthRadius, ex, ey, earthRadius + 10);
    atmosphereGradient.addColorStop(0, "rgba(100,200,255,0.3)");
    atmosphereGradient.addColorStop(1, "rgba(100,200,255,0)");
    spaceCtx.fillStyle = atmosphereGradient;
    spaceCtx.beginPath();
    spaceCtx.arc(ex, ey, earthRadius + 10, 0, Math.PI * 2);
    spaceCtx.fill();

    // Magnetosphere
    const shieldRadius = earthRadius + 15 - flareIntensity * 5;
    spaceCtx.strokeStyle = `rgba(0, 242, 255, ${0.3 - flareIntensity * 0.2})`;
    spaceCtx.lineWidth = 1;
    spaceCtx.beginPath();
    spaceCtx.arc(ex, ey, shieldRadius, 0, Math.PI * 2);
    spaceCtx.stroke();
}

function drawSatellite(x, y, sat) {
    spaceCtx.save();
    spaceCtx.translate(x, y);
    spaceCtx.rotate(sat.rotation);

    const dead = !sat.alive;
    
    // Body
    spaceCtx.fillStyle = dead ? "#444" : "#aaa";
    spaceCtx.fillRect(-5, -5, 10, 10);
    
    // Panels
    spaceCtx.save();
    spaceCtx.rotate(sat.panelAngle);
    spaceCtx.fillStyle = dead ? "#222" : "#1565c0";
    spaceCtx.fillRect(-15, -3, 8, 6);
    spaceCtx.fillRect(7, -3, 8, 6);
    spaceCtx.restore();

    // Status Light
    if (!dead) {
        const pulse = (Math.sin(Date.now() * 0.01) + 1) / 2;
        spaceCtx.fillStyle = sat.signal < 50 ? `rgba(255,0,0,${pulse})` : `rgba(0,255,0,${pulse})`;
        spaceCtx.beginPath();
        spaceCtx.arc(0, 0, 2, 0, Math.PI * 2);
        spaceCtx.fill();
    }

    spaceCtx.restore();
}

function animateSpace() {
    spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
    const ex = spaceCanvas.width / 2;
    const ey = spaceCanvas.height / 2;
    const flareIntensity = getFlareIntensity();

    drawEarth();

    satellites.forEach((sat, index) => {
        // Orbit Motion
        sat.angle += 0.005 + (flareIntensity * 0.01);
        const sx = ex + Math.cos(sat.angle) * sat.radius;
        const sy = ey + Math.sin(sat.angle) * sat.radius;

        // Visual orientation
        sat.rotation += sat.spin;
        sat.panelAngle += 0.02;

        // Degradation Logic
        if (flareIntensity > 0.8) {
            sat.signal -= 0.1;
            if (sat.signal < 5 && Math.random() < 0.001) sat.alive = false;
        } else {
            sat.signal = Math.min(100, sat.signal + 0.05);
        }

        drawSatellite(sx, sy, sat);
    });

    requestAnimationFrame(animateSpace);
}

// ============================
// START ANIMATIONS
// ============================
animateSolar();
animateSpace();