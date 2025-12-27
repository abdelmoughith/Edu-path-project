import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { activityService } from '../services/activityService';
import StudentLayout from '../components/StudentLayout';
import {
    User,
    Mail,
    MapPin,
    GraduationCap,
    Award,
    Settings,
    Zap,
    Star,
    BookOpen,
    Check,
    X,
    Shield
} from 'lucide-react';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', city: '', education: '', bio: '' });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await userService.getMe();
                if (!data.firstName || data.firstName === 'null') data.firstName = data.email.split('@')[0];
                setUser(data);
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName || '',
                    city: data.city || '',
                    education: data.education || '',
                    bio: data.bio || ''
                });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleSave = async () => {
        try {
            await userService.updateProfile(user.id, formData);
            setUser({ ...user, ...formData });
            setIsEditing(false);
        } catch (err) { alert("Erreur de sauvegarde"); }
    };

    if (loading) return null;

    return (
        <StudentLayout>
            <div className="px-6 lg:px-10 pb-20 space-y-8">
                <div className="bg-[#161b22] rounded-[3rem] p-10 lg:p-16 border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="h-40 w-40 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center p-1 shadow-2xl skew-y-1">
                            <div className="h-full w-full bg-[#0d1117] rounded-[1.4rem] flex items-center justify-center -skew-y-1">
                                <span className="text-5xl font-black bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            {!isEditing ? (
                                <>
                                    <h2 className="text-4xl font-black text-white mb-2 leading-none">{user?.firstName} {user?.lastName}</h2>
                                    <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-6 inline-block bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">Elite Scholar</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 text-sm font-medium">
                                        <div className="flex items-center gap-2"><MapPin size={16} /> {user?.city || 'Marrakech'}</div>
                                        <div className="flex items-center gap-2"><GraduationCap size={16} /> {user?.education || 'EMSI'}</div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 max-w-md">
                                    <div className="flex gap-3">
                                        <input type="text" className="w-1/2 bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="Prénom" />
                                        <input type="text" className="w-1/2 bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Nom" />
                                    </div>
                                    <div className="flex gap-3">
                                        <input type="text" className="w-1/2 bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-indigo-500" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Ville" />
                                        <input type="text" className="w-1/2 bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-indigo-500" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} placeholder="Formation" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">Éditer Profil</button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="p-4 bg-white/5 text-rose-400 rounded-2xl border border-white/5"><X size={20} /></button>
                                    <button onClick={handleSave} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"><Check size={20} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Settings size={20} className="text-indigo-500" /> Bio & Compétences</h3>
                        {!isEditing ? (
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">{user?.bio || "Pas de biographie disponible. Décrivez votre parcours !"}</p>
                        ) : (
                            <textarea className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-100 mb-8 resize-none" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                        )}
                        <div className="flex flex-wrap gap-2">
                            {['Spring Boot', 'React.js', 'PostgreSQL', 'Docker'].map(s => (
                                <span key={s} className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100">{s}</span>
                            ))}
                        </div>
                    </section>

                    <section className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform"><Shield size={120} /></div>
                        <h3 className="text-xl font-black mb-8 flex items-center gap-2">Performance IA</h3>
                        <div className="space-y-6">
                            <div className="flex items-end justify-between">
                                <div><p className="text-4xl font-black">88%</p><p className="text-[10px] font-black uppercase opacity-60">Success Rate</p></div>
                                <Zap size={24} className="text-amber-400" />
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5">
                                <div className="h-full bg-white rounded-full" style={{ width: '88%' }}></div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </StudentLayout>
    );
};

export default ProfilePage;
