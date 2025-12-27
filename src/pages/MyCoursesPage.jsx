import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    Trophy,
    ArrowRight,
    Sparkles,
    Clock,
    PlayCircle,
    Compass,
    Rocket,
    Loader2
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

/**
 * Modern My Courses Page - Your Personal Learning Hub
 */
export default function MyCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const userData = await userService.getMe().catch(() => null);
                setUser(userData);
                const data = await courseService.getMyCourses();
                setCourses(data || []);
            } catch (error) {
                console.error("Critical: Error loading personal hub", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredCourses = courses.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen pb-32 px-6 lg:px-10">
                {/* Header Content */}
                <div className="bg-white rounded-[3rem] border border-slate-100 p-10 lg:p-16 mb-12 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`w-3 h-3 rounded-full ${courses.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {courses.length > 0 ? `${courses.length} Formations actives` : "Prêt pour l'aventure ?"}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                Mon <span className="text-indigo-600">Apprentissage</span>
                            </h1>
                        </div>
                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Filtrer mes cours..."
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {courses.length === 0 ? (
                    <PremiumEmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course, idx) => (
                            <PersonalCourseCard
                                key={course.id}
                                course={course}
                                user={user}
                                navigate={navigate}
                                index={idx}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function PersonalCourseCard({ course, user, navigate, index }) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (user?.id) {
            const saved = localStorage.getItem(`user_${user.id}_course_${course.id}_percentage`);
            if (saved) setProgress(parseInt(saved));
        }
    }, [user, course.id]);

    return (
        <div
            className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-1 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer flex flex-col h-full"
            onClick={() => navigate(`/course/${course.id}/learn`)}
        >
            <div className="relative aspect-video rounded-[2.2rem] overflow-hidden bg-slate-100 mb-6 font-sans">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 mix-blend-overlay"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="text-white w-14 h-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Progression</span>
                        <span className="text-white text-lg font-black">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 backdrop-blur-md rounded-full overflow-hidden">
                        <div className={`h-full bg-white transition-all duration-1000 ${progress === 100 ? 'bg-green-400' : ''}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="px-7 pb-8 pt-2 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-4 flex-1">{course.title}</h3>
                <div className="flex items-center justify-between text-slate-400 font-bold text-[10px] pt-6 border-t border-slate-50 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={14} /> {course.presentationLength || "8h"}</span>
                    <span className="text-indigo-600 flex items-center gap-1">Continuer <ArrowRight size={14} /></span>
                </div>
            </div>
        </div>
    );
}

function PremiumEmptyState() {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl p-12 lg:p-24 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl mb-8 rotate-6">
                    <Rocket size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Votre futur commence ici.</h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12 max-w-md">Aucun cours actif. Explorez nos formations pour débuter votre parcours.</p>
                <button onClick={() => navigate('/courses')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3">
                    Catalogue <Compass size={18} />
                </button>
            </div>
        </div>
    );
}
