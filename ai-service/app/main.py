from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import PredictionRequest, PredictionResponse, RecommendationResponse
from .data_service import DataService
from .config import settings

app = FastAPI(title="AIService", description="AI Service for Learning Analytics Platform", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Predict student success probability."""
    student = DataService.get_student(request.student_id)
    module = DataService.get_module(request.module_code)
    
    if not student or not module:
        raise HTTPException(status_code=404, detail="Student or Module not found")
    
    # Simple heuristic-based prediction for demo purposes
    # Higher scores and more study hours lead to higher success probability
    base_proba = student["avg_score"] / 100.0
    study_bonus = min(student["study_hours_per_week"] / 40.0, 0.2)
    final_proba = min(base_proba + study_bonus, 1.0)
    
    risk_level = "Low" if final_proba > 0.8 else "Medium" if final_proba > 0.6 else "High"
    
    return {
        "student_id": request.student_id,
        "module_code": request.module_code,
        "success_proba": round(final_proba, 2),
        "risk_level": risk_level,
        "message": f"Prediction for {student['name']} in {module['name']}"
    }

@app.get("/reco/{student_id}/{module_code}", response_model=RecommendationResponse)
async def get_recommendations(student_id: int, module_code: str):
    """Get personalized learning recommendations."""
    student = DataService.get_student(student_id)
    module = DataService.get_module(module_code)
    
    if not student or not module:
        raise HTTPException(status_code=404, detail="Student or Module not found")
    
    resources = DataService.get_resources_for_module(module_code)
    
    recommendations = []
    for res in resources:
        recommendations.append({
            "resource_id": res["resource_id"],
            "title": res["title"],
            "url": res["url"],
            "type": res["type"],
            "reason": f"Recommended based on topics in {module_code}"
        })
    
    return {
        "student_id": student_id,
        "module_code": module_code,
        "recommendations": recommendations
    }


# AI-powered quiz grading moved to Frontend for better performance
# Local grading ensures instant feedback without network latency
