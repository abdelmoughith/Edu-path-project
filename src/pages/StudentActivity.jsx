import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../services/activityService';
import { userService } from '../services/userService';
import { courseService } from '../services/courseService';
import StudentLayout from '../components/StudentLayout';
import {
    Activity,
    Calendar,
    TrendingUp,
    MousePointer2,
    Clock,
    BookOpen,
    ChevronRight,
    Search,
    Sparkles
} from 'lucide-react';

const StudentActivity = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [courses, setCourses] = useState([]);
    const [totalClicks, setTotalClicks] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await userService.getMe();
                const [activityData, total, coursesData] = await Promise.all([
                    activityService.getActivitiesByStudentId(userData.id),
                    activityService.getTotalClicksByStudent(userData.id),
                    courseService.getAllCourses()
                ]);
                setActivities(activityData);
                setTotalClicks(total);
                setCourses(coursesData);
            } catch (error) {
                console.error("Error loading student activity:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getCourseTitle = (courseCode) => {
        const course = courses.find(c => c.courseCode === courseCode || c.id === courseCode);
        return course ? course.title : `Cours #${courseCode}`;
    };

    if (loading) return null;

    return (
        <StudentLayout>
            <div className="px-6 lg:px-10 pb-20 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatBox title="Sessions" value={activities.length} icon={<Calendar />} subtitle="Total activitées" />
                    <StatBox title="Impact" value={totalClicks} icon={<MousePointer2 />} subtitle="Clics total" />
                    <StatBox title="Niveau" value={totalClicks > 100 ? "Légendaire" : "Apprenti"} icon={<TrendingUp />} subtitle="Score IA" highlight />
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">Journal d'Activité <Sparkles size={20} className="text-indigo-500" /></h3>
                            <p className="text-slate-400 font-medium text-sm">Votre timeline d'apprentissage en temps réel.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activities.map((activity, idx) => (
                            <div key={idx} className="group flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-300 cursor-default">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm"><Activity size={20} /></div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 mb-1">{getCourseTitle(activity.courseCode)}</h4>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Module {activity.moduleCode}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900 leading-none">+{activity.sumClicks} clics</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

const StatBox = ({ title, value, icon, subtitle, highlight }) => (
    <div className={`p-8 rounded-[2.5rem] border border-slate-100 transition-all ${highlight ? 'bg-indigo-900 text-white shadow-xl shadow-indigo-900/20' : 'bg-white shadow-sm'}`}>
        <div className={`p-3 rounded-2xl w-fit mb-6 ${highlight ? 'bg-white/10' : 'bg-slate-50 text-indigo-600'}`}>
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{title}</h4>
        <p className="text-3xl font-black tracking-tighter mb-1">{value}</p>
        <p className={`text-[10px] font-bold ${highlight ? 'text-white/40' : 'text-slate-300'}`}>{subtitle}</p>
    </div>
);

export default StudentActivity;
