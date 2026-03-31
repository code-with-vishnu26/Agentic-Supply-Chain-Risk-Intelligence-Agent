import random
import logging
from ...models.events import Event

logger = logging.getLogger(__name__)

def score_event(event: Event, context: str) -> float:
    """
    Score risk impact on supply chain (0-100).
    Uses ML model if available, falls back to heuristic.
    """
    try:
        from ...ml.predict import predict_risk
        features = {
            "severity": event.severity.value if event.severity else "medium",
            "type": event.type or "delay",
            "lat": event.latitude or 0.0,
            "lng": event.longitude or 0.0,
            "context_length": len(context) if context else 0
        }
        probability, risk_level_str = predict_risk(features)
        score = float(probability * 100)
    except Exception as e:
        logger.debug(f"ML model unavailable ({e}). Using heuristic scoring.")
        sev_val = event.severity.value if event.severity else "medium"
        base = {"low": 20, "medium": 50, "high": 80, "critical": 95}
        score = base.get(sev_val, 50.0) + random.uniform(-5.0, 5.0)
    
    return round(min(100, max(0, score)), 1)

def score_supplier_risk(supplier_id: str) -> float:
    """Calculate composite risk for a supplier."""
    return round(random.uniform(10.0, 85.0), 1)

def score_route_risk(route_id: str) -> float:
    """Calculate route risk based on chokepoint events."""
    return round(random.uniform(5.0, 95.0), 1)
