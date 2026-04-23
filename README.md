## AI-Driven Space Weather Monitoring with MIL-Attention

An end-to-end Machine Learning system for predicting solar flare risk using **Multiple Instance Learning (MIL) with attention**, deployed via **FastAPI** and visualized through an advanced interactive dashboard.

[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15+-orange.svg)](https://tensorflow.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Project Overview

**Solar flares** pose serious risks to:
- Satellites & space missions
- Communication systems  
- Power grids

This project builds a **research-grade** solar flare forecasting pipeline that combines:

- Deep Learning (MIL-Attention)
- Probability calibration
- Out-of-distribution (OOD) detection
- Real-time API inference
- Advanced frontend visualization

> **The goal is not just prediction, but interpretable, stable, and deployable AI for space-weather monitoring.**

---

## Key Features

### Machine Learning & AI

| Feature | Description |
|---------|-------------|
| **Multiple Instance Learning (MIL)** | With attention mechanism for interpretability |
| **Instance Aggregation** | 90th percentile (not naive max pooling) |
| **Probability Calibration** | Temperature scaling for reliable uncertainty |
| **OOD Detection** | Identifies out-of-distribution inputs |
| **Latency-aware Inference** | Optimized for real-time predictions |

### Backend

- **FastAPI** REST API with async support
- Centralized **model loader** (single-load, warm-up inference)
- Clean separation between inference & API logic
- Production-style JSON responses with metadata

### Frontend Dashboard

- Real-time risk visualization with animated components
- Solar & satellite animations (Canvas-based)
- **Risk meter** with severity levels (Low -> Moderate -> High -> Severe)
- Time-series risk trend plotting
- System logs & alerts panel
- Model metadata display (transparent ML)

---

## Project Structure
Solar_Flare_Forecasting/
│
├── dashboard/
│ ├── backend/
│ │ ├── app.py # FastAPI server
│ │ ├── model_loader.py # MIL model loader (Keras 3)
│ │ ├── predict.py # Enhanced standalone inference
│ │ └── requirements.txt # Backend dependencies
│ │
│ └── frontend/
│ ├── index.html # Dashboard UI
│ ├── styles.css # Styling & themes
│ ├── dashboard.js # API + ML logic
│ └── animations.js # Solar & satellite animations
│
├── notebooks/ # Research & experimentation
│ ├── 01_data_understanding.ipynb
│ ├── 02_data_preprocessing.ipynb
│ ├── 03_feature_engineering.ipynb
│ ├── 04_ml_models.ipynb
│ ├── 05_dl_models.ipynb
│ ├── 06_mil_attention.ipynb
│ ├── 07_real_time_simulation.ipynb
│ ├── 08_results_visualization.ipynb
│ └── 09_model_explainability.ipynb
│
├── outputs/
│ └── figures/ # Attention maps, SHAP plots, graphs
│ ├── attention_weights.png
│ ├── shap_summary.png
│ └── temporal_heatmap.png
│
├── README.md
└── requirements.txt

text

---

## Important Note on Large Files

To keep this repository **lightweight** and **GitHub-friendly** (<100 MB):

| Excluded | Included |
|----------|----------|
| Trained ML models (SavedModel, .pb, variables) | All `.py` source code |
| Raw & processed datasets (.npy, .npz) | All `.ipynb` notebooks |
| Virtual environments | Frontend (`.html`, `.css`, `.js`) |
| - | Output figures (`.png`, `.jpg`) |

> This follows industry best practices for ML repositories.

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Solar_Flare_Forecasting.git
cd Solar_Flare_Forecasting
2. Set Up Backend Environment
bash
cd dashboard/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
3. Run the FastAPI Server
bash
python app.py
Server runs at: http://localhost:8000

4. Open the Frontend Dashboard
Navigate to dashboard/frontend/index.html

Open in your browser (Live Server recommended)

API Endpoints
GET /predict
Returns real-time solar flare risk prediction.

Sample Response:

json
{
  "timestamp": 1710000000.0,
  "raw_risk": 0.78,
  "calibrated_risk": 0.62,
  "risk_level": "HIGH",
  "risk_level_enum": 3,
  "ood_detected": false,
  "ood_score": 0.12,
  "latency_ms": 14.3,
  "model": "MIL-Attention",
  "status": "active"
}
GET /health
Health check endpoint for monitoring.

GET /metadata
Returns model information and configuration.

Risk Level Mapping
Risk Level	Calibrated Score Range	Color
LOW	0.00 - 0.25	Green
MODERATE	0.25 - 0.50	Yellow
HIGH	0.50 - 0.75	Orange
SEVERE	0.75 - 1.00	Red
Outputs & Visualizations
Included in this repository:

Output	Description
Attention weight visualizations	Instance-level attention maps
SHAP summary & force plots	Feature importance analysis
Temporal attention heatmaps	Time-series attention patterns
Model performance figures	ROC curves, calibration plots
Located in: outputs/figures/

Testing the System
Run Standalone Inference
bash
cd dashboard/backend
python predict.py --input sample_data.npy
Run API Tests
bash
curl http://localhost:8000/predict
Frontend Highlights
Risk meter synced with backend predictions (real-time WebSocket/HTTP polling)

Animated solar turbulence intensity scales with risk level

Satellite status indicators affected by predicted risk

OOD warnings displayed visually when detected

Real-time system logs with timestamps

Clean separation of logic & animation modules

Tech Stack
Backend
Technology	Purpose
Python 3.9+	Core language
FastAPI	REST API framework
TensorFlow / Keras 3	Deep learning backend
NumPy	Numerical operations
Uvicorn	ASGI server
Frontend
Technology	Purpose
HTML5	Structure
CSS3	Styling & themes
JavaScript (ES6)	Interactivity
Canvas API	Solar/satellite animations
ML Architecture
Multiple Instance Learning (MIL)

Attention Mechanism

Temperature Scaling

OOD Detection (Mahalanobis distance)

Use Cases
Space-weather early warning systems for satellite operators

Communication system protection during solar events

Power grid monitoring for geomagnetically induced currents

AI + Physics research platform

Advanced ML system design demonstration

Portfolio / academic projects

Future Enhancements
Real solar observatory data ingestion (SDO, GOES)

Bayesian uncertainty estimation (Monte Carlo Dropout)

Attention heatmap overlay on UI

Email/SMS alert notifications

Cloud deployment (Docker + GitHub Actions + AWS/GCP)

Historical data playback mode

Multi-model ensemble voting

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository

Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

License
This project is licensed under the MIT License - see the LICENSE file for details.

Author
Haneesh
B.Tech CSE | AI & ML Enthusiast

Interested in: AI + Web Systems & Space science & ML

Philosophy: Understanding models, not just using them

Acknowledgments
NASA's Solar Dynamics Observatory (SDO) for data inspiration

HELiOS project for solar physics context

Open-source ML community for tools and libraries
