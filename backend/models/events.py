from sqlalchemy import Column, String, Float, DateTime, Boolean, JSON, Enum as SQLEnum, Text
import datetime
import enum
import uuid

from ..database import Base
from ..config import get_settings

settings = get_settings()

class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, index=True)  # weather, news, shipping, market
    type = Column(String, index=True)    # e.g., "hurricane", "strike", "tariff"
    severity = Column(SQLEnum(SeverityEnum), index=True)
    location = Column(String, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(String)
    
    # Store raw original JSON for audit
    raw_data = Column(JSON)
    
    # Embedding stored as JSON array in SQLite, or Vector in PostgreSQL
    # For portability we use Text (serialized JSON). In prod use pgvector.
    embedding_data = Column(Text, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    processed = Column(Boolean, default=False, index=True)

class IngestionLog(Base):
    __tablename__ = "ingestion_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String, index=True)
    events_count = Column(Float)
    latency_ms = Column(Float)
    status = Column(String)  # "success", "error", "degraded"
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
