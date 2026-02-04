// =====================================
// GLOBAL SHARED SIMULATION STATE
// =====================================
window.simulationState = {
    flareIntensity: 0.2,   
    riskLevel: "STABLE",
    lastUpdate: new Date().toLocaleTimeString()
};

const API_URL = "http://127.0.0.1:8000/predict";
const SMOOTHING_ALPHA = 0.25;

// Memory for the Risk Trend Graph - Increased to 60 points for better visibility
let riskHistory = new Array(60).fill(0.1); 
let scrollOffset = 0; 

// =====================================
// CORE UI ELEMENTS
// =====================================
const UI = {
    riskArc: document.getElementById("risk-arc"),
    riskPercent: document.getElementById("risk-percent"),
    riskLabel: document.getElementById("risk-label"),
    alertBox: document.getElementById("alert-box"),
    navLinks: document.querySelectorAll(".nav-links a"),
    timeDisplay: document.getElementById("utcTime"),
    rawRisk: document.getElementById("rawRisk"),
    calibratedRisk: document.getElementById("calibratedRisk"),
    latency: document.getElementById("latency"),
    oodStatus: document.getElementById("oodStatus"),
    solarContainer: document.getElementById("solar-canvas-container"),
    satContainer: document.getElementById("satellite-zone"),
    trendCanvas: document.getElementById("riskTrendCanvas")
};

// =====================================
// ANIMATED TREND GRAPH ENGINE
// =====================================
function animateTrendGraph() {
    if (!UI.trendCanvas) return;
    const ctx = UI.trendCanvas.getContext("2d");
    
    // Set internal resolution to match CSS display size
    UI.trendCanvas.width = UI.trendCanvas.offsetWidth;
    UI.trendCanvas.height = UI.trendCanvas.offsetHeight;
    
    const w = UI.trendCanvas.width;
    const h = UI.trendCanvas.height;
    const paddingLeft = 50; 
    const paddingBottom = 25; 
    const chartW = w - paddingLeft - 20;
    const chartH = h - paddingBottom - 20;
    
    // Smooth scrolling increment
    scrollOffset = (scrollOffset + 0.6) % 40; 
    
    ctx.clearRect(0, 0, w, h);
    
    // 1. DRAW MOVING BACKGROUND GRID
    ctx.strokeStyle = "rgba(0, 242, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < chartW + 80; i += 40) {
        let xPos = paddingLeft + (i - scrollOffset);
        if (xPos < paddingLeft || xPos > w - 10) continue;
        ctx.beginPath();
        ctx.moveTo(xPos, 10);
        ctx.lineTo(xPos, h - paddingBottom);
        ctx.stroke();
    }

    // 2. DRAW Y-AXIS SCALE & LABELS (0% - 100%)
    const thresholds = [{v:0, l:"0%"}, {v:0.25, l:"25%"}, {v:0.5, l:"50%"}, {v:0.75, l:"75%"}, {v:1, l:"100%"}];
    ctx.font = "10px 'Orbitron', sans-serif";
    ctx.textAlign = "right";
    thresholds.forEach(t => {
        const y = h - paddingBottom - (t.v * chartH);
        ctx.fillStyle = "rgba(0, 242, 255, 0.6)";
        ctx.fillText(t.l, paddingLeft - 10, y + 3);
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(w - 15, y);
        ctx.stroke();
    });

    // 3. DRAW DYNAMIC DATA LINE
    const currentRisk = riskHistory[riskHistory.length - 1];
    let themeColor = currentRisk > 0.7 ? "#ff3e3e" : (currentRisk > 0.4 ? "#ff9d00" : "#00f2ff");

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeStyle = themeColor;
    ctx.shadowBlur = 12;
    ctx.shadowColor = themeColor;

    for(let i = 0; i < riskHistory.length; i++) {
        const x = paddingLeft + (chartW / (riskHistory.length - 1)) * i;
        const y = h - paddingBottom - (riskHistory[i] * chartH);
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. DRAW GRADIENT FILL UNDER LINE
    const grad = ctx.createLinearGradient(0, 10, 0, h - paddingBottom);
    grad.addColorStop(0, themeColor.replace('rgb', 'rgba').replace(')', ', 0.25)'));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.lineTo(paddingLeft + chartW, h - paddingBottom);
    ctx.lineTo(paddingLeft, h - paddingBottom);
    ctx.fill();

    // 5. LIVE PULSE POINT (The "Information" focus)
    const lastX = paddingLeft + chartW;
    const lastY = h - paddingBottom - (currentRisk * chartH);
    const pulse = Math.sin(Date.now() / 150) * 4;

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 8 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    requestAnimationFrame(animateTrendGraph);
}

