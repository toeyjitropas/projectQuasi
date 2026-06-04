import os
import psycopg2
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

def get_training_data():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    query = """
        SELECT
            e.id,
            et.name AS event_type,
            e.size,
            e.\"isMajor\" AS is_major,
            e.participants,
            COUNT(a.id) AS activity_count,
            COALESCE(SUM(a.price), 0) AS total_cost,
            ARRAY_AGG(DISTINCT a.\"vendorRole\") FILTER (WHERE a.\"vendorRole\" IS NOT NULL) AS vendor_roles
        FROM \"Event\" e
        LEFT JOIN \"EventType\" et ON et.id = e.\"eventTypeId\"
        LEFT JOIN \"Activity\" a ON a.\"eventId\" = e.id
        WHERE e.status = 'completed'
        GROUP BY e.id, et.name, e.size, e.\"isMajor\", e.participants
        HAVING COALESCE(SUM(a.price), 0) > 0
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df
