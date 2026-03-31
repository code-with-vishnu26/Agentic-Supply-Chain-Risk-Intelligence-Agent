from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from ..database import get_db
from ..models.predictions import MitigationStrategy, RiskPrediction

router = APIRouter()

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
    affected_supplier_id: str = Query("sup-1"),
    db: AsyncSession = Depends(get_db)
):
    """Look up alternative suppliers."""
    return [
        {
            "id": "sup-alt-1", "name": "Vietnam Mfg Partners", "region": "APAC",
            "cost_variance": "+2.5%", "extra_lead_time": "+5 days", "reliability": 92.5
        },
        {
            "id": "sup-alt-2", "name": "Mexico Nearshore Assembly", "region": "AMER",
            "cost_variance": "+8.0%", "extra_lead_time": "-3 days", "reliability": 88.0
        }
    ]

@router.get("/routes/diversions")
async def get_route_diversions(
    affected_route: str = Query("Shanghai to LA"),
    db: AsyncSession = Depends(get_db)
):
    """Find safe route deviations."""
    return [
        {
            "original_path": affected_route,
            "alternative": "Cape of Good Hope bypass",
            "impact_time": "+14 days",
            "impact_cost": "+$180k per voyage",
            "risk_reduction": "75%"
        }
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
    """Mark a mitigation strategy as applied."""
    strategy = await db.scalar(select(MitigationStrategy).where(MitigationStrategy.id == strategy_id))
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    strategy.status = "applied"
    await db.commit()
    
    return {"status": "success", "message": f"Strategy '{strategy.title}' applied successfully"}
