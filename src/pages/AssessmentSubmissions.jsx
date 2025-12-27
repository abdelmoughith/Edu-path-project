import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { userService } from '../services/userService';
import { analyticsService } from '../services/analyticsService';
import { ArrowLeft, User, Calendar, CheckCircle, Clock, Award, Send, Eye, Download, TrendingUp, XCircle, Check, X, Search, Filter } from 'lucide-react';

const AssessmentSubmissions = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [viewingSubmission, setViewingSubmission] = useState(null);
    const [gradeForm, setGradeForm] = useState({ marksObtained: '', feedback: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [isAiGrading, setIsAiGrading] = useState(false);

    useEffect(() => {
        loadData();
    }, [assessmentId]);

    const loadData = async () => {
        try {
            const [assessmentData, submissionsData] = await Promise.all([
                assessmentService.getAssessmentById(assessmentId),
                assessmentService.getSubmissionsByAssessment(assessmentId)
            ]);

            setAssessment(assessmentData);
            setSubmissions(submissionsData);

            // Fetch ALL users once
            try {
                const allUsers = await userService.getAllStudents();
                const usersMap = {};

                const studentIds = [...new Set(submissionsData.map(s => s.studentId))];

                studentIds.forEach(studentId => {
                    const user = allUsers.find(u => u.id === studentId);
                    if (user) {
                        usersMap[studentId] = user;
                    } else {
                        usersMap[studentId] = {
                            id: studentId,
                            firstName: 'Utilisateur',
                            lastName: `#${studentId}`,
                            email: `user${studentId}@unknown.com`
                        };
                    }
                });

                setUsers(usersMap);
            } catch (userError) {
                console.error("Error fetching users:", userError);
                const userIds = [...new Set(submissionsData.map(s => s.studentId))];
                const usersMap = {};
                userIds.forEach(userId => {
                    usersMap[userId] = {
                        id: userId,
                        firstName: 'Utilisateur',
                        lastName: `#${userId}`,
                        email: `user${userId}@unknown.com`
                    };
                });
                setUsers(usersMap);
            }
        } catch (error) {
            console.error("Error loading submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (submission) => {
        setGradingSubmission(submission);
        setGradeForm({
            marksObtained: submission.marksObtained || '',
            feedback: submission.feedback || ''
        });
    };

    const handleViewDetails = (submission) => {
        let realAnswers = [];
        try {
            realAnswers = typeof submission.answers === 'string'
                ? JSON.parse(submission.answers)
                : (submission.answers || []);
        } catch (e) {
            console.error("Error parsing answers:", e);
        }

        setViewingSubmission({
            ...submission,
            answers: realAnswers
        });
    };

    const handleAiAssist = async () => {
        if (!gradingSubmission) return;
        setIsAiGrading(true);
        try {
            const aiFeedback = await analyticsService.getAiGradingFeedback(
                gradingSubmission.marksObtained || 0,
                assessment.maxMarks,
                assessment.title
            );
            setGradeForm(prev => ({
                ...prev,
                feedback: aiFeedback
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsAiGrading(false);
        }
    };

    const submitGrade = async (e) => {
        e.preventDefault();
        try {
            await assessmentService.gradeAssessment(gradingSubmission.id, {
                ...gradingSubmission,
                marksObtained: parseFloat(gradeForm.marksObtained),
                feedback: gradeForm.feedback,
                submissionStatus: 'GRADED',
                gradedAt: new Date().toISOString()
            });

            setGradingSubmission(null);
            setGradeForm({ marksObtained: '', feedback: '' });
            loadData();
        } catch (error) {
            console.error("Error grading submission:", error);
            alert("Erreur lors de la notation");
        }
    };

    const exportResults = () => {
        const csvContent = [
            ['Étudiant', 'Email', 'Date Soumission', 'Statut', 'Note', 'Feedback'].join(','),
            ...submissions.map(s => {
                const student = users[s.studentId] || {};
                return [
                    `${student.firstName} ${student.lastName}`,
                    student.email,
                    formatDate(s.submittedAt),
                    s.submissionStatus,
                    s.marksObtained || 'N/A',
                    `"${s.feedback || ''}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soumissions_${assessment?.title}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getStatusBadge = (status) => {
        const configs = {
            'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'EN ATTENTE', icon: '⏳' },
            'SUBMITTED': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'À CORRIGER', icon: '📝' },
            'GRADED': { bg: 'bg-green-100', text: 'text-green-700', label: 'NOTÉ', icon: '✅' },
            'FAILED': { bg: 'bg-red-100', text: 'text-red-700', label: 'ÉCHOUÉ', icon: '❌' }
        };
        const config = configs[status] || configs['PENDING'];
        return (
            <span className={`px-3 py-1.5 ${config.bg} ${config.text} text-xs font-bold rounded-full inline-flex items-center gap-1`}>
                <span>{config.icon}</span>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateStats = () => {
        const graded = submissions.filter(s => s.submissionStatus === 'GRADED');
        const scores = graded.map(s => s.marksObtained);

        // --- V3 QUESTION ANALYTICS ---
        const questionStats = [];
        if (assessment?.questions && submissions.length > 0) {
            assessment.questions.forEach((q, qIdx) => {
                let failCount = 0;
                let totalAnswered = 0;

                submissions.forEach(sub => {
                    let subAnswers = [];
                    try {
                        subAnswers = typeof sub.answers === 'string' ? JSON.parse(sub.answers) : (sub.answers || []);
                    } catch (e) { }

                    const ans = subAnswers.find(a => a.questionId === q.id) || subAnswers[qIdx];
                    if (ans) {
                        totalAnswered++;
                        if (!ans.isCorrect) failCount++;
                    }
                });

                questionStats.push({
                    idx: qIdx,
                    question: q.question,
                    failRate: totalAnswered > 0 ? (failCount / totalAnswered) * 100 : 0
                });
            });
        }

        const topPains = [...questionStats]
            .filter(qs => qs.failRate > 50)
            .sort((a, b) => b.failRate - a.failRate);

        return {
            total: submissions.length,
            pending: submissions.filter(s => s.submissionStatus === 'SUBMITTED').length,
            graded: graded.length,
            average: graded.length > 0 ? (scores.reduce((a, b) => a + b, 0) / graded.length).toFixed(1) : 'N/A',
            highest: graded.length > 0 ? Math.max(...scores) : 'N/A',
            lowest: graded.length > 0 ? Math.min(...scores) : 'N/A',
            painPoints: topPains
        };
    };

    const stats = calculateStats();

    const filteredSubmissions = submissions.filter(s => {
        const student = users[s.studentId] || {};
        const matchesSearch = `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || s.submissionStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement des soumissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Modern Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <button onClick={() => navigate('/admin/assessments')} className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2 font-medium transition-colors">
                        <ArrowLeft size={20} />
                        Retour aux évaluations
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {assessment?.title}
                            </h1>
                            <p className="text-gray-600 mt-2">Soumissions et correction détaillée</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button
                                onClick={exportResults}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm font-medium"
                            >
                                <Download size={18} />
                                Exporter CSV
                            </button>
                            <div className="text-right bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg">
                                <p className="text-xs opacity-90">Note maximale</p>
                                <p className="text-2xl font-bold">{assessment?.maxMarks} pts</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mt-6 flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher un étudiant..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white appearance-none cursor-pointer"
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="SUBMITTED">À corriger</option>
                                <option value="GRADED">Notés</option>
                                <option value="PENDING">En attente</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: 'Total', value: stats.total, icon: User, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
                        { label: 'À corriger', value: stats.pending, icon: Clock, color: 'yellow', gradient: 'from-yellow-500 to-yellow-600' },
                        { label: 'Notés', value: stats.graded, icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-green-600' },
                        { label: 'Moyenne', value: stats.average, icon: Award, color: 'indigo', gradient: 'from-indigo-500 to-indigo-600' },
                        { label: 'Max', value: stats.highest, icon: TrendingUp, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
                        { label: 'Min', value: stats.lowest, icon: XCircle, color: 'red', gradient: 'from-red-500 to-red-600' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                                <stat.icon className="text-white" size={24} />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* V3 AI Insights Section */}
                {stats.painPoints && stats.painPoints.length > 0 && (
                    <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-amber-900 tracking-tight uppercase">Alertes de Performance IA</h3>
                                    <p className="text-sm font-bold text-amber-700/60 uppercase tracking-widest mt-0.5">Analyse des points de blocage collectifs</p>
                                </div>
                            </div>
                            <div className="px-5 py-2 bg-amber-200/50 rounded-full text-amber-800 text-[10px] font-black uppercase tracking-widest">
                                {stats.painPoints.length} Point(s) de vigilance
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.painPoints.slice(0, 3).map((pp, idx) => (
                                <div key={idx} className="bg-white/80 p-5 rounded-3xl border border-amber-200 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <span className="h-6 w-6 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center">Q{pp.idx + 1}</span>
                                        <span className="text-rose-600 font-bold text-xs">{pp.failRate.toFixed(0)}% d'échec</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-tight">"{pp.question}"</p>
                                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-tight mt-auto flex items-center gap-1">
                                        💡 Conseil : Réviser le module lié
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submissions Table */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Étudiant
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Date de soumission
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Note
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <Award size={48} className="text-gray-300 mb-3" />
                                                <p className="text-gray-500 font-medium">
                                                    {searchTerm || filterStatus !== 'ALL' ? 'Aucun résultat trouvé' : 'Aucune soumission pour le moment'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubmissions.map(submission => {
                                        const student = users[submission.studentId] || {};
                                        return (
                                            <tr key={submission.id} className="hover:bg-indigo-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                                                            <span className="text-white font-bold text-lg">
                                                                {student.firstName?.[0]}{student.lastName?.[0]}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {student.firstName} {student.lastName}
                                                            </p>
                                                            <p className="text-sm text-gray-500">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar size={16} className="text-gray-400" />
                                                        {formatDate(submission.submittedAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(submission.submissionStatus)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {submission.submissionStatus === 'GRADED' ? (
                                                        <div>
                                                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                                {submission.marksObtained}/{assessment.maxMarks}
                                                            </span>
                                                            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${(submission.marksObtained / assessment.maxMarks) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(submission)}
                                                            className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors"
                                                        >
                                                            <Eye size={16} />
                                                            Détails
                                                        </button>
                                                        <button
                                                            onClick={() => handleGrade(submission)}
                                                            className="flex items-center gap-1 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm transition-colors"
                                                        >
                                                            {submission.submissionStatus === 'GRADED' ? 'Modifier' : 'Noter'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Details Modal - Enhanced */}
            {viewingSubmission && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl">
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">📊 Détails de la soumission</h2>
                                    <p className="text-indigo-100 mt-1">
                                        {users[viewingSubmission.studentId]?.firstName} {users[viewingSubmission.studentId]?.lastName}
                                    </p>
                                </div>
                                <button onClick={() => setViewingSubmission(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-4">
                                    <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
                                        <Calendar size={16} />
                                        Date de soumission
                                    </p>
                                    <p className="text-lg font-bold text-blue-900 mt-2">
                                        {formatDate(viewingSubmission.submittedAt)}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-4">
                                    <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                                        <Award size={16} />
                                        Note obtenue
                                    </p>
                                    <p className="text-lg font-bold text-green-900 mt-2">
                                        {viewingSubmission.marksObtained || 'Non noté'}/{assessment.maxMarks}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-4">
                                    <p className="text-sm text-purple-700 font-semibold flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        Taux de réussite
                                    </p>
                                    <p className="text-lg font-bold text-purple-900 mt-2">
                                        {viewingSubmission.answers.filter(a => a.isCorrect).length}/{assessment?.questions?.length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Questions Review */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span>📝</span> Révision des réponses
                                </h3>
                                {assessment?.questions?.map((question, idx) => {
                                    const answer = viewingSubmission.answers.find(a => a.questionId === question.id) ||
                                        viewingSubmission.answers[idx]; // Fallback if IDs mismatch
                                    const isCorrect = answer?.isCorrect;

                                    return (
                                        <div key={question.id} className={`border-2 rounded-2xl p-6 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                    {isCorrect ? <Check size={24} className="text-white" /> : <X size={24} className="text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 mb-3">
                                                        Question {idx + 1}: {question.question}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {question.options.map((option, optIdx) => {
                                                            const isSelected = answer.selectedAnswer === optIdx;
                                                            const isCorrectOption = question.correctAnswer === optIdx;

                                                            return (
                                                                <div
                                                                    key={optIdx}
                                                                    className={`p-3 rounded-xl border-2 transition-all ${isCorrectOption
                                                                        ? 'border-green-500 bg-green-100 shadow-md'
                                                                        : isSelected
                                                                            ? 'border-red-500 bg-red-100'
                                                                            : 'border-gray-200 bg-white'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {isSelected && <span className="text-red-600 font-bold text-lg">→</span>}
                                                                        {isCorrectOption && <CheckCircle size={18} className="text-green-600" />}
                                                                        <span className={isCorrectOption ? 'font-bold text-green-900' : 'text-gray-700'}>
                                                                            {option}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t-2 border-gray-100 bg-gray-50 rounded-b-3xl">
                            <button
                                onClick={() => {
                                    setViewingSubmission(null);
                                    handleGrade(viewingSubmission);
                                }}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                            >
                                Noter cette soumission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grading Modal - Enhanced */}
            {gradingSubmission && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl">
                            <h2 className="text-2xl font-bold text-white">✏️ Noter la soumission</h2>
                            <p className="text-indigo-100 mt-1">
                                {users[gradingSubmission.studentId]?.firstName} {users[gradingSubmission.studentId]?.lastName}
                            </p>
                        </div>

                        <form onSubmit={submitGrade} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Note obtenue (sur {assessment.maxMarks}) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max={assessment.maxMarks}
                                    step="0.5"
                                    value={gradeForm.marksObtained}
                                    onChange={(e) => setGradeForm({ ...gradeForm, marksObtained: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-xl font-bold transition-all"
                                    placeholder="Ex: 85"
                                />
                            </div>

                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Commentaires / Feedback
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAiAssist}
                                    disabled={isAiGrading}
                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-lg"
                                >
                                    <Sparkles size={12} className={isAiGrading ? "animate-spin" : ""} />
                                    {isAiGrading ? "Analyse..." : "Assistant IA"}
                                </button>
                            </div>
                            <textarea
                                value={gradeForm.feedback}
                                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                rows="4"
                                placeholder="Excellent travail ! Quelques points à améliorer..."
                            />

                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <Calendar size={16} />
                                    <strong>Date de soumission:</strong> {formatDate(gradingSubmission.submittedAt)}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setGradingSubmission(null)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                                >
                                    <Send size={20} />
                                    Enregistrer la note
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentSubmissions;
