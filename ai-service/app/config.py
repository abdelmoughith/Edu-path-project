"""Configuration management for AI Service."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    environment: str = "development"
    
    # Security
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    
    # CORS
    cors_origins: List[str] = ["*"]
    
    # Model Configuration
    model_random_state: int = 42
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
