interface Props {
    processing: boolean;
    onClick: () => void;
    label?: string;
    loadingLabel?: string;
    disabled?: boolean;
    variant?: 'primary' | 'success';
}

export default function ProcessButton({
    processing,
    onClick,
    label = 'Mulai Proses',
    loadingLabel = 'Memproses...',
    disabled = false,
    variant = 'primary',
}: Props) {
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
        success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    };

    return (
        <button
            onClick={onClick}
            disabled={processing || disabled}
            className={`
                inline-flex items-center gap-2.5 px-6 py-2.5 rounded-lg
                text-white text-sm font-medium
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!processing && !disabled ? `${variants[variant]}` : variants[variant]}
            `}
        >
            {processing && (
                <svg className="animate-spin h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}

            {!processing && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}

            <span>{processing ? loadingLabel : label}</span>
        </button>
    );
}
