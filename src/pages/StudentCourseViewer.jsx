import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PlayCircle,
    FileText,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    ArrowLeft,
    Clock,
    Award,
    Maximize2,
    MoreVertical,
    Share2,
    Star,
    Menu,
    X,
    Loader2,
    Target,
    BookOpen,
    TrendingUp,
    Zap,
    CheckCircle2
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { activityService } from '../services/activityService';
import { userService } from '../services/userService';
import { assessmentService } from '../services/assessmentService';
import CertificateModal from '../components/CertificateModal';

/**
 * Professional Course Viewer - Coursera Style
 * Enterprise-grade learning experience with integrated assessments
 */
export default function StudentCourseViewer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [activeMaterial, setActiveMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [completedMaterials, setCompletedMaterials] = useState(new Set());
    const [user, setUser] = useState(null);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [submissions, setSubmissions] = useState([]);

    // Initial Data Loading
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch User
                const userData = await userService.getMe().catch(() => null);
                setUser(userData);

                // Fetch Course, Content & Assessments
                const [courseData, materialsData, assessmentsData, submissionsData] = await Promise.all([
                    courseService.getCourseById(courseId),
                    courseService.getMaterialsByCourse(courseId),
                    assessmentService.getAssessmentsByCourse(courseId).catch(() => []),
                    userData?.id ? assessmentService.getStudentAssessmentsByStudent(userData.id).catch(() => []) : Promise.resolve([])
                ]);

                setCourse(courseData);
                setAssessments(assessmentsData || []);
                setSubmissions(submissionsData || []);

                // Sort materials
                const sortedMaterials = [...(materialsData || [])].sort((a, b) => {
                    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
                    return a.title.localeCompare(b.title);
                });
                setMaterials(sortedMaterials);

                if (sortedMaterials.length > 0) {
                    setActiveMaterial(sortedMaterials[0]);
                    setExpandedModules({ [sortedMaterials[0].weekNumber || 1]: true });
                }

                // Load Progress
                if (userData?.id) {
                    const storageKey = `user_${userData.id}_course_${courseId}_progress`;
                    const saved = localStorage.getItem(storageKey);
                    if (saved) setCompletedMaterials(new Set(JSON.parse(saved)));
                }
            } catch (error) {
                console.error("Critical: Learning Session failure", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [courseId]);

    // Grouping
    const modules = [...new Set(materials.map(m => m.weekNumber || 1))].sort((a, b) => a - b);

    // Progress Calculation
    const progressPercentage = materials.length > 0
        ? Math.round((completedMaterials.size / materials.length) * 100)
        : 0;

    const completedModules = modules.filter(week => {
        const moduleMaterials = materials.filter(m => (m.weekNumber || 1) === week);
        return moduleMaterials.every(m => completedMaterials.has(m.id));
    }).length;

    useEffect(() => {
        if (user?.id && materials.length > 0) {
            localStorage.setItem(`user_${user.id}_course_${courseId}_percentage`, progressPercentage);
        }
    }, [progressPercentage, user?.id, courseId, materials.length]);

    const handleMaterialClick = (material) => {
        setActiveMaterial(material);
        if (user?.id) {
            const date = new Date().toISOString().split('T')[0];
            activityService.incrementClicks(
                user.id,
                course?.courseCode || courseId,
                (material.weekNumber || 1).toString(),
                date
            ).catch(() => { });
        }
        if (window.innerWidth < 768) setMobileMenuOpen(false);
    };

    const toggleMarkCompleted = (materialId, e) => {
        e?.stopPropagation();
        if (!user?.id) return;

        const updated = new Set(completedMaterials);
        if (updated.has(materialId)) {
            updated.delete(materialId);
        } else {
            updated.add(materialId);
        }

        setCompletedMaterials(updated);
        localStorage.setItem(`user_${user.id}_course_${courseId}_progress`, JSON.stringify([...updated]));

        // Show visual feedback
        const element = e?.currentTarget;
        if (element) {
            element.classList.add('scale-110');
            setTimeout(() => element.classList.remove('scale-110'), 200);
        }
    };

    const getModuleProgress = (weekNumber) => {
        const moduleMaterials = materials.filter(m => (m.weekNumber || 1) === weekNumber);
        if (moduleMaterials.length === 0) return 0;
        const completed = moduleMaterials.filter(m => completedMaterials.has(m.id)).length;
        return Math.round((completed / moduleMaterials.length) * 100);
    };

    const getAssessmentStatus = (weekNumber) => {
        const weekAssessments = assessments.filter(a => a.weekNumber === weekNumber);
        if (weekAssessments.length === 0) return null;

        const completed = weekAssessments.filter(a => {
            const sub = submissions.find(s => s.assessmentId === a.id);
            return sub?.submissionStatus === 'GRADED';
        }).length;

        return { total: weekAssessments.length, completed };
    };

    if (loading) return (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600 font-bold tracking-wide text-sm">Chargement de votre formation...</p>
        </div>
    );

    return (
        <div className={`h-screen flex bg-slate-50 font-sans overflow-hidden ${isCinemaMode ? 'fixed inset-0 z-[100]' : ''}`}>

            {/* Professional Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:relative flex flex-col shadow-sm`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                    <button onClick={() => navigate('/my-courses')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-xs mb-6 transition-colors">
                        <ArrowLeft size={16} /> Catalogue de Formation
                    </button>

                    <h2 className="font-bold text-slate-900 leading-tight mb-1 text-sm">{course?.title}</h2>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Formation Professionnelle</p>

                    {/* Progress Stats */}
                    <div className="mt-6 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-slate-600">Taux de Complétion</span>
                            <span className="text-sm font-bold text-indigo-600">{progressPercentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                            <span>{completedMaterials.size}/{materials.length} contenus</span>
                            <span>{completedModules}/{modules.length} modules</span>
                        </div>
                    </div>
                </div>

                {/* Module List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {modules.map(week => {
                        const moduleProgress = getModuleProgress(week);
                        const assessmentStatus = getAssessmentStatus(week);
                        const moduleMaterials = materials.filter(m => (m.weekNumber || 1) === week);

                        return (
                            <div key={week} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                                <button
                                    onClick={() => setExpandedModules(p => ({ ...p, [week]: !p[week] }))}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${moduleProgress === 100 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {moduleProgress === 100 ? <CheckCircle2 size={16} /> : week}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800 text-sm">Module {week}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{moduleProgress}% complété</p>
                                        </div>
                                    </div>
                                    {expandedModules[week] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                </button>

                                {expandedModules[week] && (
                                    <div className="border-t border-slate-100 bg-slate-50/50">
                                        {/* Materials */}
                                        <div className="p-2 space-y-1">
                                            {moduleMaterials.map(material => {
                                                const isActive = activeMaterial?.id === material.id;
                                                const isDone = completedMaterials.has(material.id);
                                                return (
                                                    <div
                                                        key={material.id}
                                                        onClick={() => handleMaterialClick(material)}
                                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isActive
                                                                ? 'bg-indigo-600 text-white shadow-md'
                                                                : isDone
                                                                    ? 'bg-white text-slate-700 hover:bg-slate-50'
                                                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                            <div className={`${isActive ? 'text-white' : isDone ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                                {material.materialType === 'VIDEO' ? <PlayCircle size={16} /> : <FileText size={16} />}
                                                            </div>
                                                            <span className="text-xs font-semibold truncate">{material.title}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => toggleMarkCompleted(material.id, e)}
                                                            className={`transition-all duration-200 ${isDone ? (isActive ? 'text-white' : 'text-green-600') : 'text-slate-300 hover:text-slate-400'}`}
                                                        >
                                                            <CheckCircle size={18} fill={isDone ? "currentColor" : "none"} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Assessments for this module */}
                                        {assessmentStatus && assessmentStatus.total > 0 && (
                                            <div className="p-3 border-t border-slate-200 bg-white">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Target size={14} className="text-indigo-600" />
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Évaluations</span>
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-slate-500">{assessmentStatus.completed}/{assessmentStatus.total}</span>
                                                </div>
                                                {assessments.filter(a => a.weekNumber === week).map(assessment => {
                                                    const submission = submissions.find(s => s.assessmentId === assessment.id);
                                                    const isGraded = submission?.submissionStatus === 'GRADED';

                                                    return (
                                                        <button
                                                            key={assessment.id}
                                                            onClick={() => navigate(`/assessment/${assessment.id}/take`)}
                                                            className="w-full mt-2 p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-lg transition-all flex items-center justify-between group"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Award size={14} className="text-indigo-600" />
                                                                <span className="text-[11px] font-bold text-slate-700 truncate">{assessment.title}</span>
                                                            </div>
                                                            {isGraded ? (
                                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                                    {submission.marksObtained}/{assessment.maxMarks}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                                                                    Démarrer →
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer CTA */}
                <div className="p-4 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                    <button
                        onClick={() => navigate(`/assessments/${courseId}`)}
                        className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:from-slate-900 hover:to-black transition-all shadow-lg hover:shadow-xl"
                    >
                        Centre d'Évaluation
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {/* Top Navigation */}
                {!isCinemaMode && (
                    <header className="px-8 py-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 className="text-base font-bold text-slate-900 truncate max-w-md">{activeMaterial?.title}</h1>
                                <p className="text-[11px] text-slate-500 font-medium">Module {activeMaterial?.weekNumber || 1} • {activeMaterial?.materialType === 'VIDEO' ? 'Vidéo' : 'Document'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeMaterial) toggleMarkCompleted(activeMaterial.id);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${completedMaterials.has(activeMaterial?.id)
                                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <CheckCircle size={16} fill={completedMaterials.has(activeMaterial?.id) ? "currentColor" : "none"} />
                                {completedMaterials.has(activeMaterial?.id) ? 'Complété' : 'Marquer comme terminé'}
                            </button>
                        </div>
                    </header>
                )}

                {/* Video/Content Viewer */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${isCinemaMode ? 'bg-black' : 'p-8 bg-slate-50'}`}>
                    <div className={`mx-auto w-full max-w-6xl ${isCinemaMode ? 'h-screen flex items-center justify-center' : ''}`}>

                        <div className={`relative bg-black ${isCinemaMode ? 'w-full h-full' : 'rounded-2xl shadow-2xl overflow-hidden aspect-video group'}`}>
                            {activeMaterial?.materialType === 'VIDEO' ? (
                                <>
                                    <iframe
                                        className="w-full h-full border-none"
                                        src={activeMaterial.contentUrl?.includes('youtube') ? activeMaterial.contentUrl.replace('watch?v=', 'embed/') : activeMaterial.contentUrl}
                                        title={activeMaterial.title}
                                        allowFullScreen
                                    ></iframe>
                                    {!isCinemaMode && (
                                        <button onClick={() => setIsCinemaMode(true)} className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <Maximize2 size={18} />
                                        </button>
                                    )}
                                    {isCinemaMode && (
                                        <button onClick={() => setIsCinemaMode(false)} className="fixed top-6 right-6 z-[110] bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm">
                                            <X size={24} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white p-12 text-center">
                                    <FileText size={56} className="opacity-30 mb-6" />
                                    <h3 className="text-2xl font-bold mb-3">Ressource Pédagogique</h3>
                                    <p className="text-slate-300 text-sm mb-8 max-w-md">Ce module contient du matériel de lecture pour approfondir vos connaissances.</p>
                                    <a href={activeMaterial?.contentUrl} target="_blank" rel="noreferrer" className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-lg">
                                        Consulter le Document
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Content Details */}
                        {!isCinemaMode && (
                            <div className="mt-8 space-y-6">
                                {/* Tags */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wide border border-indigo-100">
                                        {activeMaterial?.materialType}
                                    </span>
                                    <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold">
                                        Module {activeMaterial?.weekNumber || 1}
                                    </span>
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <div className="flex items-center gap-0.5 text-amber-400">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 ml-1">4.9</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">À Propos de ce Contenu</h2>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {activeMaterial?.description || "Ce module fait partie intégrante de votre parcours de formation professionnelle. Il a été conçu pour vous apporter les compétences essentielles dans ce domaine."}
                                    </p>
                                </div>

                                {/* Learning Objectives & Assessment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen size={18} className="text-indigo-600" />
                                            <h4 className="font-bold text-slate-800 text-sm">Objectifs d'Apprentissage</h4>
                                        </div>
                                        <ul className="space-y-2.5">
                                            {['Maîtriser les concepts fondamentaux', 'Appliquer les bonnes pratiques', 'Développer une expertise pratique'].map((t, i) => (
                                                <li key={i} className="text-xs font-medium text-slate-600 flex items-start gap-2.5">
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <span>{t}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Target size={20} className="text-indigo-200" />
                                            <h4 className="font-bold text-sm">Évaluation des Compétences</h4>
                                        </div>
                                        <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                                            Validez vos acquis et obtenez votre certification professionnelle.
                                        </p>
                                        <button
                                            onClick={() => navigate(`/assessments/${courseId}`)}
                                            className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all backdrop-blur-sm"
                                        >
                                            Accéder aux Évaluations
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Progress Bar */}
                {!isCinemaMode && (
                    <div className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${progressPercentage === 100 ? 'bg-green-500' : 'bg-indigo-100'}`}>
                                {progressPercentage === 100 ? (
                                    <CheckCircle2 size={20} className="text-white" />
                                ) : (
                                    <span className="text-sm font-bold text-indigo-700">{progressPercentage}%</span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">
                                    {progressPercentage === 100 ? 'Formation Complétée !' : `${completedMaterials.size} sur ${materials.length} contenus terminés`}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {completedModules}/{modules.length} modules • {progressPercentage}% de complétion
                                </p>
                            </div>
                        </div>
                        {progressPercentage === 100 && (
                            <button
                                onClick={() => setIsCertModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                <Award size={16} /> Obtenir le Certificat
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Certificate Modal */}
            {isCertModalOpen && (
                <CertificateModal
                    isOpen={isCertModalOpen}
                    onClose={() => setIsCertModalOpen(false)}
                    courseName={course?.title}
                    studentName={`${user?.firstName} ${user?.lastName}`}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #F8FAFC; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
            `}} />
        </div>
    );
}
