import os
import psycopg2
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_conn():
    return psycopg2.connect(DATABASE_URL, sslmode="require")


def insert_user_data(prompt, label):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_data
                (prompt, label)
                VALUES (%s, %s)
            """,
                (prompt, label),
            )
            conn.commit()
    finally:
        conn.close()


def fetch_user_data():
    """Fetch all user data from the database and return as a pandas DataFrame."""
    conn = get_conn()

    df = pd.read_sql(
        """
        SELECT prompt, label, time
        FROM user_data
        """,
        conn,
    )

    conn.close()
    return df


if __name__ == "__main__":
    # Example usage
    df = fetch_user_data()
    print(df)
