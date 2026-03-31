from celery.schedules import crontab
from .celery_app import celery_app
import asyncio
from typing import Dict, Any

from ..database import async_session_maker
from ..services.ingestion.event_ingestion import ingest_all_sources
import logging

logger = logging.getLogger(__name__)

# Run event ingestion every 10 minutes
celery_app.conf.beat_schedule = {
    "ingest-events-every-10-minutes": {
        "task": "backend.tasks.scheduled_tasks.run_ingestion_cycle",
        "schedule": crontab(minute="*/10"),
    },
}

async def _async_run_ingestion():
    async with async_session_maker() as session:
        logger.info("Starting scheduled ingestion cycle...")
        events = await ingest_all_sources(session)
        # Here we would normally process and store them
        logger.info(f"Ingested {len(events)} events.")
        return len(events)

@celery_app.task
def run_ingestion_cycle():
    """Celery task to run the async ingestion function."""
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # If loop is already running, run it functionally
        # In a generic celery worker, it often isn't running unless properly integrated
        asyncio.ensure_future(_async_run_ingestion())
    else:
        return loop.run_until_complete(_async_run_ingestion())
