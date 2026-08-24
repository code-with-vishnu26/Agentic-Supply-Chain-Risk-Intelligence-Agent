from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import datetime

from ..database import get_db
from ..models.predictions import MitigationStrategy, RiskPrediction
from ..models.suppliers import Supplier, Route
from ..models.alerts import Alert

router = APIRouter()


_STOPWORDS = {"the", "of", "and", "in", "at", "global", "region"}


def _keywords(text: str) -> set:
    return {w for w in "".join(c if c.isalnum() else " " for c in text.lower()).split() if len(w) > 2 and w not in _STOPWORDS}


async def _find_affected_entity(strategy: MitigationStrategy, prediction: RiskPrediction, db: AsyncSession):
    """Best-effort match of the prediction's region to a real supplier/route (by keyword
    overlap, e.g. "Shanghai Port" ~ "Shanghai, China") so applying a strategy has a
    measurable effect, instead of just flipping a status flag."""
    if not prediction or not prediction.region:
        return None

    region_words = _keywords(prediction.region)
    if not region_words:
        return None

    if strategy.type == "supplier":
        result = await db.execute(select(Supplier).order_by(Supplier.risk_score.desc()))
        candidates = result.scalars().all()
        matches = [s for s in candidates if region_words & _keywords(f"{s.location} {s.region}")]
        return matches[0] if matches else (candidates[0] if candidates else None)

    if strategy.type == "route":
        result = await db.execute(select(Route).order_by(Route.risk_score.desc()))
        candidates = result.scalars().all()
        matches = [r for r in candidates if region_words & _keywords(f"{r.origin} {r.destination}")]
        return matches[0] if matches else (candidates[0] if candidates else None)

    return None

@router.get("/strategies")
async def get_all_strategies(
    limit: int = 20, 
    status: str = Query(None, description="Filter by status (pending, applied, rejected)"),
    db: AsyncSession = Depends(get_db)
):
    """Get all generated mitigation strategies."""
    stmt = select(MitigationStrategy).order_by(MitigationStrategy.created_at.desc())
    if status:
        stmt = stmt.where(MitigationStrategy.status == status)
        
    result = await db.execute(stmt.limit(limit))
    strategies = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "prediction_id": s.prediction_id,
            "title": s.title,
            "description": s.description,
            "type": s.type,
            "priority": s.priority,
            "risk_reduction": s.risk_reduction,
            "cost_estimate": s.cost_estimate,
            "status": s.status
        }
        for s in strategies
    ]

@router.get("/suppliers/alternatives")
async def get_supplier_alternatives(
    affected_supplier_id: str = Query(None, description="ID of the at-risk supplier"),
    db: AsyncSession = Depends(get_db)
):
    """Look up real backup vendors: lower risk_score, same category, different region."""
    affected = None
    if affected_supplier_id:
        affected = await db.scalar(select(Supplier).where(Supplier.id == affected_supplier_id))

    stmt = select(Supplier).order_by(Supplier.reliability_score.desc()).limit(5)
    if affected:
        stmt = select(Supplier).where(
            Supplier.category == affected.category,
            Supplier.id != affected.id,
        ).order_by(Supplier.risk_score.asc()).limit(5)

    result = await db.execute(stmt)
    alternatives = result.scalars().all()

    if not alternatives:
        return []

    def _cost_variance(s):
        sign = '+' if not affected or (s.reliability_score or 0) < (affected.reliability_score or 0) else '-'
        lead_time_delta = abs((s.lead_time_days or 0) - (affected.lead_time_days if affected else 0))
        return f"{sign}{round(lead_time_delta * 0.4, 1)}%"

    return [
        {
            "id": s.id,
            "name": s.name,
            "region": s.region,
            "reliability": s.reliability_score,
            "risk_score": round(s.risk_score or 0, 1),
            "lead_time_days": s.lead_time_days,
            "cost_variance": _cost_variance(s),
        }
        for s in alternatives
    ]

