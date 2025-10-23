import os
import threading
from contextlib import contextmanager

from typing import List, Dict, Any, Optional, TypedDict, Union
from dotenv import load_dotenv

import psycopg2
import psycopg2.pool
import requests

from psycopg2.extras import Json, RealDictCursor, register_uuid

import numpy as np

from .logger_setup import setup_logger

load_dotenv()

logger = setup_logger()

database_url = os.getenv("CP_DATABASE_URL")
if not database_url:
    logger.warning("CP_DATABASE_URL not found, trying DATABASE_URL")
    database_url = os.getenv("DATABASE_URL")

# Global connection pool
_connection_pool = None
_pool_lock = threading.Lock()

def get_connection_pool():
    """Get or create the global connection pool"""
    global _connection_pool
    if _connection_pool is None:
        with _pool_lock:
            if _connection_pool is None:
                logger.info("Creating connection pool...")
                _connection_pool = create_connection_pool()
                logger.info("Connection pool created successfully")
    return _connection_pool

def create_connection_pool():
    logger.info(f"Creating connection pool with URL: {database_url[:20]}..." if database_url else "No database URL")
    if not database_url:
        raise ValueError("CP_DATABASE_URL environment variable is not set")
    
    try:
        pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=10,
            dsn=database_url
        )
        logger.info("Connection pool created successfully")
        return pool
    except Exception as e:
        logger.error(f"Failed to create connection pool: {e}")
        raise

@contextmanager
def get_postgres_connection(table_name: str = None):
    """
    Get a connection, preferring the global pool. Only yield ONCE.
    We don't catch user code exceptions here; cleanup runs in finally.
    Also registers UUID adapter for psycopg2.
    """
    conn = None
    pool = None
    got_from_pool = False

    try:
        # Try to get a pooled connection; if pool creation or getconn fails, fall back
        try:
            pool = get_connection_pool()
            conn = pool.getconn()
            got_from_pool = True
        except Exception as e:
            logger.error(f"Error obtaining pooled connection: {e}")
            pool = None
            conn = psycopg2.connect(database_url)

        # Ensure UUID adaptation on this connection
        try:
            register_uuid(conn_or_curs=conn)
        except Exception as e:
            logger.error(f"Failed to register UUID adapter: {e}")

        yield conn

    finally:
        if conn:
            if got_from_pool and pool is not None:
                try:
                    pool.putconn(conn)
                except Exception as e:
                    logger.error(f"Error returning connection to pool: {e}")
            else:
                try:
                    conn.close()
                except Exception as e:
                    logger.error(f"Error closing direct connection: {e}")

def close_connection_pool():
    """Close the global connection pool"""
    global _connection_pool
    if _connection_pool:
        _connection_pool.closeall()
        _connection_pool = None
        logger.info("Connection pool closed")