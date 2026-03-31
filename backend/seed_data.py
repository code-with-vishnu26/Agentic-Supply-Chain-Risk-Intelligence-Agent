"""
Seed data script — populates the database with initial suppliers, routes, and sample events
when the DB is empty. Runs automatically at startup via main.py lifespan.
"""
import uuid
import random
import datetime
import logging
from sqlalchemy import select, func

from .database import async_session_maker
from .models.suppliers import Supplier, Route
from .models.events import Event, SeverityEnum
from .models.predictions import RiskPrediction, MitigationStrategy

logger = logging.getLogger(__name__)

SUPPLIERS_DATA = [
    {"name": "TechComp Asia Ltd", "location": "Shanghai, China", "region": "APAC", "category": "Electronics", "tier": 1, "reliability_score": 87.0, "lead_time_days": 18, "capacity_utilization": 82.0},
    {"name": "EuroParts GmbH", "location": "Hamburg, Germany", "region": "EMEA", "category": "Automotive", "tier": 1, "reliability_score": 92.0, "lead_time_days": 10, "capacity_utilization": 75.0},
    {"name": "IndiaTextiles Ltd", "location": "Mumbai, India", "region": "APAC", "category": "Textiles", "tier": 2, "reliability_score": 78.0, "lead_time_days": 28, "capacity_utilization": 68.0},
    {"name": "BrazilAgro SA", "location": "Santos, Brazil", "region": "AMER", "category": "Agriculture", "tier": 2, "reliability_score": 83.0, "lead_time_days": 32, "capacity_utilization": 71.0},
    {"name": "KoreaSemicon Inc", "location": "Busan, South Korea", "region": "APAC", "category": "Semiconductors", "tier": 1, "reliability_score": 95.0, "lead_time_days": 38, "capacity_utilization": 90.0},
    {"name": "GulfPetro LLC", "location": "Dubai, UAE", "region": "EMEA", "category": "Petrochemicals", "tier": 1, "reliability_score": 88.0, "lead_time_days": 14, "capacity_utilization": 77.0},
]

ROUTES_DATA = [
    {"origin": "Shanghai", "destination": "Los Angeles", "transit_days": 14, "carrier": "COSCO", "status": "active"},
    {"origin": "Rotterdam", "destination": "Mumbai", "transit_days": 18, "carrier": "Maersk", "status": "active"},
    {"origin": "Singapore", "destination": "Hamburg", "transit_days": 24, "carrier": "MSC", "status": "active"},
    {"origin": "Busan", "destination": "Panama Canal", "transit_days": 20, "carrier": "HMM", "status": "active"},
    {"origin": "Dubai", "destination": "Rotterdam", "transit_days": 15, "carrier": "Hapag-Lloyd", "status": "active"},
    {"origin": "Santos", "destination": "Cape Town", "transit_days": 12, "carrier": "CMA CGM", "status": "active"},
    {"origin": "Tokyo", "destination": "Los Angeles", "transit_days": 13, "carrier": "ONE", "status": "active"},
    {"origin": "Mumbai", "destination": "Suez Canal", "transit_days": 7, "carrier": "Maersk", "status": "warning"},
]

SAMPLE_EVENTS = [
    {"source": "weather", "type": "Typhoon", "severity": SeverityEnum.critical, "location": "Western Pacific", "latitude": 22.3, "longitude": 120.5, "description": "Category 5 typhoon approaching vital APAC shipping lanes. Wind speeds exceed 200 km/h."},
    {"source": "news", "type": "Sanctions", "severity": SeverityEnum.critical, "location": "Middle East", "latitude": 25.3, "longitude": 55.3, "description": "New trade sanctions imposed on key electronics components affecting multiple supply chains."},
    {"source": "shipping", "type": "Port Congestion", "severity": SeverityEnum.high, "location": "Shanghai Port", "latitude": 31.2, "longitude": 121.5, "description": "Vessel queue at Shanghai port exceeds 40 ships. Expected 7-day delays for all inbound cargo."},
    {"source": "market", "type": "Tariff Update", "severity": SeverityEnum.high, "location": "Global", "latitude": 40.7, "longitude": -74.0, "description": "Sudden 15% increase in import tariffs for steel and aluminum effective immediately."},
    {"source": "weather", "type": "Flooding", "severity": SeverityEnum.high, "location": "South China", "latitude": 23.1, "longitude": 113.3, "description": "Severe flooding in manufacturing hub causing factory shutdowns across Guangdong province."},
    {"source": "news", "type": "Strike", "severity": SeverityEnum.high, "location": "US West Coast", "latitude": 33.7, "longitude": -118.3, "description": "Port workers union announced indefinite strike starting next week at LA and Long Beach ports."},
    {"source": "shipping", "type": "Vessel Delay", "severity": SeverityEnum.medium, "location": "Suez Canal", "latitude": 30.5, "longitude": 32.3, "description": "Mega-vessel experiencing engine issues causing partial canal blockage and 48-hour delays."},
    {"source": "market", "type": "Fuel Price Spike", "severity": SeverityEnum.medium, "location": "Global", "latitude": 51.5, "longitude": -0.1, "description": "Bunker fuel prices up 12% following crude oil rally. Freight surcharges expected across all routes."},
    {"source": "news", "type": "Geopolitical", "severity": SeverityEnum.high, "location": "Red Sea", "latitude": 13.0, "longitude": 42.5, "description": "Armed attacks on commercial vessels in Bab el-Mandeb strait forcing major carriers to reroute."},
    {"source": "weather", "type": "Blizzard", "severity": SeverityEnum.medium, "location": "Northern Europe", "latitude": 53.5, "longitude": 10.0, "description": "Heavy snowfall closing highway routes to Hamburg and Rotterdam ports for 48+ hours."},
    {"source": "market", "type": "Supplier Bankruptcy", "severity": SeverityEnum.critical, "location": "Taiwan", "latitude": 25.0, "longitude": 121.5, "description": "Tier-2 electronics supplier filed for insolvency. 15% of regional chip supply at risk."},
    {"source": "shipping", "type": "Container Shortage", "severity": SeverityEnum.medium, "location": "Asia Pacific", "latitude": 1.3, "longitude": 103.8, "description": "Severe container equipment shortage at Asian origin ports. Deficit of 12K TEU expected."},
]


