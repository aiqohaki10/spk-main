interface RankBadgeProps {
    rank: number;
    size?: 'sm' | 'md' | 'lg';
}

export default function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
    };

    const styles: Record<number, string> = {
        1: 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 ring-4 ring-amber-200 shadow-lg shadow-amber-200/50',
        2: 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-700 ring-4 ring-slate-200 shadow-lg shadow-slate-200/50',
        3: 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-800 ring-4 ring-orange-100 shadow-lg shadow-orange-200/50',
    };

    const defaultStyle = 'bg-slate-50 text-slate-500 border-2 border-slate-200';

    return (
        <div className={`
            ${sizes[size]} rounded-2xl flex items-center justify-center font-black
            ${styles[rank] || defaultStyle}
            transition-all duration-200
        `}>
            #{rank}
        </div>
    );
}
