import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    X,
    Award,
    Sparkles,
    CheckCircle,
    Download,
    Share2,
    Star,
    ShieldCheck
} from 'lucide-react';

const CertificateModal = ({ isOpen, onClose, studentName, courseTitle, completionDate, masteryScore = 95 }) => {
    const certificateRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen) return null;

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 3, // High quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Certificat_${courseTitle.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Une erreur est survenue lors de la génération du PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-50"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Visual Preview Side */}
                    <div className="md:w-[65%] p-8 bg-[#0f172a] relative overflow-hidden flex flex-col items-center justify-center">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[100px] rounded-full"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[100px] rounded-full"></div>

                        {/* Certificate Canvas Mockup */}
                        <div
                            ref={certificateRef}
                            className="w-full aspect-[1.414/1] bg-white rounded shadow-2xl p-8 relative flex flex-col items-center justify-center text-slate-900 border-[12px] border-double border-indigo-50"
                        >
                            {/* Inner Border Card */}
                            <div className="absolute inset-4 border border-indigo-100/50"></div>

                            {/* Watermark/Seal */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-[3]">
                                <Award size={100} />
                            </div>

                            <div className="relative z-10 text-center space-y-4">
                                <div className="flex justify-center mb-2">
                                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                                        <Award size={32} />
                                    </div>
                                </div>
                                <h4 className="text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase">Certificat d'Excellence</h4>
                                <h1 className="text-3xl font-serif italic text-slate-800">Certificat de Réussite</h1>
                                <p className="text-xs text-slate-400 italic">Ce document atteste que</p>
                                <h2 className="text-2xl font-black text-slate-900 border-b-2 border-indigo-100 inline-block px-4 py-1">
                                    {studentName && studentName.toLowerCase() !== "null null" && studentName.trim() !== "" ? studentName : "Étudiant"}
                                </h2>
                                <p className="text-xs max-w-sm mx-auto text-slate-500 leading-relaxed">
                                    A complété avec succès et brio le cursus complet de formation intitulé
                                </p>
                                <h3 className="text-lg font-bold text-indigo-900 tracking-tight">
                                    {courseTitle || "Formation Avancée"}
                                </h3>
                                <div className="pt-6 flex justify-between items-end w-full max-w-xs mx-auto">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                                        <p className="text-xs font-bold text-slate-800 border-t border-slate-100 mt-1 pt-1">{completionDate}</p>
                                    </div>
                                    <div className="w-12 h-12 flex items-center justify-center opacity-20">
                                        <ShieldCheck size={40} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Signature</p>
                                        <p className="text-xs font-serif italic text-indigo-600 border-t border-slate-100 mt-1 pt-1">EduPath Teams</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Hint */}
                        <p className="mt-6 text-white/50 text-xs flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-400" />
                            Généré par IA : Analyse de maîtrise atteinte à {masteryScore}%
                        </p>
                    </div>

                    {/* Action Side */}
                    <div className="md:w-[35%] p-10 flex flex-col justify-center">
                        <div className="mb-8">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">Félicitations !</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Vous avez atteint les objectifs pédagogiques. Votre certificat est prêt à être partagé avec votre réseau.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className={`w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} /> Télécharger PDF
                                    </>
                                )}
                            </button>
                            <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-indigo-100 text-gray-700 py-4 rounded-2xl font-bold transition-all">
                                <Share2 size={20} /> Partager sur LinkedIn
                            </button>
                        </div>

                        <div className="mt-10 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={16} className="text-amber-500 fill-amber-500" />
                                <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Note IA</span>
                            </div>
                            <p className="text-xs text-amber-800/80 leading-relaxed italic">
                                "Votre performance exceptionnelle sur les modules d'architecture vous place dans le top 5% des étudiants."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;
