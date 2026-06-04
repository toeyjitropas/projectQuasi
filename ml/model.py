import io
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

_cached_model = None

SIZE_MAP = {"S": 1, "M": 2, "L": 3, "XL": 4}
KNOWN_TYPES = ["Conference", "Workshop", "Corporate Dinner", "Team Building", "Exhibition", "Other"]

def derive_size(participants: int) -> str:
    if participants <= 30: return "S"
    if participants <= 100: return "M"
    if participants <= 300: return "L"
    return "XL"

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["size_ord"] = df["size"].map(SIZE_MAP).fillna(2)
    df["is_major"] = df["is_major"].astype(int)
    df["activity_count"] = df["activity_count"].fillna(0).astype(int)
    return df

def train(df: pd.DataFrame):
    if len(df) < 10:
        return None, None, None

    X = build_features(df)[["event_type", "size_ord", "is_major", "activity_count"]]
    y = df["total_cost"].astype(float)

    ct = ColumnTransformer([
        ("type_ohe", OneHotEncoder(handle_unknown="ignore", categories=[KNOWN_TYPES]), ["event_type"]),
    ], remainder="passthrough")

    pipeline = Pipeline([
        ("prep", ct),
        ("model", GradientBoostingRegressor(n_estimators=200, max_depth=4, random_state=42)),
    ])

    scores = cross_val_score(pipeline, X, y, cv=5, scoring="neg_root_mean_squared_error")
    cv_rmse = float(-scores.mean())

    pipeline.fit(X, y)

    buf = io.BytesIO()
    pickle.dump(pipeline, buf)
    return buf.getvalue(), len(df), cv_rmse

def predict(pipeline, event_type: str, participants: int, is_major: bool, activity_count: int) -> dict:
    size = derive_size(participants)
    size_ord = SIZE_MAP.get(size, 2)
    X = pd.DataFrame([{
        "event_type": event_type,
        "size_ord": size_ord,
        "is_major": int(is_major),
        "activity_count": activity_count,
    }])
    cost = float(pipeline.predict(X)[0])

    estimators = pipeline.named_steps["model"].estimators_
    preds = np.array([est[0].predict(pipeline.named_steps["prep"].transform(X)) for est in estimators])
    std = float(preds.std())

    return {
        "projected_cost": round(cost, 2),
        "confidence_interval": [round(cost - std, 2), round(cost + std, 2)],
    }

def load_cached(model_bytes: bytes):
    global _cached_model
    _cached_model = pickle.loads(model_bytes)
    return _cached_model

def get_cached():
    return _cached_model
