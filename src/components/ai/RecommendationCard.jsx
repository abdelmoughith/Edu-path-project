import React from 'react';
import { Video, FileText, Dumbbell, ClipboardCheck, ExternalLink, Sparkles } from 'lucide-react';

/**
 * Beautiful recommendation card for learning resources
 */
export default function RecommendationCard({ recommendation, index }) {
    const { resource_id, title, url, type, reason } = recommendation;

    // Resource type configuration
    const typeConfig = {
        'video': {
            icon: Video,
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            borderColor: 'border-indigo-200',
            label: 'Vidéo'
        },
        'article': {
            icon: FileText,
            color: 'emerald',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            borderColor: 'border-emerald-200',
            label: 'Article'
        },
        'exercise': {
            icon: Dumbbell,
            color: 'amber',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
            borderColor: 'border-amber-200',
            label: 'Exercice'
        },
        'quiz': {
            icon: ClipboardCheck,
            color: 'purple',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-200',
            label: 'Quiz'
        }
    };

    const config = typeConfig[type.toLowerCase()] || typeConfig['article'];
    const TypeIcon = config.icon;

    const handleClick = () => {
        if (url && url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
            onClick={handleClick}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${config.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]`}></div>

            <div className="relative z-10">
                {/* Header with type badge */}
                <div className="flex items-start justify-between mb-6">
                    <div className={`flex items-center gap-2 px-4 py-2 ${config.bgColor} ${config.textColor} rounded-xl border ${config.borderColor}`}>
                        <TypeIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {config.label}
                        </span>
                    </div>

                    <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>

                {/* Title */}
                <h4 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                    {title}
                </h4>

                {/* Reason */}
                <div className="flex items-start gap-3 mb-6">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                        "{reason}"
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        ID: {resource_id}
                    </span>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Accéder</span>
                        <ExternalLink className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Decorative corner */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-${config.color}-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
        </div>
    );
}
