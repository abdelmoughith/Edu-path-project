import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Activity,
    TrendingUp,
    LogOut,
    GraduationCap,
    User,
    Compass,
    Users,
    Settings,
    Shield,
    Award
} from 'lucide-react';
import { userService } from '../services/userService';

/**
 * Premium Sidebar for the EduPath Platform
 * CENTRALIZED COMPONENT for visual consistency
 * Supports both Student and Admin views
 */
const Sidebar = ({ isAdmin = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const studentItems = [
        { icon: <LayoutDashboard size={20} />, label: "Tableau de bord", path: "/dashboard" },
        { icon: <Compass size={20} />, label: "Catalogue", path: "/courses" },
        { icon: <BookOpen size={20} />, label: "Mes Cours", path: "/my-courses" },
        { icon: <Activity size={20} />, label: "Journal d'activité", path: "/activities" },
        { icon: <TrendingUp size={20} />, label: "Performance IA", path: "/ai-analytics" },
        { icon: <User size={20} />, label: "Mon Profil", path: "/profile" },
    ];

    const adminItems = [
        { icon: <LayoutDashboard size={20} />, label: "Admin Hub", path: "/admin-dashboard" },
        { icon: <BookOpen size={20} />, label: "Gestion Cours", path: "/admin-dashboard" }, // Using activeTab in AdminDashboard usually
        { icon: <Award size={20} />, label: "Évaluations", path: "/admin/assessments" },
        { icon: <Users size={20} />, label: "Étudiants", path: "/admin-dashboard" },
        { icon: <Settings size={20} />, label: "Config IA", path: "/admin-dashboard" },
    ];

    const menuItems = isAdmin ? adminItems : studentItems;

    return (
        <aside className="w-80 bg-[#0F172A] hidden lg:flex flex-col p-8 relative overflow-hidden h-screen sticky top-0">
            {/* Visual accents */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full translate-x-12 -translate-y-12 ${isAdmin ? 'bg-rose-500/10' : 'bg-indigo-500/10'}`}></div>

            <div className="mb-12 relative z-10">
                <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform ${isAdmin ? 'bg-rose-600 shadow-rose-600/40' : 'bg-indigo-500 shadow-indigo-500/40'}`}>
                        {isAdmin ? <Shield className="text-white" size={24} /> : <GraduationCap className="text-white" size={24} />}
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter">
                        EduPath<span className={isAdmin ? 'text-rose-500' : 'text-indigo-500'}>.</span>
                    </h1>
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest pl-1">{isAdmin ? 'Admin Control Tower' : 'Emsi Learning Ecosystem'}</p>
            </div>

            <nav className="flex-1 space-y-2 relative z-10">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                        isAdmin={isAdmin}
                    />
                ))}
            </nav>

            <div className="mt-auto relative z-10">
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 mb-8">
                    <p className={`${isAdmin ? 'text-rose-400' : 'text-indigo-400'} text-[10px] font-black uppercase tracking-widest mb-3`}>Statut du Système</p>
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-xs font-bold">Synchronisé</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        userService.logout();
                        navigate('/login');
                    }}
                    className="flex items-center gap-4 w-full px-6 py-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
                >
                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-black text-xs uppercase tracking-widest">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

const SidebarItem = ({ icon, label, active, onClick, isAdmin }) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 group ${active
                    ? (isAdmin ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20 scale-[1.05]' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.05]')
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
        >
            <div className={active ? 'text-white' : `group-hover:${isAdmin ? 'text-rose-400' : 'text-indigo-400'} transition-colors`}>{icon}</div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                {label}
            </span>
        </div>
    );
};

export default Sidebar;
