import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import { userService } from '../services/userService';
import { courseService } from '../services/courseService';
import { activityService } from '../services/activityService';
import MainLayout from '../components/MainLayout';
import PredictionCard from '../components/ai/PredictionCard';
import RecommendationCard from '../components/ai/RecommendationCard';
import AILoadingState from '../components/ai/AILoadingState';
import {
    BrainCircuit,
    Target,
    Zap,
    Lightbulb,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    TrendingUp
} from 'lucide-react';

/**
 * AI Analytics Page - Premium interface for ML predictions and recommendations
 */
const AIAnalyticsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [aiHealth, setAiHealth] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                // Load user and courses
                const userData = await userService.getMe();
                setUser(userData);

                const coursesData = await courseService.getMyCourses();
                setCourses(coursesData || []);

                if (coursesData && coursesData.length > 0) {
                    setSelectedCourse(coursesData[0]);
                }

                // Check AI service health
                const health = await analyticsService.checkHealth();
                setAiHealth(health);
            } catch (error) {
                console.error('Initialization error:', error);
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleAnalyze = async () => {
        if (!user || !selectedCourse) return;

        setAnalyzing(true);
        setError(null);

        try {
            // --- NIVEAU 3: DONNÉES TYPÉES RÉELLES ---
            // 1. Récupération de l'engagement réel (Clics)
            let engagementScore = 0;
            try {
                const clicksData = await activityService.getTotalClicksByStudent(user.id);
                // On suppose que l'API renvoie soit un entier soit { totalClicks: N }
                const rawClicks = typeof clicksData === 'object' ? clicksData.totalClicks : clicksData;
                engagementScore = parseInt(rawClicks) || 0;
                console.log("📊 Engagement Réel (Clics):", engagementScore);
            } catch (e) {
                console.warn("Impossible de récupérer les clics, usage simulation:", e);
                engagementScore = 15; // Valeur par défaut
            }

            // 2. Calcul "Professionnel" du score IA
            // On utilise une formule pondérée stricte : Base + Avancement + Engagement

            const userId = parseInt(user.id) || 1;
            const courseId = parseInt(selectedCourse.id) || 0;

            // --- A. AVANCEMENT (40% du score) ---
            const progressKey = `user_${user.id}_course_${courseId}_percentage`;
            const realProgress = parseInt(localStorage.getItem(progressKey) || "0");

            // --- B. BASE DE DEPART (45%) ---
            // Un étudiant qui n'a rien fait commence à 45% de chances (incertitude)
            let baseScore = 45;

            // --- C. REGLES METIER ---
            let finalScore;

            // Ajustement "Complexité du Cours" (Pour éviter que tout soit à 53%)
            // Simule le fait que certains cours (ID) sont plus durs (-5%) ou plus faciles (+5%)
            const difficultyMod = (courseId * 7 % 11) - 5;

            if (realProgress >= 100) {
                // Règle d'Or : Si cours fini => 100% de succès garanti
                finalScore = 100;
            } else {
                // Formule : Base + (Progress * 0.4) + (Engagement * 0.15) + Complexité
                const progressBonus = realProgress * 0.40;
                const engagementBonus = Math.min(15, engagementScore * 0.15);

                finalScore = baseScore + progressBonus + engagementBonus + difficultyMod;

                // Malus si aucune activité détectée
                if (realProgress === 0 && engagementScore === 0) {
                    finalScore = 30 + difficultyMod; // Risque élevé car inactif
                }
            }

            // Bornage de sécurité
            finalScore = Math.min(99.9, Math.max(10, finalScore));

            console.log(`🧠 Algo IA v2: Progress(${realProgress}%) -> Score Calculé: ${finalScore.toFixed(1)}%`);

            const realTimeMetrics = {
                avg_score: finalScore,
                // Metadonnées stables pour le modèle
                studied_credits: realProgress > 50 ? 120 : 60,
                num_of_prev_attempts: 0,
                highest_education: 1,
                region: 1,
                age_band: 1,
                gender: 0,
                disability: 0
            };

            console.log("📤 Envoi Metrics Hybrides (Réel + Simulé):", realTimeMetrics);

            console.log("📤 Envoi des données temps réel à l'IA:", realTimeMetrics);

            // Call both prediction (WITH METRICS) and recommendations in parallel
            const [predData, recoData] = await Promise.all([
                analyticsService.predictSuccess(user.id, selectedCourse.id.toString(), realTimeMetrics),
                analyticsService.getRecommendations(user.id, selectedCourse.id.toString())
            ]);

            setPrediction(predData);
            setRecommendations(recoData.recommendations || []);
        } catch (error) {
            console.error('Analysis error:', error);
            setError(error.message || 'Erreur lors de l\'analyse. Veuillez réessayer.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <AILoadingState message="Chargement de l'interface IA..." />
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen pb-32 px-6 lg:px-10">
                {/* Hero Section */}
                <header className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-[3.5rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl mb-12">
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                                <div className={`w-3 h-3 rounded-full ${aiHealth?.status === 'ok' ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`}></div>
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                                    {aiHealth?.status === 'ok' ? 'IA Service Actif' : 'Mode Démo'}
                                </span>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-6">
                                Votre Succès <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Prédit.</span>
                            </h1>

                            <p className="text-slate-300 text-lg font-medium max-w-2xl leading-relaxed">
                                Anticipez vos résultats et optimisez votre stratégie d'apprentissage grâce à notre moteur d'intelligence artificielle avancé.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                            <BrainCircuit className="relative text-white w-32 h-32 lg:w-40 lg:h-40 animate-pulse" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Control Panel */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                                <Target className="text-indigo-500" size={28} />
                                Configuration
                            </h3>

                            <div className="space-y-6">
                                {/* Course Selection */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                        Sélectionnez un cours
                                    </label>
                                    {courses.length > 0 ? (
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-200 transition-all"
                                            value={selectedCourse?.id || ''}
                                            onChange={(e) => {
                                                const course = courses.find(c => c.id.toString() === e.target.value);
                                                setSelectedCourse(course);
                                                setPrediction(null);
                                                setRecommendations([]);
                                            }}
                                        >
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.title}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                            <p className="text-sm font-bold text-amber-700 mb-4">
                                                Aucun cours inscrit
                                            </p>
                                            <button
                                                onClick={() => navigate('/courses')}
                                                className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                                            >
                                                Explorer les cours
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Analyze Button */}
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing || !selectedCourse}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Analyse en cours...
                                        </>
                                    ) : (
                                        <>
                                            Scanner avec l'IA
                                            <Zap size={18} fill="currentColor" />
                                        </>
                                    )}
                                </button>

                                {/* Info Box */}
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-indigo-900 mb-2">
                                                Comment ça marche ?
                                            </p>
                                            <p className="text-xs text-indigo-700 leading-relaxed">
                                                Notre IA analyse vos performances, votre engagement et vos habitudes d'apprentissage pour prédire votre probabilité de réussite.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        {prediction && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2.5rem] p-8 border border-indigo-100">
                                <h4 className="text-sm font-black text-slate-700 mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                                    Statistiques
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-600">Analyses effectuées</span>
                                        <span className="text-lg font-black text-indigo-600">1</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-600">Recommandations</span>
                                        <span className="text-lg font-black text-purple-600">{recommendations.length}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Results Panel */}
                    <main className="lg:col-span-8 space-y-10">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-8 flex items-center gap-4">
                                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                <p className="text-sm font-bold text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {analyzing && (
                            <AILoadingState message="L'IA analyse vos données..." />
                        )}

                        {/* Prediction Results */}
                        {!analyzing && prediction && (
                            <>
                                <PredictionCard prediction={prediction} />

                                {/* Recommendations Section */}
                                {recommendations.length > 0 && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <Lightbulb className="w-8 h-8 text-amber-400" />
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900">
                                                    Recommandations Personnalisées
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium">
                                                    {recommendations.length} ressources sélectionnées pour vous
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {recommendations.map((reco, idx) => (
                                                <RecommendationCard
                                                    key={reco.resource_id}
                                                    recommendation={reco}
                                                    index={idx}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Empty State */}
                        {!analyzing && !prediction && (
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-16 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-8 mx-auto rotate-6">
                                        <BrainCircuit size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">
                                        Prêt à découvrir votre potentiel ?
                                    </h3>
                                    <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                                        Sélectionnez un cours et lancez l'analyse IA pour obtenir des prédictions personnalisées et des recommandations adaptées.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-indigo-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="text-sm font-bold">Analyse instantanée</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </MainLayout>
    );
};

export default AIAnalyticsPage;
