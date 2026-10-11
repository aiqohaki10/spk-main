interface Step {
    key: string;
    label: string;
    stepNumber: number;
    description?: string;
}

interface Props {
    steps: Step[];
    activeStep: number;
    completedStep: number;
    onStepClick: (index: number) => void;
}

export default function StepIndicator({ steps, activeStep, completedStep, onStepClick }: Props) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="grid gap-2 lg:grid-cols-6">
                {steps.map((step, index) => {
                    const isCompleted = index < completedStep;
                    const isActive = index === activeStep;
                    const isLocked = index > completedStep;

                    return (
                        <button
                            key={step.key}
                            onClick={() => !isLocked && onStepClick(index)}
                            disabled={isLocked}
                            className={[
                                'flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all',
                                isActive ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white',
                                isCompleted ? 'border-emerald-200 bg-emerald-50/70' : '',
                                isLocked ? 'cursor-not-allowed opacity-45' : 'hover:border-slate-300',
                            ].join(' ')}
                        >
                            <div
                                className={[
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold',
                                    isActive ? 'border-indigo-600 bg-indigo-600 text-white' : '',
                                    isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : '',
                                    !isActive && !isCompleted ? 'border-slate-200 bg-slate-50 text-slate-500' : '',
                                ].join(' ')}
                            >
                                {isCompleted ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.stepNumber
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={[
                                            'truncate text-[11px] font-bold uppercase tracking-[0.18em]',
                                            isActive ? 'text-indigo-700' : '',
                                            isCompleted ? 'text-emerald-700' : '',
                                            !isActive && !isCompleted ? 'text-slate-600' : '',
                                        ].join(' ')}
                                    >
                                        {step.label}
                                    </div>
                                    {step.description && (
                                        <span className="hidden rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline">
                                            {step.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
