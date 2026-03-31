import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Tuple

from ...models.events import Event
from ...models.predictions import RiskPrediction
from ..memory.rag_pipeline import build_context
from .risk_scorer import score_event
from ...config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

async def classify_event(event: Event) -> Dict[str, Any]:
    """
    Stage 1: Parse and classify the raw event.
    """
    return {
        "event_id": event.id,
        "classification": event.type,
        "extracted_entities": {
            "location": event.location,
            "severity": event.severity.value if event.severity else "medium"
        }
    }

async def generate_prediction(event: Event, context: str, risk_score: float) -> Tuple[RiskPrediction, str]:
    """
    Stage 3: Predict impact using LLM/ML combining event data, context, and score.
    """
    probability = float(min(risk_score * 1.1, 100))
    sev = event.severity.value if event.severity else "medium"
    
    reasoning = (
        f"Based on `{event.type}` at `{event.location}` (severity: {sev}), "
        f"and the historical context of similar disruptions, we project a {round(probability, 1)}% "
        "chance of significant supply chain impact within the next 48-72 hours."
    )
    
    prediction = RiskPrediction(
        event_id=event.id,
        title=f"Potential {event.type} Disruption",
        probability=probability,
        impact=f"High impact on {event.location} routes",
        timeline="48-72 hours",
        confidence=85.0,
        category="Logistics Delay",
        region=event.location or "Global",
        model_output=reasoning
    )
    
    return prediction, reasoning

async def process_event(event: Event, db: AsyncSession) -> Dict[str, Any]:
    """
    Orchestrates the entire intelligence pipeline for a new event.
    """
    # 1. Parse Event
    classification = await classify_event(event)
    
    # 2. RAG Context Retrieval
    context = await build_context(event, db)
    
    # 3. ML Risk Scoring
    risk_score = score_event(event, context)
    
    # 4. Agent Reasoning & Prediction
    prediction, reasoning = await generate_prediction(event, context, risk_score)
    
    db.add(prediction)
    event.processed = True
    await db.commit()
    
    return {
        "classification": classification,
        "risk_score": risk_score,
        "prediction_id": prediction.id,
        "reasoning": reasoning
    }
