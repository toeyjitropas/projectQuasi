from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import r2, db, model as ml

load_dotenv()
app = FastAPI()

class PredictRequest(BaseModel):
    event_type: str
    participants: int
    is_major: bool
    activity_count: int
    vendor_roles: Optional[List[str]] = []

@app.post("/train")
async def train():
    df = db.get_training_data()
    if len(df) < 10:
        raise HTTPException(status_code=422, detail="insufficient_data")

    model_bytes, events_used, cv_rmse = ml.train(df)
    if model_bytes is None:
        raise HTTPException(status_code=422, detail="insufficient_data")

    r2.upload_model(model_bytes)
    ml.load_cached(model_bytes)
    return {"events_used": events_used, "cv_rmse": round(cv_rmse, 2)}

@app.post("/predict")
async def predict(req: PredictRequest):
    pipeline = ml.get_cached()
    if pipeline is None:
        try:
            model_bytes = r2.download_model()
            pipeline = ml.load_cached(model_bytes)
        except Exception:
            raise HTTPException(status_code=422, detail="insufficient_data")

    df = db.get_training_data()
    if len(df) < 10:
        return {"error": "insufficient_data"}

    result = ml.predict(pipeline, req.event_type, req.participants, req.is_major, req.activity_count)
    return result
