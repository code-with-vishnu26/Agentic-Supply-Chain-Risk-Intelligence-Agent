from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
import datetime
import uuid

from ..database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), index=True)
    
    title = Column(String)
    probability = Column(Float)  # 0-100% chance of disruption
    impact = Column(String)      # Natural language description of impact
    timeline = Column(String)    # e.g., "within 48 hours"
    confidence = Column(Float)   # 0-100% ML model confidence
    
    category = Column(String, index=True)  # e.g., "Logistics Delay", "Supplier Insolvency"
    region = Column(String, index=True)
    
    model_output = Column(String)  # Serialized string of the full LLM explanation
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    # Relationships
    mitigation_strategies = relationship("MitigationStrategy", back_populates="prediction", lazy="selectin")
    feedback = relationship("Feedback", back_populates="prediction", lazy="selectin")

class MitigationStrategy(Base):
    __tablename__ = "mitigation_strategies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prediction_id = Column(String, ForeignKey("risk_predictions.id"))
    
    type = Column(String, index=True)   # "supplier", "route", "inventory"
    title = Column(String)
    description = Column(String)
    
    risk_reduction = Column(Float)   # 0-100%
    cost_estimate = Column(Float)    # Optional cost impact
    priority = Column(String)        # "high", "medium", "low"
    status = Column(String, default="pending")  # "pending", "applied", "rejected"
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    prediction = relationship("RiskPrediction", back_populates="mitigation_strategies")
