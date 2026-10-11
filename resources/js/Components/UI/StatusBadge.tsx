interface Props {
    variant?: 'benefit' | 'cost' | 'active' | 'draft' | 'completed' | 'pending' | 'numeric' | 'categorical';
    children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
    benefit: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cost: 'bg-amber-50 text-amber-700 border-amber-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-50 text-slate-500 border-slate-200',
    completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    numeric: 'bg-slate-50 text-slate-600 border-slate-200',
    categorical: 'bg-violet-50 text-violet-600 border-violet-200',
};

export default function StatusBadge({ variant = 'active', children }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${variantStyles[variant] || variantStyles.active}`}>
            {children}
        </span>
    );
}
