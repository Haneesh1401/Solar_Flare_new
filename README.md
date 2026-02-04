🌞 Solar Flare Forecasting System
AI-Driven Space Weather Monitoring with MIL-Attention

An end-to-end Machine Learning system for predicting solar flare risk using Multiple Instance Learning (MIL) with attention, deployed via FastAPI and visualized through an advanced interactive dashboard.

🚀 Project Overview

Solar flares pose serious risks to:

Satellites & space missions 🛰️

Communication systems 📡

Power grids ⚡

This project builds a research-grade solar flare forecasting pipeline that combines:

Deep Learning (MIL-Attention)

Probability calibration

Out-of-distribution (OOD) detection

Real-time API inference

Advanced frontend visualization

The goal is not just prediction, but interpretable, stable, and deployable AI for space-weather monitoring.

🧠 Key Features
🔹 Machine Learning & AI

Multiple Instance Learning (MIL) with attention

Instance-level aggregation (90th percentile, not naive max)

Temperature-scaled probability calibration

OOD (out-of-distribution) input detection

Latency-aware inference

🔹 Backend

FastAPI-based REST API

Centralized model loader (single-load, warm-up inference)

Clean separation between inference & API logic

Production-style JSON responses

🔹 Frontend Dashboard

Real-time risk visualization

Animated solar & satellite simulations

Risk meter with severity levels

Time-series risk trend plotting

System logs & alerts panel

Model metadata display (transparent ML)

🗂️ Project Structure
Solar_Flare_Forecasting/
│
├── dashboard/
│   ├── backend/
│   │   ├── app.py              # FastAPI server
│   │   ├── model_loader.py     # MIL model loader (Keras 3)
│   │   ├── predict.py          # Enhanced standalone inference
│   │   └── requirements.txt
│   │
│   └── frontend/
│       ├── index.html          # Dashboard UI
│       ├── styles.css          # Styling & themes
│       ├── dashboard.js        # API + ML logic
│       └── animations.js       # Solar & satellite animations
│
├── notebooks/                  # Research & experimentation
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_preprocessing.ipynb
│   ├── 03_feature_engineering.ipynb
│   ├── 04_ml_models.ipynb
│   ├── 05_dl_models.ipynb
│   ├── 06_mil_attention.ipynb
│   ├── 07_real_time_simulation.ipynb
│   ├── 08_results_visualization.ipynb
│   └── 09_model_explainability.ipynb
│
├── outputs/
│   └── figures/                # Attention maps, SHAP plots, graphs
│
├── README.md
└── requirements.txt

📊 Outputs & Visualizations

Included in this repository:

Attention weight visualizations

SHAP summary & force plots

Temporal attention heatmaps

Model performance figures

📁 Located in:

outputs/figures/

⚠️ Important Note on Large Files

To keep this repository lightweight and GitHub-friendly (<100 MB):

❌ Excluded

Trained ML models (SavedModel, .pb, variables)

Raw & processed datasets (.npy, .npz)

Virtual environments

✅ Included

All .py source code

All .ipynb notebooks

Frontend (.html, .css, .js)

Output figures (.png, .jpg)

This follows industry best practices for ML repositories.

🧪 Backend API Example

Endpoint

GET /predict


Sample Response

{
  "timestamp": 1710000000.0,
  "raw_risk": 0.78,
  "calibrated_risk": 0.62,
  "risk_level": "HIGH",
  "ood_detected": false,
  "latency_ms": 14.3,
  "model": "MIL-Attention"
}

🖥️ Frontend Highlights

Risk meter synced with backend predictions

Animated solar turbulence increases with risk

OOD warnings displayed visually

Real-time system logs

Clean separation of logic & animation

🧩 Tech Stack

Python (FastAPI, NumPy)

TensorFlow / Keras 3

Multiple Instance Learning

HTML / CSS / JavaScript

Canvas animations

Git & GitHub

🎯 Use Cases

Space-weather early warning systems

Satellite operations monitoring

AI + Physics research

Advanced ML system design demos

Portfolio / academic projects

📌 Future Enhancements

Real solar observatory data ingestion

Bayesian uncertainty estimation

Attention heatmap overlay on UI

Alert notifications

Cloud deployment (Docker + CI/CD)

👤 Author

Haneesh
B.Tech CSE | AI & ML Enthusiast
Interested in:

AI + Web Systems

Space science & ML

Understanding models, not just using them

⭐ If you like this project

Give it a ⭐ on GitHub — it really helps!
