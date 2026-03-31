import random
import uuid
import datetime
import asyncio
from typing import List, Dict, Any

from ...models.events import SeverityEnum

# --- Simulation Logic ---
# In a real app, these would make HTTP requests to external APIs using httpx
# For this implementation, we simulate fetching data to match the frontend behavior

def _generate_random_location(region: str) -> Dict[str, float]:
    regions = {
        "APAC": {"lat_range": (-10, 40), "lng_range": (100, 150)},
        "EMEA": {"lat_range": (30, 60), "lng_range": (-10, 40)},
        "AMER": {"lat_range": (-30, 50), "lng_range": (-120, -60)}
    }
    r = regions.get(region, regions["APAC"])
    return {
        "latitude": random.uniform(*r["lat_range"]),
        "longitude": random.uniform(*r["lng_range"])
    }

async def fetch_weather_data() -> List[Dict[str, Any]]:
    # Simulate API latency
    await asyncio.sleep(0.2)
    events = [
        {"type": "Super Typhoon", "severity": SeverityEnum.critical, "desc": "Category 5 typhoon approaching vital APAC shipping lanes."},
        {"type": "Flooding", "severity": SeverityEnum.high, "desc": "Severe flooding in manufacturing hub causing factory shutdowns."},
        {"type": "Blizzard", "severity": SeverityEnum.medium, "desc": "Heavy snowfall closing highway routes in Northern Europe."},
        {"type": "Heatwave", "severity": SeverityEnum.medium, "desc": "Extreme heat disrupting port operations."},
    ]
    event = random.choice(events)
    loc = _generate_random_location("APAC")
    return [{
        "source": "weather",
        "type": event["type"],
        "severity": event["severity"],
        "description": event["desc"],
        "location": "Simulated Region",
        **loc,
        "raw_data": {"wind_speed": random.randint(50, 200)}
    }]

async def fetch_news_data() -> List[Dict[str, Any]]:
    await asyncio.sleep(0.3)
    events = [
        {"type": "Strike", "severity": SeverityEnum.high, "desc": "Port workers union announced indefinite strike starting next week."},
        {"type": "Sanctions", "severity": SeverityEnum.critical, "desc": "New trade sanctions imposed on key electronics components."},
        {"type": "Geopolitical", "severity": SeverityEnum.high, "desc": "Rising tensions near major maritime chokepoint."},
        {"type": "Policy Change", "severity": SeverityEnum.medium, "desc": "New customs regulations delaying border crossings."},
    ]
    event = random.choice(events)
    loc = _generate_random_location("EMEA")
    return [{
        "source": "news",
        "type": event["type"],
        "severity": event["severity"],
        "description": event["desc"],
        "location": "Simulated Country",
        **loc,
        "raw_data": {"article_url": "https://example.com/news"}
    }]

async def fetch_shipping_data() -> List[Dict[str, Any]]:
    await asyncio.sleep(0.15)
    events = [
        {"type": "Port Congestion", "severity": SeverityEnum.high, "desc": "Vessel queue at major port exceeds 40 ships. Expect 7-day delays."},
        {"type": "Container Shortage", "severity": SeverityEnum.medium, "desc": "Severe container equipment shortage at Asian origin ports."},
        {"type": "Vessel Delay", "severity": SeverityEnum.low, "desc": "Mega-vessel delayed by 48 hours due to engine maintenance."},
    ]
    event = random.choice(events)
    loc = _generate_random_location("AMER")
    return [{
        "source": "shipping",
        "type": event["type"],
        "severity": event["severity"],
        "description": event["desc"],
        "location": "Simulated Port",
        **loc,
        "raw_data": {"wait_time_days": random.randint(2, 10)}
    }]

async def fetch_market_data() -> List[Dict[str, Any]]:
    await asyncio.sleep(0.1)
    events = [
        {"type": "Tariff Update", "severity": SeverityEnum.high, "desc": "Sudden 15% increase in import tariffs for steel and aluminum."},
        {"type": "Fuel Price Spike", "severity": SeverityEnum.medium, "desc": "Bunker fuel up 12% following crude oil rally. Surcharges expected."},
        {"type": "Supplier Bankruptcy", "severity": SeverityEnum.critical, "desc": "Tier-2 electronics supplier filed for insolvency."}
    ]
    event = random.choice(events)
    loc = _generate_random_location("APAC")
    return [{
        "source": "market",
        "type": event["type"],
        "severity": event["severity"],
        "description": event["desc"],
        "location": "Global",
        **loc,
        "raw_data": {"price_index": random.uniform(105.0, 130.0)}
    }]

async def ingest_all_sources(db_session) -> List[Dict[str, Any]]:
    """
    Simulates bringing in data from all sources simultaneously.
    In a real app, this would write to the DB.
    """
    results = await asyncio.gather(
        fetch_weather_data(),
        fetch_news_data(),
        fetch_shipping_data(),
        fetch_market_data(),
        return_exceptions=True
    )
    
    all_events = []
    for val in results:
        if isinstance(val, list):
            all_events.extend(val)
            
    # For now, we return the raw event mock data. 
    # Later we will store it in the db using the Event ORM model.
    return all_events
