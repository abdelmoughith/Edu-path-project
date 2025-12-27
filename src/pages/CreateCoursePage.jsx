import React, { useState } from 'react';
import { courseService } from '../services/courseService';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Save, RotateCcw } from 'lucide-react';

const CreateCoursePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        courseCode: '',
        moduleCode: '', // Exemple: 'INFO-4'
        description: '',
        presentationLength: '20h', // Valeur par défaut
        status: 'ACTIVE'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await courseService.createCourse(formData);
            alert("Cours créé avec succès !");
            navigate('/dashboard');
        } catch (error) {
            console.error("Erreur création", error);
            alert("Erreur lors de la création du cours.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900">
                        <LayoutDashboard size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Créer un nouveau cours</h1>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-3xl mx-auto w-full">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du cours</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Ex: Architecture Microservices"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code du cours</label>
                                <input
                                    type="text"
                                    name="courseCode"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Ex: MICRO-101"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code Module</label>
                                <input
                                    type="text"
                                    name="moduleCode"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Ex: INFO-4"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée</label>
                                <input
                                    type="text"
                                    name="presentationLength"
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Ex: 20h"
                                    onChange={handleChange}
                                    defaultValue={formData.presentationLength}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Décrivez le contenu du cours..."
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <RotateCcw size={18} /> Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <Save size={18} /> {loading ? 'Création...' : 'Publier le cours'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateCoursePage;
