from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MitigationStrategyBase(BaseModel):
    type: str
    title: str
    description: str
    risk_reduction: float
    cost_estimate: Optional[float] = None
    priority: str
    status: str = "pending"

class MitigationStrategyResponse(MitigationStrategyBase):
    id: str
    prediction_id: str
    
    class Config:
        from_attributes = True

class RiskPredictionBase(BaseModel):
    event_id: str
    title: str
    probability: float
    impact: str
    timeline: str
    confidence: float
    category: str
    region: str

class RiskPredictionResponse(RiskPredictionBase):
    id: str
    created_at: datetime
    mitigation_strategies: List[MitigationStrategyResponse] = []
    
    class Config:
        from_attributes = True
