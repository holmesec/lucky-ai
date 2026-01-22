import psycopg2

DATABASE_URL = (
    "postgresql://postgres.uegxelhdwxryxrvhzhyd:SuWEpHVJ0sDl5rh8@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
)


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


if __name__ == "__main__":
    # Example usage
    insert_user_data("Is Lauritz cool?", False)
