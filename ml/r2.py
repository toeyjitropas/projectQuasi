import os
import io
import boto3
from dotenv import load_dotenv

load_dotenv()

def get_client():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
    )

BUCKET = os.environ.get("R2_BUCKET", "event-images")
MODEL_KEY = "models/cost_model.pkl"

def upload_model(data: bytes):
    client = get_client()
    client.put_object(Bucket=BUCKET, Key=MODEL_KEY, Body=data)

def download_model() -> bytes:
    client = get_client()
    obj = client.get_object(Bucket=BUCKET, Key=MODEL_KEY)
    return obj["Body"].read()
