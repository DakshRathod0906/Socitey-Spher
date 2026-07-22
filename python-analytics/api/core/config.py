import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SocietySphere Analytics API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    # Example: ["http://localhost:5173", "http://localhost:5000"]
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000"
    ]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
