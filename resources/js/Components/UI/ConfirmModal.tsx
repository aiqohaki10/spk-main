import Modal from '@/Components/Modal';

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    processing?: boolean;
    variant?: 'danger' | 'warning';
}

export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Hapus',
    processing = false,
    variant = 'danger',
}: Props) {
    const buttonStyles = variant === 'danger'
        ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
        : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processing}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${buttonStyles}`}
                    >
                        {processing ? 'Memproses...' : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
