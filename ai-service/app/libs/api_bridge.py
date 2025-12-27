import random
import os
import pandas as pd

# Pont de données IA - Version Robuste & Autonome
# - Tente de charger les vraies données (CSV)
# - Bascule sur la simulation si les fichiers sont absents
# - Supporte l'injection de données temps réel (Level 3)

class ApiBridge:
    def __init__(self):
        print("🔧 ApiBridge: Initialisation...")
        self.students = pd.DataFrame()
        self.predictor = None
        
        # Tentative de chargement des données réelles
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # Remonte de app/libs -> app -> root -> data/processed ?
            # Ajustez ce chemin selon votre structure réelle si vous avez les CSV
            data_path = os.path.join(os.path.dirname(os.path.dirname(current_dir)), "data", "processed")
            students_file = os.path.join(data_path, "student_info_normalized.csv")
            
            if os.path.exists(students_file):
                self.students = pd.read_csv(students_file)
                print(f"✅ Données CSV chargées: {len(self.students)} étudiants trouvés.")
                
                # Tente de charger le predictor si présent
                try:
                    from .predictor import SuccessPredictor
                    self.predictor = SuccessPredictor()
                    print("✅ Modèle XGBoost chargé.")
                except ImportError:
                    print("⚠️ Predictor non trouvé, usage simulation.")
            else:
                print(f"⚠️ Fichier CSV introuvable ici: {students_file}")
                print("👉 Mode: Simulation Autonome activé.")
                
        except Exception as e:
            print(f"⚠️ Erreur init données: {e}")
            print("👉 Mode: Simulation Autonome activé.")

    def get_prediction(self, student_id, module_code):
        # Méthode par défaut (sans injection)
        return self._simulate_prediction(student_id, module_code)

    def get_prediction_with_injection(self, student_id, module_code, custom_metrics=None):
        # LEVEL 3 : Injection de données du Frontend
        if custom_metrics:
            print(f"💉 ApiBridge: Injection reçue pour {student_id}")
            
            # Calcul du score basé sur les métriques injectées
            avg_score = custom_metrics.get('avg_score', 50)
            
            # Logique simple de prédiction (si pas de modèle ML chargé)
            # Base = note / 100
            proba = avg_score / 100.0
            
            # Facteurs d'ajustement
            attempts = custom_metrics.get('num_of_prev_attempts', 0)
            if attempts == 0: proba += 0.05
            if attempts > 2: proba -= 0.10
            
            return self._format_result(student_id, module_code, proba, "Prédiction Temps Réel (Injectée)")
            
        return self._simulate_prediction(student_id, module_code)

    def _simulate_prediction(self, student_id, module_code):
        # Simulation stable basée sur l'ID
        try:
            seed = int(student_id) + sum(ord(c) for c in module_code)
        except:
            seed = 123
            
        random.seed(seed)
        proba = random.uniform(0.45, 0.95)
        
        return self._format_result(student_id, module_code, proba, "Simulation (Donnée manquante)")

    def _format_result(self, student_id, module_code, proba, msg):
        proba = max(0.0, min(0.99, proba)) # Cap à 99%
        
        if proba > 0.75: risk = "Low"
        elif proba > 0.45: risk = "Medium"
        else: risk = "High"
        
        return {
            "student_id": int(student_id),
            "module_code": module_code,
            "success_proba": round(proba, 2),
            "risk_level": risk,
            "message": msg
        }

    def get_recommendations(self, student_id, module_code):
        # Recommandations simulées mais utiles
        return [
            {
                "resource_id": f"vid-{random.randint(100,999)}", 
                "title": f"Maîtriser {module_code} en 3 étapes", 
                "url": "#", 
                "type": "video", 
                "reason": "Populaire"
            },
            {
                "resource_id": f"quiz-{random.randint(100,999)}", 
                "title": "Quiz d'entraînement intensif", 
                "url": "#", 
                "type": "quiz", 
                "reason": "Pour renforcer vos acquis"
            }
        ]