// =====================================
// DATA FETCHING & UI SYNC
// =====================================
async function fetchPrediction() {
    const startTime = performance.now();
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const risk = data.risk_probability || 0.1;
        processDataUpdate(risk, data, startTime);
    } catch (error) {
        // Mock data prevents the graph from appearing empty if the server is down
        const mockRisk = 0.05 + Math.random() * 0.1;
        processDataUpdate(mockRisk, { risk_level: "STABLE", raw_score: "0.0000", ood_detected: "NOMINAL" }, startTime);
    }
}

function processDataUpdate(risk, data, startTime) {
    riskHistory.push(risk);
    riskHistory.shift();

    const latency = Math.round(performance.now() - startTime);
    updateRiskGauge(risk, data.risk_level);
    updateMetadata(data, latency);
    addSystemLog(data.risk_level);
    updateHeaderTime();
    updateSimulationState(risk, data.risk_level);
}

// =====================================
// UI COMPONENT UPDATES
// =====================================
function updateMetadata(data, latencyMs) {
    if (UI.rawRisk) UI.rawRisk.innerText = data.raw_score || "0.0000";
    if (UI.calibratedRisk) UI.calibratedRisk.innerText = (data.risk_probability * 100).toFixed(1) + "%";
    if (UI.latency) UI.latency.innerText = `${latencyMs} ms`;
    if (UI.oodStatus) UI.oodStatus.innerText = data.ood_detected || "NOMINAL";
}

function updateRiskGauge(risk, level) {
    const percent = Math.round(risk * 100);
    const arcLength = 126; 
    const offset = arcLength - (risk * arcLength);
    if (UI.riskArc) {
        UI.riskArc.style.strokeDashoffset = offset;
        let color = risk > 0.7 ? "#ff3e3e" : (risk > 0.4 ? "#ff9d00" : "#00f2ff");
        UI.riskArc.style.stroke = color;
        UI.riskPercent.style.color = color;
    }
    UI.riskPercent.innerText = `${percent}%`;
    UI.riskLabel.innerText = level ? level.toUpperCase() : "STABLE";
}

function addSystemLog(level) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = document.createElement("div");
    logItem.className = "alert-item";
    logItem.innerHTML = `<span class="timestamp">[${time}]</span> <span class="msg">Telemetry Sync: ${level || 'NOMINAL'}</span>`;
    UI.alertBox.prepend(logItem);
    if (UI.alertBox.children.length > 8) UI.alertBox.removeChild(UI.alertBox.lastChild);
}

function updateHeaderTime() {
    const now = new Date();
    if (UI.timeDisplay) UI.timeDisplay.innerText = `UTC ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
}

function updateSimulationState(risk, level) {
    const targetIntensity = Math.min(1, Math.max(0.15, risk));
    const prev = window.simulationState.flareIntensity;
    window.simulationState.flareIntensity = prev + SMOOTHING_ALPHA * (targetIntensity - prev);
    window.simulationState.riskLevel = level || "STABLE";
}

function handleCanvasResize() {
    [UI.solarContainer, UI.satContainer].forEach(container => {
        if (!container) return;
        const canvas = container.querySelector('canvas');
        if (canvas) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
    });
}

// =====================================
// INITIALIZE
// =====================================
window.addEventListener('load', () => {
    handleCanvasResize();
    updateHeaderTime();
    
    // 1. Kick off the animation loop immediately
    requestAnimationFrame(animateTrendGraph);
    
    // 2. Initial data fetch
    fetchPrediction();
    
    // 3. Set interval for recurring data
    setInterval(fetchPrediction, 5000);
});