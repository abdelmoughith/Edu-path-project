import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { courseService } from '../services/courseService';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../services/activityService';
import MainLayout from '../components/MainLayout';
import {
    BookOpen,
    GraduationCap,
    Zap,
    ArrowRight,
    Compass,
    Sparkles,
    MousePointer2,
    Loader2,
    MapPin
} from 'lucide-react';

/**
 * Premium Student Dashboard - "The Mission Control"
 * Refactored to use centralized StudentLayout.
 */
export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [suggestedCourses, setSuggestedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ clicks: 0, courses: 0, completedCount: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await userService.getMe();
                // Patching legacy data
                if (!userData.firstName || userData.firstName === 'null') userData.firstName = userData.email?.split('@')[0] || 'User';
                if (!userData.lastName || userData.lastName === 'null') userData.lastName = "";

                if (userData.email?.toLowerCase().includes('admin')) userData.role = 'ADMIN';
                setUser(userData);

                if (userData.role === 'ADMIN') {
                    navigate('/admin-dashboard');
                    return;
                }

                // Parallel Optimization
                const [enrolled, all] = await Promise.all([
                    courseService.getMyCourses().catch(() => []),
                    courseService.getAllCourses().catch(() => [])
                ]);

                setCourses(enrolled || []);

                // Logic for smart suggestions
                const enrolledIds = new Set((enrolled || []).map(c => c.id));
                const suggestions = (all || []).filter(c => !enrolledIds.has(c.id)).slice(0, 3);
                setSuggestedCourses(suggestions);

                // Fetch real activity stats
                const clicks = await activityService.getTotalClicksByStudent(userData.id).catch(() => 0);

                // Progress calculation sync
                let completedCount = 0;
                (enrolled || []).forEach(course => {
                    const saved = localStorage.getItem(`user_${userData.id}_course_${course.id}_percentage`);
                    if (saved && parseInt(saved) === 100) completedCount++;
                });

                setStats({
                    clicks,
                    courses: enrolled?.length || 0,
                    completedCount
                });

            } catch (err) {
                console.error("[Dashboard] Critical loading failure", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-black tracking-widest text-[10px]">INITIALISATION DU CENTRE DE COMMANDE...</p>
        </div>
    );

    return (
        <MainLayout>
            <div className="px-6 lg:px-10 pb-20 space-y-10">

                {/* Hero Section: Dynamic Profile */}
                <section className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500 rounded-[3.5rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                    <div className="relative bg-white rounded-[3.5rem] shadow-2xl shadow-indigo-100 p-10 overflow-hidden border border-white">
                        {/* Visual Noise/Design */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 rotate-6 translate-x-12 translate-y-12 rounded-[5rem] -z-0"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-[#F8FAFC] flex items-center justify-center shadow-inner border-4 border-white">
                                    <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 rounded-2xl border-4 border-white shadow-xl text-white animate-bounce-low">
                                    <Zap size={18} fill="currentColor" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{user?.firstName} {user?.lastName}</h2>
                                    <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                                        Elite Student
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="text-indigo-400" size={16} /> Marrakech, MA
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="text-purple-400" size={16} /> EMSI 5ème Année
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <HeaderStat label="Interactions" value={stats.clicks} icon={<MousePointer2 size={12} />} />
                                    <HeaderStat label="Cours Actifs" value={stats.courses} icon={<BookOpen size={12} />} />
                                    <HeaderStat label="Certificats" value={stats.completedCount} icon={<GraduationCap size={12} />} />
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/profile')}
                                className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:-translate-y-1 active:scale-95 transition-all shadow-2xl"
                            >
                                Page de Profil
                            </button>
                        </div>
                    </div>
                </section>

                {/* Content Matrix: Personal vs Suggestions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* LEFT: Current Learning Loop */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">VOTRE PARCOURS</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 3 des cours les plus actifs</p>
                            </div>
                            <button
                                onClick={() => navigate('/my-courses')}
                                className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-indigo-50 transition-all flex items-center gap-2"
                            >
                                Mon Hub <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {courses.length > 0 ? courses.slice(0, 3).map((course, idx) => (
                                <CompactCourseCard key={course.id} course={course} isEnrolled={true} user={user} delay={idx * 100} />
                            )) : (
                                <EmptyStateHint type="enrolled" />
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Opportunities Matrix */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">DÉCOUVRIR</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommandations pour votre profil</p>
                            </div>
                            <button
                                onClick={() => navigate('/courses')}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Catalogue <Compass size={14} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {suggestedCourses.length > 0 ? suggestedCourses.slice(0, 3).map((course, idx) => (
                                <CompactCourseCard key={course.id} course={course} isEnrolled={false} delay={idx * 100} />
                            )) : (
                                <EmptyStateHint type="suggestions" />
                            )}
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes bounce-low {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                    .animate-bounce-low { animation: bounce-low 3s ease-in-out infinite; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}} />
            </div>
        </MainLayout>
    );
}

function HeaderStat({ label, value, icon }) {
    return (
        <div className="bg-[#F8FAFC] px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="text-indigo-400">{icon}</div>
            <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900 leading-none">{value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
            </div>
        </div>
    );
}

function CompactCourseCard({ course, isEnrolled, user, delay }) {
    const navigate = useNavigate();
    const progress = user?.id ? (localStorage.getItem(`user_${user.id}_course_${course.id}_percentage`) || 0) : 0;

    return (
        <div
            onClick={() => navigate(isEnrolled ? `/course/${course.id}/learn` : `/courses`)}
            className="group bg-white p-5 rounded-[2.5rem] border border-slate-50 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer flex items-center gap-6"
            style={{ animation: `fadeIn 0.5s ease-out forwards ${delay}ms`, opacity: 0 }}
        >
            <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xs transition-transform duration-500 group-hover:scale-110 ${isEnrolled ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-500'
                }`}>
                {course.courseCode || 'EDU'}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {isEnrolled ? (
                        <>
                            <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span>{progress}%</span>
                        </>
                    ) : (
                        <span className="flex items-center gap-1"><Sparkles size={10} className="text-amber-400" /> Nouveau Module</span>
                    )}
                </div>
            </div>

            <div className={`p-3 rounded-2xl transition-colors ${isEnrolled ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'
                }`}>
                <ArrowRight size={18} />
            </div>
        </div>
    );
}

function EmptyStateHint({ type }) {
    return (
        <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                {type === 'enrolled' ? <BookOpen size={24} /> : <Zap size={24} />}
            </div>
            <p className="text-xs font-black text-slate-300 uppercase tracking-widest max-w-[200px]">
                {type === 'enrolled' ? "Aucun cours actif pour le moment" : "Mise à jour des suggestions..."}
            </p>
        </div>
    );
}
