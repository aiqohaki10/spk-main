import { ReactNode } from 'react';

interface Props {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    guide?: ReactNode;
    actions?: ReactNode;
}

export default function PipelineActionBar({ title, subtitle, onBack, guide, actions }: Props) {
    return (
        <div className="sticky top-[56px] -mt-2 -mx-1 px-1 py-3 z-30 pointer-events-none">
            <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/40 backdrop-blur-xl">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                title="Kembali"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                        )}
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold leading-none text-slate-900">{title}</h3>
                                {subtitle && (
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                        {subtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {guide}
                        {actions}
                    </div>
                </div>
            </div>
        </div>
    );
}
