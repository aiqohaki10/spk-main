import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

interface ParticipantImportModalProps {
    open: boolean;
    onClose: () => void;
    importHref: string;
    templateHref: string;
    title: string;
    description?: string;
}

export default function ParticipantImportModal({
    open,
    onClose,
    importHref,
    templateHref,
    title,
    description,
}: ParticipantImportModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        post(importHref, {
            forceFormData: true,
            onSuccess: () => handleClose(),
        });
    };

    return (
        <Modal show={open} onClose={handleClose} maxWidth="2xl">
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {description || 'Unggah file Excel lalu sistem akan memproses data peserta ke periode aktif.'}
                    </p>
                </div>

                <div className="space-y-5 px-6 py-5">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                            File Excel
                        </label>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(event) => setData('file', event.target.files?.[0] || null)}
                            className="mt-3 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">Format `.xlsx` atau `.xls`</span>
                            <a
                                href={templateHref}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                            >
                                Unduh template
                            </a>
                        </div>
                        {errors.file && <p className="mt-2 text-sm text-rose-600">{errors.file}</p>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        {[
                            'Unduh template.',
                            'Isi data peserta sesuai kolom.',
                            'Unggah file lalu cek hasil sinkronisasi.',
                        ].map((item, index) => (
                            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                    {index + 1}
                                </div>
                                <p className="mt-3 text-sm text-slate-600">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <SecondaryButton type="button" onClick={handleClose}>
                        Batal
                    </SecondaryButton>
                    <button
                        type="submit"
                        disabled={processing || !data.file}
                        className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Mengimpor...' : 'Import peserta'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
