from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Supply Chain Risk Intelligence Agent"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "GENERATE_YOUR_SECRET_KEY_HERE"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # URLs
    FRONTEND_URL: str = "http://localhost:5173"
    
    # DB — PostgreSQL (production) or SQLite (standalone dev)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/chain_guard_ai"
    USE_SQLITE: bool = True  # True = standalone mode, no Docker needed
    SQLITE_URL: str = "sqlite+aiosqlite:///./supply_chain.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI Models & Providers
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    # Local AI (Ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral"
    USE_LOCAL_AI: bool = True  # If True, use Ollama for risk reasoning
    
    # External APIs (Optional for simulation mode)
    NEWS_API_KEY: str = ""
    WEATHER_API_KEY: str = ""
    TAVILY_API_KEY: str = ""
    
    # Mode
    SIMULATION_MODE: bool = True  # Set to False to use real APIs
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
