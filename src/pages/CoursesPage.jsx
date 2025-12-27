import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    BookOpen,
    Clock,
    Zap,
    TrendingUp,
    ChevronRight,
    Star,
    Sparkles,
    CheckCircle2,
    Compass,
    Loader2
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

/**
 * Modern Courses Page - Redesigned for Premium Experience
 * Integrated with Global StudentLayout.
 */
export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allCourses, myCourses] = await Promise.all([
                courseService.getAllCourses(),
                courseService.getMyCourses().catch(() => [])
            ]);
            setCourses(allCourses || []);
            const ids = new Set((myCourses || []).map(c => c.id));
            setEnrolledCourseIds(ids);
        } catch (error) {
            console.error("Critical: Course loading failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        if (enrolledCourseIds.has(courseId)) {
            navigate(`/course/${courseId}/learn`);
            return;
        }
        try {
            await courseService.followCourse(courseId);
            setEnrolledCourseIds(prev => new Set(prev).add(courseId));
            navigate(`/course/${courseId}/learn`);
        } catch (error) {
            navigate(`/course/${courseId}/learn`);
        }
    };

    const filteredCourses = useMemo(() => {
        let list = courses;
        if (searchTerm) {
            list = list.filter(c =>
                c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (activeTab === 'enrolled') {
            list = list.filter(c => enrolledCourseIds.has(c.id));
        } else if (activeTab === 'available') {
            list = list.filter(c => !enrolledCourseIds.has(c.id));
        }
        return list;
    }, [courses, searchTerm, activeTab, enrolledCourseIds]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-bold tracking-tighter animate-pulse">PRÉPARATION DU CATALOGUE...</p>
                </div>
            </div>
        );
    }

    return (
        <MainLayout hideHeader={true}>
            <div className="min-h-screen pb-24">
                {/* --- HERO / HEADER SECTION --- */}
                <div className="relative overflow-hidden bg-[#0F172A] pt-12 pb-24 lg:rounded-bl-[5rem]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-24"></div>

                    <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-400/30 mb-6">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">Nouvelle Génération d'Apprentissage</span>
                                </div>
                                <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                                    Évoluez avec <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">votre talent.</span>
                                </h1>
                            </div>

                            <div className="flex gap-4">
                                <StatMini label="Formations" value={courses.length} />
                                <StatMini label="Inscrit" value={enrolledCourseIds.size} highlight />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mt-12 max-w-2xl relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-focus-within:opacity-60 transition duration-500"></div>
                            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 h-16">
                                <div className="pl-4 text-slate-400"><Search size={22} strokeWidth={3} /></div>
                                <input
                                    type="text"
                                    placeholder="Rechercher une compétence..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none p-3 text-slate-800 font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-20 -mt-8">
                    <div className="inline-flex p-1.5 bg-white rounded-[2rem] shadow-2xl border border-slate-100 ring-4 ring-slate-100/50">
                        {[
                            { id: 'all', label: 'Tout', icon: <Compass size={18} /> },
                            { id: 'enrolled', label: 'Inscrit', icon: <CheckCircle2 size={18} /> },
                            { id: 'available', label: 'Nouveau', icon: <Zap size={18} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 lg:px-10 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- GRID --- */}
                <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-16">
                    {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredCourses.map((course, idx) => (
                                <CourseCard key={course.id} course={course} isEnrolled={enrolledCourseIds.has(course.id)} onEnroll={handleEnroll} index={idx} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-xl">
                            <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Aucun cours trouvé</p>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.animate-gradient { background-size: 200% auto; animation: shine 3s linear infinite; } @keyframes shine { to { background-position: 200% center; } }` }} />
        </MainLayout>
    );
}

function StatMini({ label, value, highlight }) {
    return (
        <div className={`rounded-2xl p-4 text-center min-w-[100px] border shadow-sm ${highlight ? 'bg-indigo-600 text-white border-transparent' : 'bg-white/5 backdrop-blur-md text-white border-white/10'
            }`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${highlight ? 'text-indigo-200' : 'text-slate-500'}`}>{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
}

function CourseCard({ course, isEnrolled, onEnroll, index }) {
    return (
        <div className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
            <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={48} className="text-indigo-600/20" />
                </div>
                {isEnrolled && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Inscrit</div>
                )}
            </div>
            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-6 flex-1">{course.description}</p>
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={16} /> <span className="text-[11px] font-bold">{course.presentationLength || '8h'}</span>
                    </div>
                    <button
                        onClick={() => onEnroll(course.id)}
                        className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isEnrolled ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white hover:bg-black'
                            }`}
                    >
                        {isEnrolled ? 'Découvrir' : 'Débuter'}
                    </button>
                </div>
            </div>
        </div>
    );
}
