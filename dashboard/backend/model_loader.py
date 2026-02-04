"""
model_loader.py

Purpose:
---------
Centralized loader for trained ML / MIL models used in the
Solar Flare Forecasting System.

This module ensures:
- Model is loaded only once
- Keras 3 compatibility (SavedModel via TFSMLayer)
- Clean inference interface for FastAPI backend
"""

import numpy as np
import tensorflow as tf
from keras.layers import TFSMLayer
from typing import Dict


# =====================================================
# CONFIGURATION
# =====================================================

MIL_MODEL_PATH = "../../outputs/models/mil_attention_model"
MIL_CALL_ENDPOINT = "serving_default"


# =====================================================
# MODEL REGISTRY
# =====================================================

_models: Dict[str, object] = {}


# =====================================================
# LOAD MIL MODEL
# =====================================================

def load_mil_model() -> TFSMLayer:
    """
    Load the MIL Attention model as an inference-only layer
    using Keras 3 compatible TFSMLayer.

    Returns
    -------
    TFSMLayer
        Loaded MIL model
    """

    if "mil" not in _models:
        print("🔄 Loading MIL Attention model...")

        mil_layer = TFSMLayer(
            MIL_MODEL_PATH,
            call_endpoint=MIL_CALL_ENDPOINT
        )

        # Warm-up inference (important for TensorFlow)
        dummy_input = np.random.normal(
            size=(1, 8, 150)
        ).astype("float32")

        _ = mil_layer(dummy_input)

        _models["mil"] = mil_layer

        print("✅ MIL model loaded and warmed up")

    return _models["mil"]


# =====================================================
# MIL PREDICTION INTERFACE
# =====================================================

def mil_predict(X: np.ndarray) -> np.ndarray:
    """
    Run inference using the MIL Attention model.

    Parameters
    ----------
    X : np.ndarray
        Input array of shape (batch, num_instances, feature_dim)

    Returns
    -------
    np.ndarray
        Prediction probabilities
    """

    model = load_mil_model()

    outputs = model(X)

    # TFSMLayer returns a dict: {'output_0': tensor}
    if isinstance(outputs, dict):
        outputs = list(outputs.values())[0]

    return outputs.numpy()


# =====================================================
# RISK LEVEL MAPPING
# =====================================================

def risk_level_from_probability(prob: float) -> str:
    """
    Convert probability to human-readable risk level.
    """

    if prob < 0.3:
        return "LOW"
    elif prob < 0.6:
        return "MODERATE"
    elif prob < 0.8:
        return "HIGH"
    else:
        return "EXTREME"
