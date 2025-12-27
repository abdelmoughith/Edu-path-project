"""Pydantic models for API requests and responses."""
from pydantic import BaseModel, Field
from typing import List


class PredictionRequest(BaseModel):
    """Request model for prediction endpoint."""
    
    student_id: int = Field(..., description="ID of the student")
    module_code: str = Field(..., description="Code of the module")


class PredictionResponse(BaseModel):
    """Response model for prediction endpoint."""
    
    student_id: int
    module_code: str
    success_proba: float = Field(..., description="Probability of success (0-1)")
    risk_level: str = Field(..., description="Risk level: Low, Medium, or High")
    message: str = Field(..., description="Human-readable message about the prediction")


class Recommendation(BaseModel):
    """Model for a single recommendation."""
    
    resource_id: str = Field(..., description="Unique identifier for the resource")
    title: str = Field(..., description="Title of the recommended resource")
    url: str = Field(..., description="URL to access the resource")
    type: str = Field(..., description="Type of resource (video, article, exercise, quiz)")
    reason: str = Field(..., description="Reason why this resource is recommended")


class RecommendationResponse(BaseModel):
    """Response model for recommendations endpoint."""
    
    student_id: int
    module_code: str
    recommendations: List[Recommendation] = Field(..., description="List of personalized recommendations")


# Note: Grading models removed to match official OpenAPI spec
# Use local grading in Frontend for immediate response
