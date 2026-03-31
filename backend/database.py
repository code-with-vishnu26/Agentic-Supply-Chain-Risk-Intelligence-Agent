import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text

from .config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Choose DB engine based on configuration
if settings.USE_SQLITE:
    logger.info("Using SQLite (standalone mode) — no Docker needed")
    engine = create_async_engine(
        settings.SQLITE_URL,
        echo=False,
        future=True,
    )
else:
    logger.info("Using PostgreSQL (production mode)")
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
    )

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

async def init_db():
    """Create tables on startup. Enable pgvector if using PostgreSQL."""
    async with engine.begin() as conn:
        if not settings.USE_SQLITE:
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            except Exception as e:
                logger.warning(f"Could not create pgvector extension: {e}")
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully.")
