import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { userService } from '../services/userService';
import {
    Bell,
    Search,
    Menu,
    X,
    Compass,
    Settings,
    User
} from 'lucide-react';

/**
 * Premium Student Layout
 * Wraps pages with Sidebar, Floating Header, and responsive behavior.
 */
const StudentLayout = ({ children, hideHeader = false }) => {
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await userService.getMe().catch(() => null);
                if (userData) {
                    if (!userData.firstName || userData.firstName === 'null') userData.firstName = userData.email?.split('@')[0] || 'User';
                    if (!userData.lastName || userData.lastName === 'null') userData.lastName = "";
                    setUser(userData);
                }
            } catch (err) {
                console.error("Layout User Load Error", err);
            }
        };
        loadUser();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#F0F2F5] font-sans">
            {/* Sidebar Desktop */}
            <Sidebar />

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="absolute inset-y-0 left-0 w-80 shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarMobile onClose={() => setMobileMenuOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Floating Glass Header */}
                {!hideHeader && (
                    <header className="sticky top-0 z-40 px-6 lg:px-10 py-6">
                        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-between px-6 lg:px-8 h-20">
                            {/* Left Side: Brand/Toggle */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="lg:hidden w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
                                >
                                    <Menu size={20} />
                                </button>

                                <div className="hidden sm:block">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">EduPath Hub</h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">EMSI PLATFORM</p>
                                </div>
                            </div>

                            {/* Center Search (Optional) */}
                            <div className="hidden md:flex flex-1 max-w-md mx-8">
                                <div className="relative w-full group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher une compétence..."
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
                                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 p-[2px] cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg"
                                >
                                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-indigo-600 font-black text-xs">
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

/**
 * Mobile specific sidebar (simplified)
 */
const SidebarMobile = ({ onClose }) => {
    // Reusing the same structure but for mobile
    return (
        <div className="h-full bg-[#0F172A] p-8 flex flex-col relative overflow-hidden">
            <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white">
                <X size={24} />
            </button>
            <Sidebar />
            <style dangerouslySetInnerHTML={{
                __html: `
                aside { display: flex !important; width: 100% !important; background: transparent !important; padding: 0 !important; }
             `}} />
        </div>
    );
};

export default StudentLayout;
