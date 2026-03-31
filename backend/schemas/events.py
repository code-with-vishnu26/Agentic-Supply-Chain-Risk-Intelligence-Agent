from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from ..models.events import SeverityEnum

class EventBase(BaseModel):
    source: str
    type: str
    severity: SeverityEnum
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    raw_data: Optional[Dict[str, Any]] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str
    timestamp: datetime
    processed: bool
    
    class Config:
        from_attributes = True

class IngestionLogBase(BaseModel):
    source: str
    events_count: float
    latency_ms: float
    status: str

class IngestionLogResponse(IngestionLogBase):
    id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class IngestionStats(BaseModel):
    total_events_today: int
    avg_latency_ms: float
    active_sources: int
    uptime_percentage: float
