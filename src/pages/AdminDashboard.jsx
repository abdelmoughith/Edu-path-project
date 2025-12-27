import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { userService } from '../services/userService';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    LogOut,
    PlusCircle,
    Trash2,
    Edit,
    Search,
    UserPlus,
    Bell,
    TrendingUp,
    FileText,
    BrainCircuit,
    Activity,
    Award,
    AlertTriangle
} from 'lucide-react';
import { activityService } from '../services/activityService';
import { analyticsService } from '../services/analyticsService';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'courses' | 'users' | 'ia'
    const [stats, setStats] = useState({ students: 1254, courses: 0, alerts: 5 });
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [adminProfile, setAdminProfile] = useState(null);

    const [activityStats, setActivityStats] = useState(null);
    const [aiHealth, setAiHealth] = useState('Unknown');
    const [riskAlerts, setRiskAlerts] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await userService.getMe();
            setAdminProfile(user);

            const [coursesData, activitiesData, usersData] = await Promise.all([
                courseService.getAllCourses(),
                activityService.getActivityStats(),
                userService.getAllStudents()
            ]);

            console.log("Debug: Users fetched from backend:", usersData);

            let registeredStudents = 0;
            if (Array.isArray(usersData)) {
                // Précis: Chercher explicitement les étudiants (insensible à la casse)
                registeredStudents = usersData.filter(u => {
                    const r = u.role?.toUpperCase() || "";
                    return r === 'STUDENT' || r === 'ROLE_STUDENT' || r === 'ETUDIANT';
                }).length;

                // Fallback: Si le filtre précis ne donne rien (ex: rôles mal configurés),
                // on compte tous ceux qui ne sont pas ADMIN.
                if (registeredStudents === 0 && usersData.length > 0) {
                    console.warn("Avertissement: Aucun rôle 'STUDENT' trouvé, utilisation du fallback non-ADMIN.");
                    registeredStudents = usersData.filter(u => {
                        const r = u.role?.toUpperCase() || "";
                        return r !== 'ADMIN' && r !== 'ROLE_ADMIN';
                    }).length;
                }
            }

            setCourses(coursesData);
            setActivityStats(activitiesData);

            // Fetch AI Health
            try {
                const healthData = await analyticsService.checkHealth();
                // Ensure we get a string for the badge
                const status = (typeof healthData === 'string') ? healthData : (healthData?.status || 'Active');
                setAiHealth(status);
            } catch {
                setAiHealth('Service Unreachable');
            }

            // Simulate some risk alerts for high-risk modules
            const alerts = [
                { studentId: 101, studentName: "Sami Raouf", module: "Architecture MS", risk: "HIGH", probability: 0.35 },
                { studentId: 105, studentName: "Laila Bennani", module: "Docker & K8s", risk: "MEDIUM", probability: 0.55 }
            ];
            setRiskAlerts(alerts);

            setStats(prev => ({
                ...prev,
                courses: coursesData.length,
                students: registeredStudents,
                activeStudents: activitiesData.activeStudents,
                alerts: alerts.length
            }));
        } catch (error) {
            console.error("Erreur chargement admin", error);
            // Fallback for demo if not logged in as admin
            setAdminProfile({ firstName: "Admin", lastName: "User", role: "ADMIN" });
        } finally {
            setLoading(false);
        }
    };

    const getCourseTitle = (courseCode) => {
        const course = courses.find(c => c.courseCode === courseCode || c.id === courseCode);
        return course ? course.title : courseCode;
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;
        try {
            await courseService.deleteCourse(id);
            setCourses(courses.filter(c => c.id !== id));
            setStats(prev => ({ ...prev, courses: prev.courses - 1 }));
        } catch {
            alert("Erreur lors de la suppression.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar Modern */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10">
                <div className="p-8">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        EduPath <span className="text-indigo-600">ADMIN</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Vue d'ensemble"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <NavItem
                        icon={<BookOpen size={20} />}
                        label="Gestion des Cours"
                        active={activeTab === 'courses'}
                        onClick={() => setActiveTab('courses')}
                        badge={stats.courses}
                    />

                    <NavItem
                        icon={<Activity size={20} />}
                        label="Activités Étudiants"
                        active={activeTab === 'activities'}
                        onClick={() => setActiveTab('activities')}
                    />

                    <NavItem
                        icon={<Award size={20} />}
                        label="Évaluations"
                        onClick={() => navigate('/admin/assessments')}
                    />

                    <NavItem
                        icon={<BrainCircuit size={20} />}
                        label="Configuration IA"
                        active={activeTab === 'ia'}
                        onClick={() => setActiveTab('ia')}
                        badge="New"
                    />
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={() => userService.logout()}
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 font-medium"
                    >
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50">
                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 py-5 flex justify-between items-center border-b border-gray-100/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Panneau de Contrôle</h2>
                        <p className="text-gray-500 text-sm">Bienvenue, {adminProfile?.firstName || 'Admin'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-800">
                                    {adminProfile?.firstName ? `${adminProfile.firstName} ${adminProfile.lastName}` : (adminProfile?.email || 'Administrateur')}
                                </p>
                                <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full inline-block">ADMIN</p>
                            </div>
                            <div
                                onClick={() => navigate('/profile')}
                                className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 cursor-pointer hover:scale-110 transition-transform"
                            >
                                {adminProfile?.firstName ? adminProfile.firstName[0] : 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">

                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <KPICard
                                    title="Étudiants Actifs"
                                    value={stats.activeStudents?.toLocaleString() || "0"}
                                    trend={`${stats.students || 0} inscrits au total`}
                                    trendColor="text-indigo-600"
                                    icon={<Users className="text-indigo-600" size={24} />}
                                    bg="bg-indigo-50"
                                />
                                <KPICard
                                    title="Cours Publiés"
                                    value={stats.courses}
                                    trend="Gérer les modules"
                                    trendColor="text-indigo-600"
                                    icon={<BookOpen className="text-purple-600" size={24} />}
                                    bg="bg-purple-50"
                                />
                                <KPICard
                                    title="Alertes IA"
                                    value={stats.alerts}
                                    trend="Actions requises"
                                    trendColor="text-red-500"
                                    icon={<BrainCircuit className="text-rose-600" size={24} />}
                                    bg="bg-rose-50"
                                />
                            </div>

                            {/* Actions Rapides */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Actions Rapides</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <QuickAction
                                        icon={<PlusCircle size={24} />}
                                        title="Ajouter un nouveau cours"
                                        desc="Créer et publier un nouveau module d'apprentissage"
                                        onClick={() => navigate('/create-course')}
                                        primary
                                    />
                                    <QuickAction
                                        icon={<FileText size={24} />}
                                        title="Générer Rapport Mensuel"
                                        desc="Télécharger les statistiques d'engagement"
                                    />
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">Catalogue des cours</h3>
                                <button
                                    onClick={() => navigate('/create-course')}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium"
                                >
                                    <PlusCircle size={18} /> Nouveau Cours
                                </button>
                            </div>
                            <CoursesTable courses={courses} onDelete={handleDeleteCourse} onEdit={(id) => navigate(`/manage-content/${id}`)} />
                        </div>
                    )}



                    {activeTab === 'activities' && activityStats && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* KPIs Activité */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <KPICard
                                    title="Total Intéractions"
                                    value={activityStats.totalClicks.toLocaleString()}
                                    trend="Clics & Vues"
                                    trendColor="text-indigo-600"
                                    icon={<Activity className="text-white" size={24} />}
                                    bg="bg-indigo-600 text-white"
                                />
                                <KPICard
                                    title="Étudiants Actifs"
                                    value={activityStats.activeStudents}
                                    trend="Ayant une activité"
                                    trendColor="text-emerald-500"
                                    icon={<Users className="text-emerald-600" size={24} />}
                                    bg="bg-emerald-50"
                                />
                                <KPICard
                                    title="Cours le plus vu"
                                    value={getCourseTitle(activityStats.mostPopularCourse?.code) || "N/A"}
                                    trend={`${activityStats.mostPopularCourse?.clicks || 0} clics`}
                                    trendColor="text-purple-600"
                                    icon={<TrendingUp className="text-purple-600" size={24} />}
                                    bg="bg-purple-50"
                                />
                            </div>

                            {/* Timeline des Activités Récentes */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Activités Récentes</h3>
                                <div className="space-y-0">
                                    {activityStats.recentActivities.length > 0 ? (
                                        activityStats.recentActivities.map((activity, index) => (
                                            <div key={activity.id || index} className="flex gap-4 pb-6 relative last:pb-0">
                                                {/* Ligne verticale timeline */}
                                                {index !== activityStats.recentActivities.length - 1 && (
                                                    <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-gray-100"></div>
                                                )}

                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600">
                                                        <Activity size={18} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                Interaction sur <span className="text-indigo-600">{getCourseTitle(activity.courseCode)}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Module : <span className="font-medium">{activity.moduleCode}</span>
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                                                            {new Date(activity.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                                                            +{activity.sumClicks} Clics
                                                        </span>
                                                        <span className="text-xs text-gray-400">ID Étudiant: {activity.studentId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            Aucune activité récente enregistrée.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ia' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                            <BrainCircuit size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">État du Service IA</h3>
                                            <p className="text-sm text-gray-400">Statut en temps réel du moteur de prédiction</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="font-semibold text-gray-600">Connectivité</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${aiHealth.toLowerCase().includes('healthy') || aiHealth.toLowerCase().includes('active') || aiHealth.toLowerCase().includes('up') || aiHealth.toLowerCase() === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {aiHealth}
                                        </span>
                                    </div>
                                </section>

                                <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <TrendingUp className="text-indigo-600" size={24} />
                                        Insights Globaux
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Précision du Modèle</span>
                                            <span className="font-bold text-gray-900">94.2%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <AlertTriangle className="text-rose-600" size={24} />
                                        Étudiants à Risque (Détection IA)
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Étudiant</th>
                                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Module</th>
                                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Proba. Succès</th>
                                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase text-right">Alerte</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {riskAlerts.map((alert, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-4 font-bold text-gray-900">{alert.studentName}</td>
                                                    <td className="px-8 py-4 text-gray-600">{alert.module}</td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 bg-gray-100 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${alert.risk === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                                    style={{ width: `${alert.probability * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="font-bold">{Math.round(alert.probability * 100)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${alert.risk === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {alert.risk} RISK
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

// UI Components

const NavItem = ({ icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${active
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        {badge && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active
                ? 'bg-white/20 text-white'
                : typeof badge === 'number' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                }`}>
                {badge}
            </span>
        )}
    </button>
);

const KPICard = ({ title, value, trend, trendColor, icon, bg }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${bg}`}>
                {icon}
            </div>
            {/* <span className="text-gray-400 hover:text-gray-600 cursor-pointer"><MoreHorizontal size={20} /></span> */}
        </div>
        <div>
            <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{value}</h2>
            <span className={`text-xs font-bold ${trendColor} bg-gray-50 px-2 py-1 rounded inline-block`}>
                {trend}
            </span>
        </div>
    </div>
);

const QuickAction = ({ icon, title, desc, onClick, primary }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 p-6 rounded-2xl border transition-all text-left group ${primary
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-transparent shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02]'
            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}
    >
        <div className={`p-3 rounded-xl ${primary ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
            {icon}
        </div>
        <div>
            <h4 className={`font-bold ${primary ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
            <p className={`text-sm mt-1 ${primary ? 'text-indigo-100' : 'text-gray-500'}`}>{desc}</p>
        </div>
    </button>
);

const CoursesTable = ({ courses, onDelete, onEdit }) => (
    <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Titre</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Code</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Description</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {courses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                    <td className="px-6 py-4"><span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">{course.courseCode}</span></td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-xs text-sm">{course.description}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 transition-opacity">
                        <button
                            onClick={() => onEdit(course.id)}
                            className="text-gray-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(course.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);


