import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { userService } from '../services/userService';
import StudentLayout from '../components/StudentLayout';
import {
    Clock,
    Award,
    AlertCircle,
    BookOpen,
    Target,
    ChevronRight,
    PlayCircle,
    History,
    Sparkles,
    TrendingUp,
    CheckCircle2,
    BarChart3,
    Zap,
    Trophy,
    Star
} from 'lucide-react';

/**
 * Professional Assessment Center - Enterprise Learning Platform
 * Coursera-style assessment interface with comprehensive tracking
 */
const StudentAssessments = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await userService.getMe();
                const [assessmentsData, submissionsData] = await Promise.all([
                    assessmentService.getAssessmentsByCourse(courseId),
                    assessmentService.getStudentAssessmentsByStudent(userData.id).catch(() => [])
                ]);
                setAssessments(assessmentsData);
                setSubmissions(submissionsData);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        loadData();
    }, [courseId]);

    const getSubmissionStatus = (assessmentId) => submissions.find(s => s.assessmentId === assessmentId) || null;

    // Calculate statistics
    const completedCount = assessments.filter(a => {
        const sub = getSubmissionStatus(a.id);
        return sub?.submissionStatus === 'GRADED';
    }).length;

    const averageScore = assessments.length > 0 ? Math.round(
        submissions
            .filter(s => s.submissionStatus === 'GRADED')
            .reduce((acc, s) => {
                const assessment = assessments.find(a => a.id === s.assessmentId);
                return acc + (assessment ? (s.marksObtained / assessment.maxMarks) * 100 : 0);
            }, 0) / (submissions.filter(s => s.submissionStatus === 'GRADED').length || 1)
    ) : 0;

    const completionRate = assessments.length > 0
        ? Math.round((completedCount / assessments.length) * 100)
        : 0;

    if (loading) return null;

    return (
        <StudentLayout>
            <div className="px-6 lg:px-10 pb-20 space-y-8">
                {/* Professional Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-24"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy size={20} className="text-amber-400" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Centre d'Évaluation Professionnelle</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3">
                            Évaluations & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Certifications</span>
                        </h1>
                        <p className="text-slate-300 font-medium text-base max-w-2xl">
                            Validez vos compétences et obtenez des certifications reconnues par l'industrie
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <StatCard
                                icon={<Target size={20} />}
                                label="Évaluations"
                                value={assessments.length}
                                color="indigo"
                            />
                            <StatCard
                                icon={<CheckCircle2 size={20} />}
                                label="Complétées"
                                value={completedCount}
                                color="green"
                            />
                            <StatCard
                                icon={<TrendingUp size={20} />}
                                label="Score Moyen"
                                value={`${averageScore}%`}
                                color="purple"
                            />
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-slate-300">Taux de Complétion</span>
                                <span className="text-sm font-bold text-white">{completionRate}%</span>
                            </div>
                            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                                    style={{ width: `${completionRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assessment Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assessments.map((assessment, index) => {
                        const submission = getSubmissionStatus(assessment.id);
                        const isGraded = submission?.submissionStatus === 'GRADED';
                        const isPending = submission?.submissionStatus === 'SUBMITTED';

                        return (
                            <AssessmentCard
                                key={assessment.id}
                                assessment={assessment}
                                submission={submission}
                                isGraded={isGraded}
                                isPending={isPending}
                                onStart={() => navigate(`/assessment/${assessment.id}/take`)}
                                index={index}
                            />
                        );
                    })}
                </div>

                {/* Empty State */}
                {assessments.length === 0 && (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
                        <BookOpen size={56} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune Évaluation Disponible</h3>
                        <p className="text-slate-500 font-medium">Les évaluations seront disponibles au fur et à mesure de votre progression.</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-500/20 text-indigo-300',
        green: 'bg-green-500/20 text-green-300',
        purple: 'bg-purple-500/20 text-purple-300'
    };

    return (
        <div className={`${colorClasses[color]} rounded-2xl p-4 backdrop-blur-sm border border-white/10`}>
            <div className="flex items-center gap-2 mb-2 opacity-80">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
        </div>
    );
};

// Assessment Card Component
const AssessmentCard = ({ assessment, submission, isGraded, isPending, onStart, index }) => {
    const getDifficultyBadge = () => {
        const level = assessment.weekNumber || 1;
        if (level <= 2) return { label: 'Fondamental', color: 'bg-blue-100 text-blue-700' };
        if (level <= 4) return { label: 'Intermédiaire', color: 'bg-amber-100 text-amber-700' };
        return { label: 'Expert', color: 'bg-red-100 text-red-700' };
    };

    const getPerformanceRating = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600', icon: '🏆' };
        if (percentage >= 75) return { label: 'Très Bien', color: 'text-blue-600', icon: '⭐' };
        if (percentage >= 60) return { label: 'Bien', color: 'text-indigo-600', icon: '✓' };
        return { label: 'À Améliorer', color: 'text-amber-600', icon: '📈' };
    };

    const difficulty = getDifficultyBadge();
    const performance = isGraded ? getPerformanceRating(submission.marksObtained, assessment.maxMarks) : null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full opacity-40 -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-3 py-1 ${difficulty.color} text-[10px] font-bold rounded-full uppercase tracking-wide`}>
                                {difficulty.label}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                                Module {assessment.weekNumber || 1}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                            {assessment.title}
                        </h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2">
                            {assessment.description || "Évaluation des compétences acquises dans ce module."}
                        </p>
                    </div>
                    <StatusBadge submission={submission} />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <MetricBox
                        icon={<Clock size={16} />}
                        value={`${assessment.durationMinutes}min`}
                        label="Durée"
                    />
                    <MetricBox
                        icon={<Target size={16} />}
                        value={assessment.maxMarks}
                        label="Points Max"
                    />
                    <MetricBox
                        icon={<Sparkles size={16} />}
                        value={assessment.questionCount || (assessment.questions ? assessment.questions.length : 0)}
                        label="Questions"
                    />
                </div>

                {/* Action Area */}
                {isGraded ? (
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Votre Performance</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black">{submission.marksObtained}</span>
                                    <span className="text-lg opacity-50">/ {assessment.maxMarks}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                                    <span className="text-2xl">{performance.icon}</span>
                                </div>
                                <p className={`text-xs font-bold ${performance.color.replace('text-', 'text-white opacity-')}`}>
                                    {performance.label}
                                </p>
                            </div>
                        </div>

                        {/* Score Percentage */}
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold opacity-70">Taux de Réussite</span>
                                <span className="text-sm font-bold">{Math.round((submission.marksObtained / assessment.maxMarks) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                                    style={{ width: `${(submission.marksObtained / assessment.maxMarks) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onStart}
                        disabled={isPending}
                        className={`w-full p-5 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg flex items-center justify-center gap-3 ${isPending
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-black hover:to-slate-900 hover:shadow-xl hover:scale-[1.02]'
                            }`}
                    >
                        {isPending ? (
                            <>
                                <History size={20} className="animate-spin" />
                                Correction en Cours...
                            </>
                        ) : (
                            <>
                                <Zap size={20} />
                                Démarrer l'Évaluation
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                )}

                {/* Competencies (if graded) */}
                {isGraded && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Award size={14} className="text-indigo-600" />
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Compétences Validées</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Analyse', 'Synthèse', 'Application'].map((comp, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full border border-indigo-100">
                                    {comp}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Metric Box Component
const MetricBox = ({ icon, value, label, small }) => (
    <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
        <div className="text-slate-400 mb-1 flex justify-center">{icon}</div>
        <p className={`font-black text-slate-900 leading-none mb-1 ${small ? 'text-[10px]' : 'text-sm'}`}>
            {small ? value.substring(0, 4) : value}
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
    </div>
);

// Status Badge Component
const StatusBadge = ({ submission }) => {
    if (!submission) {
        return (
            <span className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
                À Commencer
            </span>
        );
    }

    if (submission.submissionStatus === 'GRADED') {
        return (
            <span className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                Évalué
            </span>
        );
    }

    return (
        <span className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 border border-indigo-200">
            En Correction
        </span>
    );
};

export default StudentAssessments;
