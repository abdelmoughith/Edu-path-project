import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

/**
 * Beautiful prediction card with circular progress and risk indicators
 */
export default function PredictionCard({ prediction }) {
    if (!prediction) return null;

    const { success_proba, risk_level, message } = prediction;
    const percentage = Math.round(success_proba * 100);

    // Risk level configuration
    const riskConfig = {
        'Low': {
            color: 'emerald',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            borderColor: 'border-emerald-200',
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-green-500'
        },
        'Medium': {
            color: 'amber',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
            borderColor: 'border-amber-200',
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-orange-500'
        },
        'High': {
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            borderColor: 'border-red-200',
            icon: Shield,
            gradient: 'from-red-500 to-rose-500'
        }
    };

    const config = riskConfig[risk_level] || riskConfig['Medium'];
    const RiskIcon = config.icon;

    // Calculate circle progress
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - success_proba);

    return (
        <div className="bg-white rounded-[3rem] p-10 lg:p-12 border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Circular Progress */}
                <div className="relative h-56 w-56 flex-shrink-0">
                    {/* Background glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-full blur-3xl opacity-20 animate-pulse`}></div>

                    {/* SVG Circle */}
                    <svg className="h-full w-full transform -rotate-90 relative z-10">
                        {/* Background circle */}
                        <circle
                            cx="112"
                            cy="112"
                            r={radius}
                            fill="transparent"
                            stroke="#f1f5f9"
                            strokeWidth="16"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="112"
                            cy="112"
                            r={radius}
                            fill="transparent"
                            stroke="url(#gradient)"
                            strokeWidth="16"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className={`text-${config.color}-500`} stopColor="currentColor" />
                                <stop offset="100%" className={`text-${config.color}-600`} stopColor="currentColor" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-slate-900 mb-1">{percentage}%</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probabilité</span>
                        {percentage >= 80 ? (
                            <TrendingUp className={`w-6 h-6 ${config.textColor} mt-2`} />
                        ) : percentage >= 60 ? (
                            <TrendingDown className="w-6 h-6 text-amber-500 mt-2" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-red-500 mt-2" />
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 text-center lg:text-left space-y-6">
                    {/* Risk Badge */}
                    <div className="flex justify-center lg:justify-start">
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                            <RiskIcon className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">
                                Risque : {risk_level}
                            </span>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight mb-3">
                            {message}
                        </p>
                        <div className={`h-1.5 w-24 bg-gradient-to-r ${config.gradient} rounded-full`}></div>
                    </div>

                    {/* Additional insights */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taux de réussite</p>
                            <p className="text-2xl font-black text-slate-900">{percentage}%</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Niveau de risque</p>
                            <p className={`text-2xl font-black ${config.textColor}`}>{risk_level}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
