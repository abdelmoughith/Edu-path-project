import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { userService } from '../services/userService';
import { analyticsService } from '../services/analyticsService';
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
    Star,
    Search,
    Filter,
    BrainCircuit,
    Plus
} from 'lucide-react';

/**
 * Professional Assessment Center - Enterprise Learning Platform
 * Premium Interface with AI Generation & Advanced Filtering
 */
const StudentAssessments = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PENDING, COMPLETED, GRADED
    const [filterDifficulty, setFilterDifficulty] = useState("ALL"); // ALL, FUNDAMENTAL, INTERMEDIATE, EXPERT

    // AI Generation State
    const [isGenerating, setIsGenerating] = useState(false);

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

    // --- AI AUTO-GENERATION HANDLER ---
    const handleGenerateAiQuiz = async () => {
        const topic = prompt("Sur quel sujet souhaitez-vous un test ? (ex: Spring Boot, Docker, React...)");
        if (!topic) return;

        setIsGenerating(true);
        try {
            // 1. Génération via l'IA (Service Front-end)
            const quizData = await analyticsService.generateQuiz(topic, "Intermédiaire");

            // 2. Construction de l'objet Assessment éphémère
            const aiAssessment = {
                id: 'ai-generated',
                title: `Quiz IA : ${topic} 🧠`,
                description: `Quiz généré à la demande sur ${topic}. Testez vos connaissances instantanément.`,
                durationMinutes: 10,
                maxMarks: quizData.questions.length * 5, // 5 pts par question
                questions: quizData.questions,
                assessmentType: 'AI_PRACTICE'
            };

            // 3. Navigation vers la page de test avec les données en State
            navigate(`/assessment/ai-generated/take`, {
                state: { assessment: aiAssessment }
            });

        } catch (error) {
            console.error(error);
            alert("Erreur lors de la génération du quiz. Veuillez réessayer.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- FILTERING LOGIC ---
    const filteredAssessments = assessments.filter(assessment => {
        const submission = getSubmissionStatus(assessment.id);
        const status = submission ? submission.submissionStatus : 'PENDING';

        // Search
        const matchesSearch = assessment.title?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status Filter
        let matchesStatus = true;
        if (filterStatus === 'PENDING') matchesStatus = !submission;
        if (filterStatus === 'COMPLETED') matchesStatus = submission && submission.submissionStatus === 'GRADED';

        // Difficulty Filter (Mock logic based on weekNumber)
        let matchesDifficulty = true;
        const level = assessment.weekNumber || 1;
        if (filterDifficulty === 'FUNDAMENTAL') matchesDifficulty = level <= 2;
        if (filterDifficulty === 'INTERMEDIATE') matchesDifficulty = level > 2 && level <= 4;
        if (filterDifficulty === 'EXPERT') matchesDifficulty = level > 4;

        return matchesSearch && matchesStatus && matchesDifficulty;
    });

    const completedCount = assessments.filter(a => {
        const sub = getSubmissionStatus(a.id);
        return sub?.submissionStatus === 'GRADED';
    }).length;

    const completionRate = assessments.length > 0
        ? Math.round((completedCount / assessments.length) * 100)
        : 0;

    if (loading) return null;

    return (
        <StudentLayout>
            <div className="px-6 lg:px-10 pb-20 space-y-8 bg-[#F8FAFC] min-h-screen">

                {/* HERO SECTION - Premium AI Branding */}
                <div className="bg-[#020617] rounded-3xl p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -mr-48 -mt-24 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4 bg-white/5 w-fit px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                <Sparkles size={14} className="text-amber-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Centre de Certification IA</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
                                Validez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Compétences</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-base max-w-xl leading-relaxed">
                                Accédez à des évaluations adaptatives propulsées par l'IA.
                                Obtenez des certifications reconnues et suivez votre progression en temps réel.
                            </p>
                        </div>

                        {/* AI Generate Button (Main Call to Action) */}
                        <button
                            onClick={handleGenerateAiQuiz}
                            disabled={isGenerating}
                            className="group relative px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                        >
                            <span className="flex items-center gap-3 relative z-10">
                                {isGenerating ? <BrainCircuit className="animate-spin text-indigo-600" /> : <BrainCircuit className="text-indigo-600" />}
                                {isGenerating ? "Génération IA..." : "Générer un Test IA"}
                            </span>
                            <div className="absolute inset-0 bg-indigo-400/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
                        <StatItem label="Modules" value={assessments.length} icon={<BookOpen size={16} />} />
                        <StatItem label="Validés" value={completedCount} icon={<CheckCircle2 size={16} className="text-emerald-400" />} />
                        <StatItem label="Progression" value={`${completionRate}%`} icon={<TrendingUp size={16} className="text-indigo-400" />} />
                        <StatItem label="Niveau" value="Intermédiaire" icon={<Award size={16} className="text-amber-400" />} />
                    </div>
                </div>

                {/* FILTERS & SEARCH BAR */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-4 z-30 bg-white/80 p-4 rounded-2xl backdrop-blur-xl border border-white/40 shadow-sm">
                    <div className="relative w-full lg:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une évaluation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700 placeholder:font-medium transition-all"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar">
                        <FilterPill label="Tous" active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
                        <FilterPill label="À Faire" active={filterStatus === 'PENDING'} onClick={() => setFilterStatus('PENDING')} icon={<Target size={14} />} />
                        <FilterPill label="Validés" active={filterStatus === 'COMPLETED'} onClick={() => setFilterStatus('COMPLETED')} icon={<CheckCircle2 size={14} />} />
                        <div className="w-px bg-slate-200 mx-2"></div>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2 uppercase tracking-wide focus:outline-none"
                        >
                            <option value="ALL">Niveau : Tous</option>
                            <option value="FUNDAMENTAL">Fondamental</option>
                            <option value="INTERMEDIATE">Intermédiaire</option>
                            <option value="EXPERT">Expert</option>
                        </select>
                    </div>
                </div>

                {/* ASSESSMENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAssessments.length > 0 ? (
                        filteredAssessments.map((assessment, index) => {
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
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Aucun résultat trouvé</h3>
                            <p className="text-slate-500">Essayez de modifier vos filtres ou lancez une génération IA.</p>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
};

// --- SUB-COMPONENTS ---

const StatItem = ({ label, value, icon }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
        <div className="p-3 bg-white/10 rounded-lg text-white">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black text-white">{value}</p>
        </div>
    </div>
);

const FilterPill = ({ label, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
    >
        {icon}
        {label}
    </button>
);

const AssessmentCard = ({ assessment, submission, isGraded, isPending, onStart, index }) => {
    const getDifficultyBadge = () => {
        const level = assessment.weekNumber || 1;
        if (level <= 2) return { label: 'Fondamental', color: 'bg-emerald-100 text-emerald-700' };
        if (level <= 4) return { label: 'Intermédiaire', color: 'bg-indigo-100 text-indigo-700' };
        return { label: 'Expert', color: 'bg-rose-100 text-rose-700' };
    };

    const diff = getDifficultyBadge();

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={120} className="text-indigo-600 rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${diff.color}`}>
                        {diff.label}
                    </span>
                    {isGraded && (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Validé</span>
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {assessment.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-2">
                    {assessment.description || "Évaluez vos compétences avec ce module adaptatif propulsé par l'IA."}
                </p>

                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                    <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock size={14} /> {assessment.durationMinutes} min</span>
                        <span className="flex items-center gap-1"><Target size={14} /> {assessment.maxMarks} pts</span>
                    </div>

                    <button
                        onClick={onStart}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isGraded
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-110'
                            }`}
                    >
                        {isGraded ? <History size={20} /> : <PlayCircle size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentAssessments;
