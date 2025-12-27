import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { userService } from '../services/userService';
import {
    Bell,
    Search,
    Menu,
    X,
    ShieldAlert
} from 'lucide-react';

/**
 * Premium Layout for the EduPath Platform
 * Supports both Student and Admin roles with distinct visual themes.
 */
const MainLayout = ({ children, hideHeader = false, role = 'student' }) => {
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const isAdmin = role === 'admin';

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await userService.getMe().catch(() => null);
                if (userData) {
                    if (!userData.firstName || userData.firstName === 'null') userData.firstName = userData.email?.split('@')[0] || 'User';
                    if (!userData.lastName || userData.lastName === 'null') userData.lastName = "";
                    setUser(userData);
                }
            } catch { }
        };
        loadUser();
    }, []);

    return (
        <div className={`flex min-h-screen font-sans ${isAdmin ? 'bg-[#F9FAFB]' : 'bg-[#F0F2F5]'}`}>
            {/* Sidebar Desktop */}
            <Sidebar isAdmin={isAdmin} />

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="absolute inset-y-0 left-0 w-80 shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="h-full bg-[#0F172A] p-8 flex flex-col relative overflow-hidden">
                            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                            <Sidebar isAdmin={isAdmin} />
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                aside { display: flex !important; width: 100% !important; background: transparent !important; padding: 0 !important; }
                             `}} />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Floating Glass Header */}
                {!hideHeader && (
                    <header className="sticky top-0 z-40 px-6 lg:px-10 py-6">
                        <div className={`bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-between px-6 lg:px-8 h-20`}>
                            {/* Left Side: Brand/Toggle */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className={`lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAdmin ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}
                                >
                                    <Menu size={20} />
                                </button>

                                <div className="hidden sm:block">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                        {isAdmin ? 'EduPath Admin' : 'EduPath Hub'}
                                    </h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">EMSI PLATFORM</p>
                                </div>
                            </div>

                            {/* Center Search (Optional) */}
                            <div className="hidden md:flex flex-1 max-w-md mx-8">
                                <div className="relative w-full group">
                                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${isAdmin ? 'text-rose-500' : 'text-indigo-500'} transition-colors`} size={18} />
                                    <input
                                        type="text"
                                        placeholder={isAdmin ? "Cibler un cours ou étudiant..." : "Rechercher une compétence..."}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-100 transition-all border border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Right Side: Profile & Notifications */}
                            <div className="flex items-center gap-4">
                                <div className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all cursor-pointer">
                                    <Bell size={20} />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20"></span>
                                </div>
                                <div
                                    onClick={() => navigate('/profile')}
                                    className={`w-11 h-11 rounded-2xl p-[2px] cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg ${isAdmin
                                        ? 'bg-gradient-to-br from-rose-500 via-orange-500 to-rose-600'
                                        : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500'
                                        }`}
                                >
                                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-slate-800 font-black text-xs">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Content */}
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
