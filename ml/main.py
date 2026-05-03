"""
ML inference service: loads the training artifact (joblib) and exposes risk score (%).
Run from repo root:  uvicorn ml.main:app --reload --port 8001
Or from ml/:         uvicorn main:app --reload --port 8001
"""
from __future__ import annotations

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ML_ROOT = Path(__file__).resolve().parent
MODEL_PATH = ML_ROOT / "models" / "student_performance_xgb.pkl"


def _load_artifact():
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    return joblib.load(MODEL_PATH)


def _normalize_artifact(raw) -> dict:
    """Support dict artifact (notebook) or a bare sklearn Pipeline / estimator."""
    if isinstance(raw, dict) and "pipeline" in raw:
        return raw
    return {
        "pipeline": raw,
        "task_mode": "classification",
        "feature_columns": None,
        "positive_risk_class_index": 1,
        "target_variable": None,
        "label_encoder": None,
        "risk_score_description": "Bare estimator: positive class index defaults to 1.",
    }


_ART = _normalize_artifact(_load_artifact())
_PIPELINE = _ART["pipeline"]
_FEATURE_COLS: list[str] | None = _ART.get("feature_columns")
_TASK = str(_ART.get("task_mode") or "classification")
_POS_IDX = _ART.get("positive_risk_class_index")

app = FastAPI(title="Student performance ML", version="1.0.0")

_origins = os.getenv("ML_CORS_ORIGINS", "http://localhost:5173,http://localhost:5000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictBody(BaseModel):
    """Feature values keyed by column name (as in training / DB)."""

    features: dict[str, float | int | bool | None] = Field(
        ...,
        description="All model inputs by name; missing keys become NaN for imputation.",
    )


@app.get("/health")
def health():
    return {"status": "ok", "model_path": str(MODEL_PATH)}


@app.get("/meta")
def meta():
    """Schema for backend: exact feature order and task type."""
    return {
        "task_mode": _TASK,
        "feature_columns": _FEATURE_COLS,
        "target_variable": _ART.get("target_variable"),
        "positive_risk_class_index": _POS_IDX,
        "risk_score_description": _ART.get("risk_score_description"),
    }


def _risk_from_proba(proba: np.ndarray) -> float:
    if proba.ndim != 2 or proba.shape[1] < 1:
        raise ValueError("Unexpected predict_proba shape")
    idx = _POS_IDX
    if idx is None:
        idx = 1 if proba.shape[1] > 1 else 0
    idx = int(idx)
    if idx < 0 or idx >= proba.shape[1]:
        idx = proba.shape[1] - 1
    return float(np.clip(proba[0, idx], 0.0, 1.0)) * 100.0


@app.post("/predict")
def predict(body: PredictBody):
    feats = body.features
    if _FEATURE_COLS:
        row = {c: feats.get(c) for c in _FEATURE_COLS}
        X = pd.DataFrame([row], columns=_FEATURE_COLS)
    else:
        X = pd.DataFrame([feats])

    try:
        if _TASK == "regression":
            pred = _PIPELINE.predict(X)
            val = float(np.asarray(pred).ravel()[0])
            return {
                "status": "success",
                "task_mode": "regression",
                "risk_score_pct": None,
                "prediction": round(val, 4),
                "message": "Regression artifact: no dropout probability; raw prediction returned.",
            }
        proba = _PIPELINE.predict_proba(X)
        risk_pct = round(_risk_from_proba(np.asarray(proba)), 2)
        return {
            "status": "success",
            "task_mode": "classification",
            "risk_score_pct": risk_pct,
            "risk_score": risk_pct,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference failed: {e!s}") from e
