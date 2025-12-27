import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { courseService } from '../services/courseService';
import {
    Plus,
    Edit,
    Trash2,
    Award,
    Clock,
    BookOpen,
    X,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    Target,
    LayoutGrid,
    SearchX,
    Sparkles,
    FileText,
    ArrowLeft
} from 'lucide-react';

const AssessmentManager = () => {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assessmentType: 'QUIZ',
        maxMarks: 100,
        durationMinutes: 30,
        status: 'ACTIVE',
        weekNumber: 1,
        courseId: '',
        questionCount: 5,
        questions: []
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    });
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assessmentsData, coursesData] = await Promise.all([
                assessmentService.getAllAssessments(),
                courseService.getAllCourses()
            ]);
            setAssessments(assessmentsData);
            setCourses(coursesData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await assessmentService.createAssessment({
                ...formData,
                maxMarks: parseFloat(formData.maxMarks),
                durationMinutes: parseInt(formData.durationMinutes),
                weekNumber: parseInt(formData.weekNumber),
                questionCount: parseInt(formData.questionCount)
            });
            setShowCreateModal(false);
            setFormData({
                title: '',
                description: '',
                assessmentType: 'QUIZ',
                maxMarks: 100,
                durationMinutes: 30,
                status: 'ACTIVE',
                weekNumber: 1,
                courseId: '',
                questionCount: 5,
                questions: []
            });
            setCurrentQuestion({
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0
            });
            setEditingQuestionIndex(-1);
            loadData();
        } catch (error) {
            console.error("Error creating assessment:", error);
            alert("Erreur lors de la création de l'évaluation");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")) return;

        try {
            await assessmentService.deleteAssessment(id);
            loadData();
        } catch (error) {
            console.error("Error deleting assessment:", error);
            alert("Erreur lors de la suppression");
        }
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case 'QUIZ': return { color: 'bg-indigo-600', gradient: 'from-indigo-600 to-blue-500', shadow: 'shadow-indigo-500/20', icon: <FileText size={20} /> };
            case 'EXAM': return { color: 'bg-rose-600', gradient: 'from-rose-600 to-orange-500', shadow: 'shadow-rose-500/20', icon: <Award size={20} /> };
            case 'ASSIGNMENT': return { color: 'bg-emerald-600', gradient: 'from-emerald-600 to-teal-500', shadow: 'shadow-emerald-500/20', icon: <BookOpen size={20} /> };
            case 'PROJECT': return { color: 'bg-violet-600', gradient: 'from-violet-600 to-purple-500', shadow: 'shadow-violet-500/20', icon: <Target size={20} /> };
            default: return { color: 'bg-slate-600', gradient: 'from-slate-600 to-slate-400', shadow: 'shadow-slate-500/20', icon: <LayoutGrid size={20} /> };
        }
    };

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course?.title || 'Unknown Course';
    };

    const filteredAssessments = assessments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCourseName(a.courseId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || a.assessmentType === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={20} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            {/* Elegant Top Header */}
            <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                Évaluations <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Manager</span>
                            </h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pilotage Central</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-sm"
                    >
                        <Plus size={18} /> Nouvelle Évaluation
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
                {/* Search & Tabs */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['ALL', 'QUIZ', 'EXAM', 'ASSIGNMENT', 'PROJECT'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {type === 'ALL' ? 'Tous' : type}
                            </button>
                        ))}
                    </div>

                    <div className="w-full md:w-96 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par titre ou cours..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Main Content Grid */}
                {filteredAssessments.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="p-6 bg-slate-50 rounded-full mb-6">
                            <SearchX size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Aucun résultat trouvé</h3>
                        <p className="text-slate-400 font-medium mb-8">Nous n'avons trouvé aucune évaluation correspondant à vos critères.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterType('ALL'); }}
                            className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAssessments.map(assessment => {
                            const config = getTypeConfig(assessment.assessmentType);
                            return (
                                <div
                                    key={assessment.id}
                                    className="group relative bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                                >
                                    {/* Type Ribbon */}
                                    <div className={`absolute top-0 right-0 py-2 px-8 rounded-bl-3xl bg-gradient-to-r ${config.gradient} text-white text-[9px] font-black uppercase tracking-widest shadow-lg`}>
                                        {assessment.assessmentType}
                                    </div>

                                    <div className="flex items-start gap-4 mb-8">
                                        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-xl ${config.shadow}`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-12">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight truncate mb-1">
                                                {assessment.title}
                                            </h3>
                                            <p className="text-xs font-black text-indigo-500 flex items-center gap-1.5 uppercase tracking-widest">
                                                <BookOpen size={12} /> {getCourseName(assessment.courseId)}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2 h-10 italic">
                                        "{assessment.description || "Aucune description détaillée."}"
                                    </p>

                                    <div className="grid grid-cols-4 gap-2 mb-8">
                                        <MiniKPI value={`${assessment.durationMinutes}m`} label="Durée" icon={<Clock size={12} />} />
                                        <MiniKPI value={assessment.maxMarks} label="Points" icon={<Award size={12} />} />
                                        <MiniKPI value={`M${assessment.weekNumber}`} label="Module" icon={<LayoutGrid size={12} />} />
                                        <MiniKPI value={assessment.questionCount || assessment.questions?.length || 0} label="Questions" icon={<Plus size={12} />} />
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => navigate(`/admin/assessment/${assessment.id}/submissions`)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                        >
                                            Soumissions <ChevronRight size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(assessment.id)}
                                            className="p-3.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-slate-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Premium Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[4rem] max-w-6xl w-full h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex">
                        {/* Form Section */}
                        <div className="flex-1 overflow-y-auto p-12 border-r border-slate-100 relative">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Nouvelle Évaluation</h2>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Configuration Pédagogique</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Titre Global</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                                            placeholder="Ex: Architecture de Reference Microservices"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Type</label>
                                            <select
                                                required
                                                value={formData.assessmentType}
                                                onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-600 transition-all outline-none appearance-none"
                                            >
                                                <option value="QUIZ">Quiz Interactif</option>
                                                <option value="EXAM">Examen Final</option>
                                                <option value="ASSIGNMENT">Devoir Pratique</option>
                                                <option value="PROJECT">Projet de Groupe</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Cours</label>
                                            <select
                                                required
                                                value={formData.courseId}
                                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-600 transition-all outline-none appearance-none"
                                            >
                                                <option value="">Sélection...</option>
                                                {courses.map(course => (
                                                    <option key={course.id} value={course.id}>{course.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-6">
                                        <FormInput label="Points" type="number" value={formData.maxMarks} onChange={(v) => setFormData({ ...formData, maxMarks: v })} />
                                        <FormInput label="Durée (min)" type="number" value={formData.durationMinutes} onChange={(v) => setFormData({ ...formData, durationMinutes: v })} />
                                        <FormInput label="Module #" type="number" value={formData.weekNumber} onChange={(v) => setFormData({ ...formData, weekNumber: v })} />
                                        <FormInput label="Nb. Questions" type="number" value={formData.questionCount} onChange={(v) => setFormData({ ...formData, questionCount: v })} />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 font-sans"
                                    >
                                        Valider & Publier l'Évaluation
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Question Builder Sidebar/Section */}
                        <div className="bg-slate-50 w-[500px] border-l border-slate-200 overflow-y-auto p-10 flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Constructeur de Questions</h3>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Éditeur MCQ Interactif</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm">
                                    {formData.questions.length}
                                </div>
                            </div>

                            {/* Question Preview List */}
                            <div className="flex-1 space-y-4 mb-10 overflow-y-auto pr-2 custom-scrollbar">
                                {formData.questions.map((q, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm group relative">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <span className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <p className="text-sm font-bold text-slate-700 flex-1 line-clamp-2 leading-tight pr-8">{q.question}</p>
                                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setCurrentQuestion(q);
                                                        setEditingQuestionIndex(idx);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newQuestions = [...formData.questions];
                                                        newQuestions.splice(idx, 1);
                                                        setFormData({ ...formData, questions: newQuestions });
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className={`text-[9px] px-2 py-1 rounded-md border ${oIdx === q.correctAnswer ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-400 font-medium'} truncate`}>
                                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {formData.questions.length === 0 && (
                                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center px-6">
                                        <Sparkles size={32} className="text-slate-200 mb-4" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune question</p>
                                        <p className="text-[10px] text-slate-300 mt-2">Commencez à bâtir votre test ci-dessous.</p>
                                    </div>
                                )}
                            </div>

                            {/* Question Input Form */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Énoncé de la question</label>
                                    <textarea
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-600 transition-all outline-none resize-none h-24"
                                        placeholder="Ex: Quelle est la différence entre SQL et NoSQL ?"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Options & Réponse</label>
                                    {currentQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                                className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${currentQuestion.correctAnswer === idx ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-300 hover:border-slate-300'}`}
                                            >
                                                <span className="text-xs font-black">{String.fromCharCode(65 + idx)}</span>
                                            </button>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOptions = [...currentQuestion.options];
                                                    newOptions[idx] = e.target.value;
                                                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                }}
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-indigo-600 transition-all outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!currentQuestion.question || currentQuestion.options.some(o => !o)) {
                                            alert("Veuillez remplir l'énoncé et toutes les options.");
                                            return;
                                        }
                                        const newQuestions = [...formData.questions];
                                        if (editingQuestionIndex > -1) {
                                            newQuestions[editingQuestionIndex] = currentQuestion;
                                        } else {
                                            newQuestions.push(currentQuestion);
                                        }
                                        setFormData({ ...formData, questions: newQuestions });
                                        setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
                                        setEditingQuestionIndex(-1);
                                    }}
                                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {editingQuestionIndex > -1 ? <><Edit size={14} /> Mettre à jour</> : <><Plus size={14} /> Ajouter la question</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MiniKPI = ({ value, label, icon }) => (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
        <div className="text-slate-400 mx-auto w-fit mb-1">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 leading-none">{label}</p>
        <p className="text-sm font-black text-slate-900 leading-none">{value}</p>
    </div>
);

const FormInput = ({ label, type, value, onChange }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{label}</label>
        <input
            type={type}
            required
            min="1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-indigo-600 transition-all outline-none"
        />
    </div>
);

export default AssessmentManager;
