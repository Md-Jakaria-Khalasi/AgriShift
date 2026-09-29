from sqlalchemy import text

from app.database.connection import engine


def check_database():
    with engine.connect() as connection:

        print("\n=== Database Tables ===")

        result = connection.execute(
            text(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
                """
            )
        )

        for row in result:
            print(row[0])

        print("\n=== Farm Geometry ===")

        result = connection.execute(
            text(
                """
                SELECT
                    f_geometry_column,
                    type,
                    srid
                FROM geometry_columns
                WHERE f_table_name = 'farms'
                """
            )
        )

        rows = result.fetchall()

        if rows:
            for row in rows:
                print(row)
        else:
            print("No geometry information found for 'farms'.")


if __name__ == "__main__":
    check_database()