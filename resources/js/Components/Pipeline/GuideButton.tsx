interface GuideButtonProps {
    onClick: () => void;
    title?: string;
}

export default function GuideButton({ onClick, title = 'Buka panduan tahap' }: GuideButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
            <span className="text-base font-bold leading-none">?</span>
        </button>
    );
}