async def seed_if_empty():
    """Seed the DB with sample data if it's empty."""
    async with async_session_maker() as session:
        # Check if suppliers and events are seeded
        count = await session.scalar(select(func.count(Supplier.id)))
        events_count = await session.scalar(select(func.count(Event.id)))
        
        if count and count > 0 and events_count and events_count > 0:
            logger.info(f"Database already has {count} suppliers and {events_count} events — skipping seed.")
            return
            
        logger.info("Seeding database with initial data...")
        
        if not count or count == 0:
            # Seed Suppliers
            for s_data in SUPPLIERS_DATA:
                supplier = Supplier(id=str(uuid.uuid4()), risk_score=random.uniform(15, 65), **s_data)
                session.add(supplier)
            
            # Seed Routes
            for r_data in ROUTES_DATA:
                route = Route(id=str(uuid.uuid4()), risk_score=random.uniform(10, 80), **r_data)
                session.add(route)
                
        if not events_count or events_count == 0:
        
            # Seed Events
            event_ids = []
            for e_data in SAMPLE_EVENTS:
                event_id = str(uuid.uuid4())
                event_ids.append(event_id)
                event = Event(
                    id=event_id,
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 72)),
                    processed=True,
                    **e_data
                )
                session.add(event)
            
            # Seed some Risk Predictions linked to events
            for i, eid in enumerate(event_ids[:6]):
                prob = random.uniform(40, 95)
                pred = RiskPrediction(
                    id=str(uuid.uuid4()),
                    event_id=eid,
                    title=f"Potential {SAMPLE_EVENTS[i]['type']} Disruption",
                    probability=round(prob, 1),
                    impact="High" if prob > 70 else "Medium",
                    timeline="48-72 hours" if prob > 60 else "1-2 weeks",
                    confidence=round(random.uniform(75, 95), 1),
                    category=SAMPLE_EVENTS[i]['source'].capitalize() + " Disruption",
                    region=SAMPLE_EVENTS[i]['location'],
                    model_output=f"Based on {SAMPLE_EVENTS[i]['type']} at {SAMPLE_EVENTS[i]['location']}, ML models project {round(prob,1)}% chance of supply chain impact."
                )
                session.add(pred)
                
                # Add mitigation strategies for each prediction
                strats = [
                    MitigationStrategy(id=str(uuid.uuid4()), prediction_id=pred.id, type="supplier", title="Activate Backup Supplier", description=f"Shift order volume to alternate supplier to avoid {SAMPLE_EVENTS[i]['location']} disruptions.", risk_reduction=round(random.uniform(30, 55), 1), cost_estimate=round(random.uniform(15000, 85000), 0), priority="high" if prob > 70 else "medium", status="pending"),
                    MitigationStrategy(id=str(uuid.uuid4()), prediction_id=pred.id, type="route", title="Reroute Critical Shipments", description="Divert highest priority shipments to alternative routes.", risk_reduction=round(random.uniform(50, 90), 1), cost_estimate=round(random.uniform(50000, 150000), 0), priority="high" if prob > 80 else "low", status="pending"),
                ]
                for st in strats:
                    session.add(st)
        
        await session.commit()
        logger.info(f"Seeded {len(SUPPLIERS_DATA)} suppliers, {len(ROUTES_DATA)} routes, {len(SAMPLE_EVENTS)} events, 6 predictions with strategies.")
