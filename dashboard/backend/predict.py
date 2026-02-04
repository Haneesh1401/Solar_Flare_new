"""
predict.py

Enhanced standalone prediction script for
Solar Flare Forecasting System (MIL-Attention).

Fixes:
- Overconfident EXTREME predictions
- Bad MIL aggregation (max bias)
- Uncalibrated probabilities

Adds:
- Robust MIL aggregation
- Probability calibration
- OOD (out-of-distribution) check
- Detailed diagnostics
"""

import numpy as np
import time
from typing import Dict

from model_loader import (
    mil_predict,
    risk_level_from_probability
)

# =====================================
# CONFIGURATION
# =====================================

NUM_INSTANCES = 8
FEATURE_DIM = 150

# Calibration (tunable)
TEMPERATURE = 2.0

# OOD detection threshold
OOD_STD_THRESHOLD = 3.0


# =====================================
# INPUT GENERATION (PLACEHOLDER)
# =====================================

def generate_mil_input() -> np.ndarray:
    """
    Generate placeholder MIL input.
    Replace with real solar feature vectors in production.
    """
    return np.random.normal(
        loc=0.0,
        scale=1.0,
        size=(1, NUM_INSTANCES, FEATURE_DIM)
    ).astype("float32")


# =====================================
# UTILITY FUNCTIONS
# =====================================

def aggregate_mil_predictions(probs: np.ndarray) -> float:
    """
    Robust MIL aggregation:
    - Avoids max() explosion
    - Uses high-percentile mean
    """
    return float(np.percentile(probs, 90))


def temperature_calibration(p: float, T: float) -> float:
    """
    Temperature scaling for probability calibration.
    """
    eps = 1e-6
    p = np.clip(p, eps, 1 - eps)
    logit = np.log(p / (1 - p))
    return float(1 / (1 + np.exp(-logit / T)))


def ood_check(X: np.ndarray) -> bool:
    """
    Simple out-of-distribution detection.
    Returns True if input looks suspicious.
    """
    z_score = np.mean(np.abs(X))
    return z_score > OOD_STD_THRESHOLD


def enhanced_risk_mapping(prob: float) -> str:
    """
    Improved risk-level mapping for uncalibrated models.
    """
    if prob < 0.45:
        return "LOW"
    elif prob < 0.65:
        return "MODERATE"
    elif prob < 0.85:
        return "HIGH"
    else:
        return "EXTREME"


# =====================================
# MAIN PREDICTION PIPELINE
# =====================================

def run_prediction(verbose: bool = True) -> Dict:
    start_time = time.time()

    # Input
    X = generate_mil_input()

    # OOD check
    is_ood = ood_check(X)

    # Model inference
    probs = mil_predict(X)[0]

    # Aggregation
    raw_risk = aggregate_mil_predictions(probs)

    # Calibration
    calibrated_risk = temperature_calibration(raw_risk, TEMPERATURE)

    # Risk level
    risk_level = enhanced_risk_mapping(calibrated_risk)

    result = {
        "timestamp": start_time,
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "raw_risk": round(raw_risk, 3),
        "calibrated_risk": round(calibrated_risk, 3),
        "risk_level": risk_level,
        "ood_detected": is_ood,
        "model": "MIL-Attention",
        "aggregation": "90th_percentile",
        "temperature": TEMPERATURE
    }

    if verbose:
        print("\n🌞 Solar Flare Risk Prediction")
        print("────────────────────────────")
        for k, v in result.items():
            print(f"{k}: {v}")

        if is_ood:
            print("\n⚠️ WARNING: Input may be out-of-distribution")

    return result


# =====================================
# ENTRY POINT
# =====================================

if __name__ == "__main__":
    run_prediction()
