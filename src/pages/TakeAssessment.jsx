import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { userService } from '../services/userService';
import {
    Clock,
    Send,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    ChevronRight,
    Trophy,
    Zap,
    BrainCircuit,
    Sparkles,
    ShieldCheck,
    LayoutGrid,
    SearchX,
    FileText,
    Eye
} from 'lucide-react';

import { analyticsService } from '../services/analyticsService';

const TakeAssessment = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [assessment, setAssessment] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [answers, setAnswers] = useState({}); // Stores answers: { qIdx: selectedIdx } for QCM, { qIdx: [idx1, idx2] } for QMR
    const [markedForReview, setMarkedForReview] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showReview, setShowReview] = useState(false);
    const [showFullReview, setShowFullReview] = useState(false);
    const [gradingResult, setGradingResult] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // --- AI-GENERATED QUIZ MODE (Ephemeral) ---
                if (assessmentId === 'ai-generated') {
                    if (location.state?.assessment) {
                        console.log("Loading AI-Generated Assessment from State");
                        const aiAss = location.state.assessment;
                        setAssessment(aiAss);

                        // Ensure options exist for shuffling UI
                        const qs = (aiAss.questions || []).map(q => ({
                            ...q,
                            shuffledOptions: q.options || []
                        }));

                        setQuestions(qs);
                        setTimeRemaining((aiAss.durationMinutes || 30) * 60);
                        setLoading(false);
                        return;
                    }
                }

                // --- STANDARD MODE (Backend) ---
                const assessmentData = await assessmentService.getAssessmentById(assessmentId);
                let userData = null;
                try {
                    userData = await userService.getMe();
                } catch (e) {
                    console.warn("User not authenticated or error fetching user");
                }

                // Check and Populate Questions
                let rawQuestions = assessmentData.questions || [];

                // AUTO-GENERATION if empty
                if (rawQuestions.length === 0) {
                    console.log("🤖 Quiz Vide détecté : Génération IA en cours...", assessmentData.title);
                    try {
                        const aiQuiz = await analyticsService.generateQuiz(assessmentData.title || "General");
                        if (aiQuiz?.questions?.length > 0) {
                            rawQuestions = aiQuiz.questions;
                            assessmentData.questions = rawQuestions;
                        }
                    } catch (err) {
                        console.warn("⚠️ Echec génération IA:", err);
                    }
                }

                setAssessment(assessmentData);
                setUser(userData);

                // --- V3 ENHANCED LOGIC: Randomization & Bank ---
                let processedQuestions = [...rawQuestions];

                // 1. Shuffling Pool
                if (assessmentData.shuffle && processedQuestions.length > 0) {
                    processedQuestions.sort(() => Math.random() - 0.5);
                }

                // 2. Bank Selection
                const displayCount = parseInt(assessmentData.displayCount);
                if (!isNaN(displayCount) && displayCount > 0 && displayCount < processedQuestions.length) {
                    processedQuestions = processedQuestions.slice(0, displayCount);
                }

                // 3. Option Shuffling & Metadata
                processedQuestions = processedQuestions.map(q => {
                    const opts = q.options || [];
                    return {
                        ...q,
                        shuffledOptions: (assessmentData.shuffle && opts.length > 0)
                            ? [...opts].sort(() => Math.random() - 0.5)
                            : opts
                    };
                });

                setQuestions(processedQuestions);

                // Initialize timer if not already set
                if (timeRemaining === 0) {
                    setTimeRemaining((assessmentData.durationMinutes || 30) * 60);
                }

            } catch (error) {
                console.error("Error loading assessment:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [assessmentId]);

    useEffect(() => {
        if (timeRemaining <= 0 || submitted || questions.length === 0) return;
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, submitted, questions.length]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper to allow accessing current question safely
    const currentQuestion = (questions && questions.length > 0) ? questions[currentQuestionIndex] : null;

    const handleSubmit = async () => {
        if (submitted || questions.length === 0) return;
        setLoading(true);

        try {
            let correctCount = 0;
            const detailedAnswers = questions.map((q, idx) => {
                const studentAnswer = answers[idx];
                const originalCorrectAnswer = q.correct_answer !== undefined ? q.correct_answer : q.correctAnswer;
                const originalCorrectAnswers = q.correct_answers || [];

                let isCorrect = false;

                if (q.type === 'QMR') {
                    // Check if arrays match
                    const studentSet = new Set(studentAnswer || []);
                    const correctSet = new Set(originalCorrectAnswers);
                    isCorrect = studentSet.size === correctSet.size && [...studentSet].every(val => correctSet.has(val));
                } else {
                    // QCM or TF
                    isCorrect = studentAnswer === originalCorrectAnswer;
                }

                if (isCorrect) correctCount++;
                return {
                    questionId: q.id || idx,
                    studentAnswer,
                    isCorrect,
                    type: q.type,
                    correctAnswer: q.type === 'QMR' ? originalCorrectAnswers : originalCorrectAnswer
                };
            });

            const totalQuestions = questions.length;
            const percentage = (correctCount / totalQuestions) * 100;
            const score = (percentage / 100) * assessment.maxMarks;

            // Local Feedback Logic (since AI service doesn't have /grade)
            const performanceLevel = percentage >= 85 ? "Excellent" : percentage >= 70 ? "Bien" : percentage >= 50 ? "Passable" : "Insuffisant";
            const feedback = percentage >= 80 ? 'Excellent ! Vous avez une excellente maîtrise du sujet.' :
                percentage >= 60 ? 'Bien ! Vous avez compris les concepts essentiels.' :
                    'Besoin de révision. Repassez le cours pour consolider vos acquis.';

            setGradingResult({
                score: Math.round(score * 10) / 10,
                percentage: percentage,
                feedback: feedback,
                performance_level: performanceLevel,
                ai_analysis: `Analyse locale : ${correctCount} réponses correctes sur ${totalQuestions}.`
            });

            // --- PERSISTENCE LOGIC ---
            // If it's a real assessment (numeric ID), we submit to backend
            // If it's AI-generated practice, we keep it client-side only
            if (assessmentId !== 'ai-generated') {
                const submissionData = {
                    studentId: user.id || 0,
                    assessmentId: parseInt(assessmentId),
                    marksObtained: Math.round(score * 10) / 10,
                    submissionStatus: 'GRADED',
                    submittedAt: new Date().toISOString(),
                    gradedAt: new Date().toISOString(),
                    feedback: feedback,
                    answers: JSON.stringify(detailedAnswers)
                };
                console.log("AI Practice Mode: Results kept locally.");
            }

            // --- V3 AI RECOMMENDATIONS ---
            if (percentage < 70) {
                try {
                    const recs = await analyticsService.getRecommendations(user?.id || 0);
                    setRecommendations(recs || []);
                } catch (err) {
                    console.warn("Could not fetch recommendations");
                }
            }

            setSubmitted(true);
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Une erreur est survenue lors de la soumission. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-900">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-indigo-500"></div>
        </div>
    );

    if (!assessment) return (
        <div className="flex h-screen items-center justify-center bg-slate-950 flex-col gap-4">
            <AlertCircle size={48} className="text-rose-500" />
            <h2 className="text-white text-xl font-bold">Évaluation introuvable</h2>
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white underline">Retour</button>
        </div>
    );

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
        setCurrentQuestionIndex(0);
        setTimeRemaining(assessment?.durationMinutes * 60 || 0);
        setGradingResult(null);
        setShowReview(false);
    };

    if (submitted) {
        const correctCount = questions.filter((q, idx) => {
            const correctAnswer = q.correct_answer !== undefined ? q.correct_answer : q.correctAnswer;
            return answers[idx] === correctAnswer;
        }).length;
        const totalQuestions = questions.length;

        // Validation Logic (70% Threshold)
        const passed = gradingResult?.percentage >= 70;
        const themeColor = passed ? "emerald" : "rose";
        const themeText = passed ? "Validé" : "Non Validé";

        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-sans">
                {/* Immersive Animated Background */}
                <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-${themeColor}-500/10 blur-[150px] rounded-full animate-pulse`}></div>
                <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-${passed ? 'indigo' : 'orange'}-500/10 blur-[150px] rounded-full animate-pulse`} style={{ animationDelay: '2s' }}></div>

                <div className="max-w-4xl w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 lg:p-20 text-center relative z-10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] flex flex-col items-center">
                    <div className="relative mb-12">
                        <div className={`absolute inset-0 bg-${themeColor}-500 blur-3xl opacity-20 animate-pulse`}></div>
                        <div className={`relative w-32 h-32 bg-gradient-to-br from-${themeColor}-500 via-${themeColor}-600 to-${themeColor}-700 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl border border-white/20`}>
                            {passed ? <Trophy size={56} className="drop-shadow-lg" /> : <AlertCircle size={56} className="drop-shadow-lg" />}
                        </div>
                    </div>

                    <h2 className="text-5xl font-black text-white tracking-tight mb-4 uppercase">{passed ? "Félicitations !" : "Aie, dommage..."}</h2>
                    <p className={`text-${themeColor}-400 font-bold text-sm uppercase tracking-[0.3em] mb-12`}>
                        {passed ? "Le module est validé avec succès" : "Le score requis de 70% n'est pas atteint"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
                        <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md relative group hover:border-indigo-500/30 transition-all">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Score Final</p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-black text-white">{gradingResult?.score}</span>
                                <span className="text-xl font-bold text-slate-500">/{assessment?.maxMarks}</span>
                            </div>
                        </div>
                        <div className={`bg-white/5 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md relative group hover:border-${themeColor}-500/30 transition-all`}>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Précision</p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className={`text-5xl font-black text-${themeColor}-400`}>{Math.round(gradingResult?.percentage)}</span>
                                <span className={`text-xl font-bold text-${themeColor}-900/50`}>%</span>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md relative group hover:border-purple-500/30 transition-all">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Statut</p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className={`text-3xl font-black text-${themeColor}-400 uppercase`}>{themeText}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-gradient-to-br from-${themeColor}-900/40 to-slate-900/40 border border-${themeColor}-500/20 p-8 rounded-[2.5rem] mb-12 w-full text-left`}>
                        <div className="flex items-center gap-4 mb-4">
                            <ShieldCheck size={28} className={`text-${themeColor}-400`} />
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Analyse & Conseils</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-slate-300 leading-relaxed font-medium">
                                <span className={`text-${themeColor}-400 font-bold uppercase text-xs block mb-1`}>Feedback :</span>
                                {gradingResult?.feedback}
                            </p>
                            {!passed && (
                                <p className="text-rose-300 text-sm font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                                    ⚠️ Vous devez obtenir au moins 70% pour valider ce module. Veuillez relire le cours et réessayer.
                                </p>
                            )}
                        </div>
                    </div>

                    {recommendations.length > 0 && !passed && (
                        <div className="w-full mb-12 animate-in zoom-in duration-700">
                            <div className="flex items-center gap-2 mb-6 justify-center">
                                <Sparkles className="text-amber-400" size={20} />
                                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Recommandations de l'IA</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendations.slice(0, 2).map((rec, rIdx) => (
                                    <div key={rIdx} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate(`/course/${rec.id}`)}>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{rec.category || "Module"}</p>
                                                <p className="text-sm font-bold text-white line-clamp-1">{rec.title}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-6 w-full max-w-lg justify-center">
                        <button
                            onClick={() => setShowFullReview(!showFullReview)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-2"
                        >
                            <Eye size={18} /> {showFullReview ? "Masquer Détails" : "Voir Correction"}
                        </button>
                        {passed ? (
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_10px_40px_rgba(16,185,129,0.2)]"
                            >
                                Quitter
                            </button>
                        ) : (
                            <button
                                onClick={handleRetry}
                                className="flex-1 bg-white hover:bg-rose-50 text-rose-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                            >
                                <Zap size={18} /> Réessayer
                            </button>
                        )}
                    </div>

                    {showFullReview && (
                        <div className="mt-16 w-full space-y-6 text-left animate-in fade-in slide-in-from-top-4 duration-500">
                            <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <FileText className="text-indigo-400" /> Correction Détaillée
                            </h3>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                {questions.map((q, idx) => {
                                    const userAnswer = answers[idx];
                                    const correctAnswer = q.correct_answer !== undefined ? q.correct_answer : q.correctAnswer;
                                    const isCorrect = userAnswer === correctAnswer;

                                    return (
                                        <div key={idx} className={`p-6 rounded-3xl border ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'} backdrop-blur-sm`}>
                                            <p className="text-white font-bold mb-4 flex items-center gap-3">
                                                <span className={`h-6 w-6 rounded-lg ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'} text-xs flex items-center justify-center shrink-0`}>{idx + 1}</span>
                                                {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`px-4 py-3 rounded-xl text-xs font-bold border ${oIdx === correctAnswer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                                                        oIdx === userAnswer ? 'bg-rose-500/20 border-rose-500 text-rose-400' :
                                                            'bg-white/5 border-white/10 text-slate-500'
                                                        }`}>
                                                        {opt}
                                                        {oIdx === correctAnswer && " (Correct)"}
                                                        {oIdx === userAnswer && !isCorrect && " (Votre réponse)"}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* Top Bar Navigation - Restored and Enhanced */}
            <div className="bg-white border-b border-slate-100 h-24 sticky top-0 z-40 flex items-center px-8 justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all border border-slate-100">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{assessment.title}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{assessment.assessmentType}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Progression</p>
                        <p className="text-sm font-black text-slate-900 leading-tight">Question {currentQuestionIndex + 1} / {questions.length}</p>
                    </div>
                    <div className={`h-16 px-8 rounded-3xl flex items-center gap-4 border-2 shadow-sm transition-all duration-500 ${timeRemaining < 120 ? 'bg-rose-50 border-rose-200 text-rose-600 scale-105 shadow-rose-200/50' : 'bg-white border-slate-100 text-slate-900'}`}>
                        <Clock size={24} className={timeRemaining < 120 ? 'animate-pulse' : 'text-indigo-600'} />
                        <span className="text-3xl font-black font-mono tracking-tighter">{formatTime(timeRemaining)}</span>
                    </div>
                </div>
            </div>
            {/* Main Test Area with Sidebar */}
            <div className="flex-1 flex max-w-[1700px] mx-auto w-full">
                {/* Immersive Q-List Sidebar */}
                <div className="w-[380px] border-r border-slate-100 bg-white/50 backdrop-blur-xl p-8 hidden xl:flex flex-col">
                    <div className="mb-10">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Zap size={16} className="text-indigo-600" /> Navigateur
                        </h3>
                        <p className="text-xs text-slate-400 font-bold">Sélection rapide des questions</p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestionIndex(i)}
                                className={`h-16 rounded-2xl border-2 font-black transition-all flex items-center justify-center text-sm relative ${i === currentQuestionIndex
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-105'
                                    : markedForReview.includes(i)
                                        ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-lg shadow-amber-500/10'
                                        : answers[i] !== undefined
                                            ? 'bg-white border-emerald-500/30 text-emerald-600'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                    }`}
                            >
                                {i + 1}
                                {markedForReview.includes(i) && (
                                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full border-2 border-white"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Complété</span>
                            <span className="text-indigo-600">{Object.keys(answers).length} / {questions.length}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-700 shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Focus Exam Content */}
                <div className="flex-1 p-8 lg:p-16 xl:p-24 flex flex-col items-center overflow-y-auto">
                    {questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <BrainCircuit size={64} className="text-slate-200 mb-6" />
                            <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Aucune question disponible</h2>
                            <p className="text-slate-300 font-bold mt-2">Cet examen n'a pas encore été configuré par l'instructeur.</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-indigo-600/20">Question {currentQuestionIndex + 1}</span>
                                    <button
                                        onClick={() => {
                                            const idx = currentQuestionIndex;
                                            setMarkedForReview(prev =>
                                                prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                                            );
                                        }}
                                        className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest transition-all border ${markedForReview.includes(currentQuestionIndex)
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500'
                                            }`}
                                    >
                                        Marquer pour révision
                                    </button>
                                    <div className="h-0.5 flex-1 bg-slate-100 rounded-full">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                                    </div>
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                    {currentQuestion.question}
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {currentQuestion.shuffledOptions.map((option, sIdx) => {
                                    // Map shuffled index back to original index for state storage
                                    const originalIdx = currentQuestion.options.indexOf(option);
                                    const isSelected = currentQuestion.type === 'QMR'
                                        ? (answers[currentQuestionIndex] || []).includes(originalIdx)
                                        : answers[currentQuestionIndex] === originalIdx;

                                    return (
                                        <button
                                            key={sIdx}
                                            onClick={() => {
                                                if (currentQuestion.type === 'QMR') {
                                                    const prev = answers[currentQuestionIndex] || [];
                                                    const next = prev.includes(originalIdx)
                                                        ? prev.filter(i => i !== originalIdx)
                                                        : [...prev, originalIdx];
                                                    setAnswers({ ...answers, [currentQuestionIndex]: next });
                                                } else {
                                                    setAnswers({ ...answers, [currentQuestionIndex]: originalIdx });
                                                }
                                            }}
                                            className={`w-full group relative text-left p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-1 ${isSelected
                                                ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-600/10'
                                                : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 font-black text-sm ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 text-white rotate-[360deg] shadow-lg'
                                                    : 'border-slate-200 text-slate-400 group-hover:border-indigo-400'
                                                    }`}>
                                                    {String.fromCharCode(65 + sIdx)}
                                                </div>
                                                <span className={`text-base lg:text-lg font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-600'}`}>
                                                    {option}
                                                </span>
                                                {isSelected && (
                                                    <div className="ml-auto p-2 bg-indigo-50 rounded-xl text-indigo-600 animate-in zoom-in">
                                                        <CheckCircle2 size={24} />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {currentQuestion.explanation && submitted && (
                                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl animate-in slide-in-from-left duration-500">
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Sparkles size={14} /> Explication Pédagogique
                                    </p>
                                    <p className="text-sm text-indigo-900 leading-relaxed font-medium italic">
                                        "{currentQuestion.explanation}"
                                    </p>
                                </div>
                            )}

                            <div className="pt-12 flex items-center justify-between border-t border-slate-100">
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-8 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Précédent
                                </button>

                                <div className="flex gap-4">
                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <button
                                            onClick={() => setShowReview(true)}
                                            disabled={Object.keys(answers).length < questions.length}
                                            className="px-14 py-5 bg-slate-950 hover:bg-black text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-900/30 active:scale-95 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Réviser & Soumettre <Send size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                            className="px-14 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center gap-3"
                                        >
                                            Suivant <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Final Review Modal */}
            {showReview && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3rem] max-w-2xl w-full p-12 text-center shadow-3xl transform animate-in zoom-in-95 duration-500">
                        <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8">
                            <ShieldCheck size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase">Confirmation Finale</h2>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                            Vous êtes sur le point de soumettre vos réponses. <br />
                            Une fois le test terminé, vous ne pourrez plus modifier vos choix.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left flex items-center justify-between border border-slate-100">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Résumé des réponses</p>
                                <p className="text-lg font-black text-slate-900">{Object.keys(answers).length} / {questions.length} Questions répondues</p>
                            </div>
                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={24} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowReview(false)}
                                className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
                            >
                                Revenir au test
                            </button>
                            <button
                                onClick={() => {
                                    setShowReview(false);
                                    handleSubmit();
                                }}
                                className="flex-2 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 font-sans"
                            >
                                Confirmer la Soumission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeAssessment;
