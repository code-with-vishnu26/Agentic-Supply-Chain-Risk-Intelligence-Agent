from sqlalchemy import Column, String, DateTime, ForeignKey
import datetime
import uuid

from ..database import Base


class Alert(Base):
    """A persisted, actionable alert raised when a risk prediction crosses the notification threshold."""
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=True, index=True)
    prediction_id = Column(String, ForeignKey("risk_predictions.id"), nullable=True, index=True)

    severity = Column(String, index=True)  # "critical", "high"
    title = Column(String)
    message = Column(String)

    status = Column(String, default="active", index=True)  # "active", "acknowledged", "resolved"
    resolved_by_strategy_id = Column(String, ForeignKey("mitigation_strategies.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