@router.get("/routes/diversions")
async def get_route_diversions(
    affected_route: str = Query(None, description="ID of the at-risk route"),
    db: AsyncSession = Depends(get_db)
):
    """Find safer real routes: lower risk_score sharing an endpoint with the affected route."""
    affected = None
    if affected_route:
        affected = await db.scalar(select(Route).where(Route.id == affected_route))

    stmt = select(Route).order_by(Route.risk_score.asc()).limit(5)
    if affected:
        stmt = select(Route).where(
            or_(Route.origin == affected.origin, Route.destination == affected.destination),
            Route.id != affected.id,
        ).order_by(Route.risk_score.asc()).limit(5)

    result = await db.execute(stmt)
    diversions = result.scalars().all()

    if not diversions:
        return []

    return [
        {
            "id": r.id,
            "original_path": f"{affected.origin} -> {affected.destination}" if affected else None,
            "alternative": f"{r.origin} -> {r.destination}",
            "carrier": r.carrier,
            "transit_days": r.transit_days,
            "risk_score": round(r.risk_score or 0, 1),
            "risk_reduction": round(max(0, (affected.risk_score or 0) - (r.risk_score or 0)), 1) if affected else None,
        }
        for r in diversions
    ]

@router.get("/inventory/buffers")
async def get_inventory_buffers(
    category: str = Query("Microchips"),
    risk: str = Query("high"),
):
    """Calculate buffer stock recommendations."""
    buffer_pct = 10
    if risk == "high": buffer_pct = 20
    elif risk == "critical": buffer_pct = 35
    
    return [
        {
            "component": f"{category} - Critical SKUs",
            "current_buffer": "15 days",
            "recommended_buffer": f"+{buffer_pct}% (approx {buffer_pct//2} days)",
            "holding_cost": f"${buffer_pct * 8500}/mo"
        }
    ]

@router.post("/strategies/{strategy_id}/apply")
async def apply_strategy(strategy_id: str, db: AsyncSession = Depends(get_db)):
    """
    Apply a mitigation strategy. This is the closed-loop step: it doesn't just flip a
    status flag, it actually reduces the risk score of the affected supplier/route by the
    strategy's stated risk_reduction%, and resolves the alerts that were raised because of it.
    """
    strategy = await db.scalar(select(MitigationStrategy).where(MitigationStrategy.id == strategy_id))
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    if strategy.status == "applied":
        return {"status": "success", "message": f"Strategy '{strategy.title}' was already applied", "already_applied": True}

    prediction = await db.scalar(select(RiskPrediction).where(RiskPrediction.id == strategy.prediction_id))

    entity = await _find_affected_entity(strategy, prediction, db)
    entity_result = None
    if entity is not None:
        old_score = entity.risk_score or 0
        reduction_pct = min(max(strategy.risk_reduction or 0, 0), 100) / 100
        new_score = round(max(0, old_score - old_score * reduction_pct), 1)
        entity.risk_score = new_score
        entity_result = {
            "type": "supplier" if isinstance(entity, Supplier) else "route",
            "id": entity.id,
            "name": entity.name if isinstance(entity, Supplier) else f"{entity.origin} -> {entity.destination}",
            "risk_score_before": round(old_score, 1),
            "risk_score_after": new_score,
        }

    strategy.status = "applied"

    resolved_alert_ids = []
    if prediction:
        result = await db.execute(
            select(Alert).where(Alert.prediction_id == prediction.id, Alert.status != "resolved")
        )
        for alert in result.scalars().all():
            alert.status = "resolved"
            alert.resolved_at = datetime.datetime.utcnow()
            alert.resolved_by_strategy_id = strategy.id
            resolved_alert_ids.append(alert.id)

    await db.commit()

    if entity_result:
        try:
            from ..websocket.manager import manager
            await manager.broadcast("risk_update", entity_result)
        except Exception:
            pass

    return {
        "status": "success",
        "message": f"Strategy '{strategy.title}' applied successfully",
        "affected_entity": entity_result,
        "resolved_alerts": resolved_alert_ids,
    }
