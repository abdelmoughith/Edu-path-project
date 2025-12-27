import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { ArrowLeft, Plus, FolderPlus, FileText, Trash2, Video, File, Link } from 'lucide-react';

const ManageCourseContent = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Group materials by weekNumber (acting as modules)
    const weeks = Array.from(new Set(materials.map(m => m.weekNumber || 1))).sort((a, b) => a - b);
    if (weeks.length === 0) weeks.push(1); // Default Week 1

    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseData, materialsData] = await Promise.all([
                    courseService.getCourseById(courseId),
                    courseService.getMaterialsByCourse(courseId)
                ]);
                setCourse(courseData);
                setMaterials(materialsData);
            } catch (e) {
                console.error("Erreur chargement contenu:", e);
                // Fallback demo si backend vide ou erreur
                // setCourse({ id: courseId, title: "Cours (Demo)" });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [courseId]);

    const handleAddMaterial = async (weekNumber) => {
        const title = prompt("Titre du matériel :");
        if (!title) return;

        const type = prompt("Type (VIDEO, RESOURCE, LECTURE, PRACTICE) :", "VIDEO");
        if (!type) return;

        const url = prompt("URL du contenu (ex: lien YouTube ou PDF) :", "https://example.com");

        const newMaterial = {
            title,
            description: `Contenu ajouté au Module ${weekNumber}`,
            materialType: type.toUpperCase(),
            contentUrl: url || "",
            status: "PUBLISHED",
            weekNumber: weekNumber,
            courseId: courseId
        };

        try {
            const savedMaterial = await courseService.createMaterial(newMaterial);
            setMaterials([...materials, savedMaterial]);
        } catch (error) {
            alert("Erreur lors de l'ajout du matériel.");
            console.error(error);
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!window.confirm("Supprimer ce contenu ?")) return;
        try {
            await courseService.deleteMaterial(materialId);
            setMaterials(materials.filter(m => m.id !== materialId));
        } catch (error) {
            alert("Erreur lors de la suppression.");
        }
    };

    const getIconByType = (type) => {
        if (type === 'VIDEO') return <Video size={18} className="text-red-500" />;
        if (type === 'RESOURCE') return <File size={18} className="text-orange-500" />;
        if (type === 'LECTURE') return <FileText size={18} className="text-blue-500" />;
        if (type === 'TUTORIAL') return <Link size={18} className="text-green-600" />;
        return <FileText size={18} className="text-gray-400" />;
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-900">
                        <ArrowLeft size={20} className="mr-2" /> Retour
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestion du contenu</h1>
                        <p className="text-gray-500">{course?.title} ({course?.courseCode})</p>
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </header>

                <div className="space-y-8">
                    {weeks.map(week => {
                        const weekMaterials = materials.filter(m => (m.weekNumber || 1) === week);

                        return (
                            <div key={week} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700 flex items-center">
                                        <FolderPlus size={18} className="mr-2 text-indigo-500" />
                                        Semaine {week}
                                    </h3>
                                    <button
                                        onClick={() => handleAddMaterial(week)}
                                        className="text-sm text-indigo-600 hover:underline flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg font-medium"
                                    >
                                        <Plus size={14} className="mr-1" /> Ajouter contenu
                                    </button>
                                </div>
                                <div className="p-1">
                                    {weekMaterials.length === 0 && <p className="p-6 text-sm text-gray-400 italic text-center">Aucun contenu pour cette semaine.</p>}

                                    {weekMaterials.map(material => (
                                        <div key={material.id} className="flex justify-between items-center px-6 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 group transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    {getIconByType(material.materialType)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{material.title}</h4>
                                                    <p className="text-xs text-gray-500 uppercase">{material.materialType} • {material.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMaterial(material.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <div className="text-center pt-8">
                        <button
                            onClick={() => {
                                const newWeek = weeks.length > 0 ? Math.max(...weeks) + 1 : 1;
                                handleAddMaterial(newWeek);
                            }}
                            className="inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium"
                        >
                            <Plus size={20} className="mr-2" />
                            Ajouter une nouvelle semaine (Module)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCourseContent;
