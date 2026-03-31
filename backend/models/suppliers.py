from sqlalchemy import Column, String, Float, Integer, JSON
import uuid

from ..database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    location = Column(String, index=True)
    region = Column(String, index=True)
    category = Column(String, index=True) # e.g., "Electronics", "Raw Materials"
    tier = Column(Integer) # 1, 2, 3
    
    reliability_score = Column(Float) # 0-100
    risk_score = Column(Float, default=0.0) # 0-100 dynamic risk core based on active events
    lead_time_days = Column(Integer)
    capacity_utilization = Column(Float) # 0-100%
    
    # Store arbitrary structured data like ISO certs
    certifications = Column(JSON, default=list)
    alternates = Column(JSON, default=list) # Array of alternative supplier IDs

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    transit_days = Column(Integer)
    risk_score = Column(Float, default=0.0) # 0-100 dynamic
    status = Column(String, default="active") # active, diverted, delayed
    carrier = Column(String)
