from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
import datetime
import uuid

from ..database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prediction_id = Column(String, ForeignKey("risk_predictions.id"), index=True)
    
    was_correct = Column(Boolean)
    user_notes = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    
    # Relationships
    prediction = relationship("RiskPrediction", back_populates="feedback")

class TrainingRun(Base):
    __tablename__ = "training_runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    data_points = Column(Integer)    # How many historical events were trained on
    accuracy = Column(Float)
    precision_score = Column(Float)  # renamed from 'precision' to avoid Python builtin conflict
    recall = Column(Float)
    
    duration_seconds = Column(Float)
    status = Column(String)  # "success", "failed", "in_progress"
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
