from celery import Celery
from ..config import get_settings

settings = get_settings()

celery_app = Celery(
    "supply_chain_agent",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["backend.tasks.scheduled_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)
