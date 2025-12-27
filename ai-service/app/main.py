from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import PredictionRequest, PredictionResponse, RecommendationResponse, QuizRequest, QuizResponse

# ... imports ... 

# --- SMART QUIZ GENERATOR ---
def generate_smart_questions(module_code: str, difficulty: str):
    """Generates context-aware questions based on the module code."""
    topic = module_code.lower()
    questions = []
    
    # KNOWLEDGE BASE SIMULATION
    # In a real system, this would query an LLM (OpenAI/Gemini) or a Vector Database
    
    # 1. DEVOPS / CLOUD / MICROSERVICES
    if any(k in topic for k in ["devops", "ci/cd", "docker", "k8s", "kubernetes", "cloud", "microservice"]):
        questions = [
            {
                "id": 101,
                "question": "Quel est le principe clé de DevOps ?",
                "options": ["Séparer Dev et Ops", "Collaboration et Automatisation", "Ignorer les tests", "Coder en production"],
                "correctAnswer": 1
            },
            {
                "id": 102,
                "question": "Quel outil est un standard pour la conteneurisation ?",
                "options": ["VirtualBox", "Docker", "Vagrant", "VMware"],
                "correctAnswer": 1
            },
            {
                "id": 103,
                "question": "Dans Kubernetes, quelle est la plus petite unité déployable ?",
                "options": ["Le Pod", "Le Node", "Le Service", "Le Container"],
                "correctAnswer": 0
            },
            {
                "id": 104,
                "question": "Que signifie CI dans CI/CD ?",
                "options": ["Code Intelligent", "Continuous Integration", "Cloud Instance", "Cyber Internet"],
                "correctAnswer": 1
            },
             {
                "id": 105,
                "question": "Quelle commande Docker liste les conteneurs actifs ?",
                "options": ["docker run", "docker ps", "docker images", "docker build"],
                "correctAnswer": 1
            }
        ]
        
    # 2. JAVA / SPRING BOOT
    elif any(k in topic for k in ["java", "spring", "jee", "backend"]):
         questions = [
            {
                "id": 201,
                "question": "Quelle annotation définit un Bean de Service dans Spring ?",
                "options": ["@Component", "@Service", "@Controller", "@Bean"],
                "correctAnswer": 1
            },
            {
                "id": 202,
                "question": "Quel est le cycle de vie par défaut d'un Bean Spring ?",
                "options": ["Prototype", "Singleton", "Session", "Request"],
                "correctAnswer": 1
            },
            {
                "id": 203,
                "question": "En Java, 'String' est-il un type primitif ?",
                "options": ["Oui", "Non, c'est un Objet", "Ça dépend de la JVM", "Uniquement en Java 8"],
                "correctAnswer": 1
            },
            {
                "id": 204,
                "question": "Comment démarrer une application Spring Boot ?",
                "options": ["java -jar app.jar", "python app.py", "npm start", "spring start"],
                "correctAnswer": 0
            },
            {
                "id": 205,
                "question": "Quelle interface de JPA permet les opérations CRUD ?",
                "options": ["CrudRepository", "SqlRepository", "DbInterface", "JpaManager"],
                "correctAnswer": 0
            }
        ]

    # 3. FALLBACK GENERAL
    else:
        # Fallback General Questions
        questions = [
            {
                "id": 901,
                "question": "Quelle étape est cruciale dans ce module ?",
                "options": ["L'analyse", "Le sommeil", "L'oubli", "Le hasard"],
                "correctAnswer": 0
            },
            {
                "id": 902,
                "question": "Ce concept est-il fondamental ?",
                "options": ["Non", "Oui", "Peut-être", "Jamais"],
                "correctAnswer": 1
            },
            {
                "id": 903,
                "question": "Quel est le but final ?",
                "options": ["L'échec", "La réussite", "L'abandon", "La pause"],
                "correctAnswer": 1
            }
        ]
        
    return questions

@app.post("/generate_quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """Generates an AI-powered quiz for a given module."""
    print(f"🤖 AI GENERATION: Quiz for {request.module_code} ({request.difficulty})")
    
    questions = generate_smart_questions(request.module_code, request.difficulty)
    
    return {
        "module_code": request.module_code,
        "questions": questions
    }
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
