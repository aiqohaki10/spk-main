interface Props {
    type?: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

const styles = {
    success: {
        wrapper: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
        icon: 'text-emerald-500',
    },
    error: {
        wrapper: 'bg-rose-50 border border-rose-200 text-rose-800',
        icon: 'text-rose-500',
    },
    warning: {
        wrapper: 'bg-amber-50 border border-amber-200 text-amber-800',
        icon: 'text-amber-500',
    },
    info: {
        wrapper: 'bg-blue-50 border border-blue-200 text-blue-800',
        icon: 'text-blue-500',
    },
};

export default function FlashMessage({ type = 'success', message }: Props) {
    const s = styles[type];

    return (
        <div className={`${s.wrapper} px-5 py-3.5 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300`}>
            {type === 'success' && (
                <svg className={`w-5 h-5 ${s.icon} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            {type === 'error' && (
                <svg className={`w-5 h-5 ${s.icon} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            {type === 'warning' && (
                <svg className={`w-5 h-5 ${s.icon} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            )}
            {type === 'info' && (
                <svg className={`w-5 h-5 ${s.icon} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            <span>{message}</span>
        </div>
    );
}
