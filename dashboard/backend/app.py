"""
app.py

FastAPI backend for Solar Flare Forecasting System
Uses trained MIL Attention model via model_loader.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import time
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"


# =====================================
# IMPORT MODEL LOADER (IMPORTANT)
# =====================================

from model_loader import (
    mil_predict,
    risk_level_from_probability
)

# =====================================
# CONFIG
# =====================================

NUM_INSTANCES = 8
FEATURE_DIM = 150

# EMA smoothing (must match frontend behavior)
SMOOTHING_ALPHA = 0.3
previous_smoothed_risk = None


# =====================================
# FASTAPI SETUP
# =====================================

app = FastAPI(
    title="Solar Flare Prediction API (MIL)",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "MIL-based Solar Flare Prediction API running",
        "model": "MIL-Attention"
    }


# =====================================
# HELPER FUNCTIONS
# =====================================

def generate_mil_input() -> np.ndarray:
    """
    Generate a valid MIL input tensor.

    NOTE:
    In production, this would be replaced with
    real incoming solar observation data.
    """
    return np.random.normal(
        0.0, 1.0,
        size=(1, NUM_INSTANCES, FEATURE_DIM)
    ).astype("float32")


def smooth_risk(current_risk: float) -> float:
    """
    Exponential Moving Average smoothing
    to stabilize real-time predictions.
    """
    global previous_smoothed_risk

    if previous_smoothed_risk is None:
        previous_smoothed_risk = current_risk
    else:
        previous_smoothed_risk = (
            SMOOTHING_ALPHA * current_risk
            + (1 - SMOOTHING_ALPHA) * previous_smoothed_risk
        )

    return previous_smoothed_risk


# =====================================
# PREDICTION ENDPOINT
# =====================================

@app.get("/predict")
def predict():
    """
    Run MIL model inference and return
    smoothed solar flare risk.
    """

    # Generate MIL input (placeholder for real data)
    X = generate_mil_input()

    # MIL prediction
    probs = mil_predict(X)[0]

    # Raw risk from model
    raw_risk = float(np.max(probs))

    # Smoothed risk for stability
    risk_probability = smooth_risk(raw_risk)

    # Human-readable level
    risk_level = risk_level_from_probability(risk_probability)

    return {
        "timestamp": time.time(),
        "risk_probability": round(risk_probability, 3),
        "risk_level": risk_level,
        "model": "MIL-Attention",
        "smoothing_alpha": SMOOTHING_ALPHA
    }
