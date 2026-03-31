import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from ...models.predictions import RiskPrediction, MitigationStrategy

logger = logging.getLogger(__name__)

async def find_alt_suppliers(affected_supplier_id: str, db: AsyncSession) -> List[Dict[str, Any]]:
    """Look up backup vendors in different regions."""
    return [
        {"id": "sup-alt-1", "name": "Vietnam Mfg Partners", "region": "APAC", "cost_variance": "+2.5%", "extra_lead_time": "+5 days", "reliability": 92.5},
        {"id": "sup-alt-2", "name": "Mexico Nearshore Assembly", "region": "AMER", "cost_variance": "+8.0%", "extra_lead_time": "-3 days", "reliability": 88.0}
    ]

async def find_route_diversions(affected_route_path: str, db: AsyncSession) -> List[Dict[str, Any]]:
    """Suggest safer route alternatives around chokepoints."""
    return [
        {"original_path": affected_route_path, "alternative": "Cape of Good Hope bypass", "impact_time": "+14 days", "impact_cost": "+$180k per voyage", "risk_reduction": "75%"}
    ]

def calculate_inventory_buffer(component_category: str, risk_level: str) -> List[Dict[str, Any]]:
    """Calculate buffer stock percentage increments based on risk."""
    buffer_pct = 10
    if risk_level == "high": buffer_pct = 20
    elif risk_level == "critical": buffer_pct = 35
    
    return [
        {"component": f"{component_category} - Critical SKUs", "current_buffer": "15 days", "recommended_buffer": f"+{buffer_pct}% (approx {buffer_pct//2} days)", "holding_cost": f"${buffer_pct * 8500}/mo"}
    ]

async def generate_recommendations(prediction: RiskPrediction, db: AsyncSession) -> List[MitigationStrategy]:
    """Generate multiple mitigation strategies for a new prediction."""
    strategies = []
    
    strategies.append(MitigationStrategy(
        prediction_id=prediction.id, type="supplier",
        title="Activate Backup Supplier",
        description=f"Shift 30% of order volume to alternate vendor to avoid {prediction.region} disruptions.",
        risk_reduction=45.0, cost_estimate=25000.0,
        priority="high" if prediction.probability > 60 else "medium"
    ))
    
    strategies.append(MitigationStrategy(
        prediction_id=prediction.id, type="route",
        title="Reroute Critical Shipments",
        description="Divert 3 highest priority shipments to air freight.",
        risk_reduction=90.0, cost_estimate=85000.0,
        priority="high" if prediction.probability > 80 else "low"
    ))
    
    for s in strategies:
        db.add(s)
        
    await db.commit()
    return strategies
