"""
Database Initialization Script
Waits for the database to be ready, then creates tables and seeds the default admin.
"""

import logging
import time
from sqlalchemy.exc import OperationalError
from app.db.session import engine, init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db_init")

MAX_RETRIES = 30
RETRY_INTERVAL = 2  # seconds

def wait_for_db():
    """Wait for the database to start accepting connections."""
    logger.info("Waiting for database to be ready...")
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # Try to connect to the database
            with engine.connect() as connection:
                logger.info("Database connection established successfully.")
                return True
        except OperationalError as e:
            logger.info(
                f"Database connection attempt {attempt}/{MAX_RETRIES} failed. "
                f"Retrying in {RETRY_INTERVAL} seconds..."
            )
            time.sleep(RETRY_INTERVAL)
    
    logger.error("Could not connect to the database. Max retries exceeded.")
    return False

def main():
    if not wait_for_db():
        raise SystemExit(1)
    
    logger.info("Initializing database tables and seed data...")
    try:
        init_db()
        logger.info("Database successfully initialized.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}", exc_info=True)
        raise SystemExit(1)

if __name__ == "__main__":
    main()
