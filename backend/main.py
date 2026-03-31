import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db

# Import all models so Base.metadata knows about them before create_all
from .models import Event, IngestionLog, Supplier, Route, RiskPrediction, MitigationStrategy, Feedback, TrainingRun

from .routers import ingestion, knowledge, intelligence, decisions, output
from .websocket.manager import router as ws_router

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the database
    logger.info("Initializing database...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
        # Seed data if tables are empty
        from .seed_data import seed_if_empty
        await seed_if_empty()
        logger.info("Seed data check complete.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(ingestion.router, prefix=f"{settings.API_V1_STR}/ingestion", tags=["Ingestion"])
app.include_router(knowledge.router, prefix=f"{settings.API_V1_STR}/knowledge", tags=["Knowledge Base"])
app.include_router(intelligence.router, prefix=f"{settings.API_V1_STR}/intelligence", tags=["Agent Brain"])
app.include_router(decisions.router, prefix=f"{settings.API_V1_STR}/decisions", tags=["Decision Support"])
app.include_router(output.router, prefix=f"{settings.API_V1_STR}/output", tags=["Output & Feedback"])

# WebSocket Router
app.include_router(ws_router)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.get("/health")
async def health():
    return {"status": "healthy", "mode": "simulation" if settings.SIMULATION_MODE else "production"}
