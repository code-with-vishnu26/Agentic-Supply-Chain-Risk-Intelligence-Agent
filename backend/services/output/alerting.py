import datetime
import logging
import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from ...models.alerts import Alert
from ...models.predictions import RiskPrediction
from .notification import send_alert

logger = logging.getLogger(__name__)

# Predictions at or above this probability are considered actionable enough to page someone.
ALERT_PROBABILITY_THRESHOLD = 65.0


async def raise_alert_for_prediction(prediction: RiskPrediction, db: AsyncSession) -> Optional[Alert]:
    """
    Persist and dispatch an Alert for a high-probability RiskPrediction.
    This is what turns a model output into something a human is actually notified about.
    Returns None if the prediction doesn't cross the alerting threshold.
    """
    probability = prediction.probability or 0
    if probability < ALERT_PROBABILITY_THRESHOLD:
        return None

    severity = "critical" if probability >= 85 else "high"
    alert = Alert(
        id=str(uuid.uuid4()),
        event_id=prediction.event_id,
        prediction_id=prediction.id,
        severity=severity,
        title=prediction.title,
        message=(
            f"{prediction.category or 'Risk'} in {prediction.region or 'an unknown region'}: "
            f"{round(probability, 1)}% probability, {prediction.impact or 'significant impact'} "
            f"expected within {prediction.timeline or 'the near term'}."
        ),
        status="active",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(alert)

    try:
        await send_alert(alert.title, severity, alert.message, channels=["email", "slack"])
    except Exception as e:
        logger.warning(f"Notification dispatch failed for alert {alert.id}: {e}")

    try:
        from ...websocket.manager import manager
        await manager.broadcast("alerts", {
            "id": alert.id,
            "prediction_id": alert.prediction_id,
            "title": alert.title,
            "severity": alert.severity,
            "message": alert.message,
            "status": alert.status,
            "created_at": alert.created_at.isoformat(),
        })
    except Exception:
        pass  # WebSocket broadcast is best-effort

    return alert
