import { useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import StatusBadge from '@/Components/UI/StatusBadge';
import EmptyState from '@/Components/UI/EmptyState';
import PipelineActionBar from '@/Components/Pipeline/PipelineActionBar';
import PipelineGuide from '@/Components/Pipeline/PipelineGuide';
import Modal from '@/Components/Modal';

interface Subscale {
    label: string;
    range_hint: string;
    numeric_value: string;
}

interface Props {
    period: any;
    stepData: any;
    pipelineState: any;
    onNavigateStep: (step: number) => void;
}

function getRangeHintHeader(code: string): string {
    if (code === 'C1' || code === 'C3') return 'Rentang Nilai';
    if (code === 'C4') return 'Rentang Jarak';
    return 'Deskripsi / Keterangan';
}

function getRangeHintPlaceholder(code: string): string {
    if (code === 'C1' || code === 'C3') return 'Contoh: 86 – 100';
    if (code === 'C4') return 'Contoh: 0 – 5 km';
    return 'Contoh: Motivasi tinggi, ...';
}

function getCriterionAccent(code: string) {
    const map: Record<string, { bg: string; border: string; text: string; badge: string; iconBg: string }> = {
        C1: { bg: 'bg-violet-50/50', border: 'border-violet-100', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700 border-violet-200', iconBg: 'bg-violet-500' },
        C2: { bg: 'bg-sky-50/50',    border: 'border-sky-100',    text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-700 border-sky-200', iconBg: 'bg-sky-500' },
        C3: { bg: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', iconBg: 'bg-indigo-500' },
        C4: { bg: 'bg-amber-50/50',  border: 'border-amber-100',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700 border-amber-200', iconBg: 'bg-amber-500' },
        C5: { bg: 'bg-emerald-50/50',border: 'border-emerald-100',text: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-500' },
    };
    return map[code] ?? { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-600 border-slate-200', iconBg: 'bg-slate-500' };
}

export default function SetupStep({ period, stepData, pipelineState, onNavigateStep }: Props) {
    const criteria = stepData.setup?.criteria || [];
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        attribute_type: 'benefit' as 'benefit' | 'cost',
        input_type: 'categorical' as 'numeric' | 'categorical',
        description: '',
        subscales: [] as Subscale[],
    });

    const editingCriterion = criteria.find((c: any) => c.id === editingId);

    const startEdit = (criterion: any) => {
        setEditingId(criterion.id);
        setData({
            code: criterion.code,
            name: criterion.name,
            attribute_type: criterion.attribute_type,
            input_type: criterion.input_type,
            description: criterion.description || '',
            subscales: criterion.subscales?.map((s: any) => ({
                label: s.label,
                range_hint: s.range_hint ?? '',
                numeric_value: String(s.numeric_value),
            })) || [],
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setEditingId(null);
            reset();
        }, 200);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!editingId) return;
        const criterion = criteria.find((c: any) => c.id === editingId);
        put(route('pipeline.setup.criteria.update', [period.route_key, criterion.route_key]), {
            onSuccess: () => closeModal(),
        });
    };

    const handleComplete = () => {
        router.post(route('pipeline.setup.complete', period.route_key));
    };

    const addSubscale = () => {
        setData('subscales', [...data.subscales, { label: '', range_hint: '', numeric_value: '' }]);
    };

    const removeSubscale = (index: number) => {
        setData('subscales', data.subscales.filter((_, i) => i !== index));
    };

    const updateSubscale = (index: number, field: keyof Subscale, value: string) => {
        const updated = [...data.subscales];
        updated[index] = { ...updated[index], [field]: value };
        setData('subscales', updated);
    };

    const isCompleted = pipelineState.currentStep > 1;

    return (
        <div className="space-y-6">
            <PipelineActionBar
                title="Kriteria Penilaian"
                subtitle="Atur kriteria dan parameter klasifikasi skor untuk proses SPK"
                guide={<PipelineGuide phaseKey="setup" />}
                actions={
                    <>
                        {criteria.length >= 5 && !isCompleted && (
                            <button
                                onClick={handleComplete}
                                className="group relative inline-flex items-center gap-2 overflow-hidden px-7 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <span>Lanjut ke Input Nilai</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        )}
                        {isCompleted && (
                            <button
                                onClick={() => onNavigateStep(1)}
                                className="inline-flex items-center gap-2 px-7 py-3 bg-white text-indigo-600 border border-indigo-100 text-sm font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                            >
                                <span>Lihat Input Nilai</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        )}
                    </>
                }
            />

            {/* Stats Section with Glassmorphism */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: 'Total Kriteria', value: criteria.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { label: 'Total Subskala', value: criteria.reduce((acc: number, c: any) => acc + (c.subscales?.length ?? 0), 0), icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                    { label: 'Kesiapan Pipeline', value: criteria.length >= 5 ? 'SIAP' : `${criteria.length}/5`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', highlight: true }
                ].map((stat, i) => (
                    <div key={i} className="relative group overflow-hidden rounded-3xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:-translate-y-1">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                                <p className={`mt-1 text-2xl font-black ${stat.highlight && criteria.length >= 5 ? 'text-indigo-600' : 'text-slate-900'}`}>
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Criteria Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {criteria.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyState title="Kriteria belum tersedia" description="Kriteria inti pada periode ini belum siap dikonfigurasi." />
                    </div>
                ) : criteria.map((criterion: any) => {
                    const accent = getCriterionAccent(criterion.code);
                    const rangeHintHeader = getRangeHintHeader(criterion.code);

                    return (
                        <div
                            key={criterion.id}
                            className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                        >
                            <div className={`flex items-center justify-between rounded-[2rem] p-4 ${accent.bg} border border-transparent transition-colors group-hover:border-white`}>
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm text-white font-black text-sm ${accent.iconBg}`}>
                                        {criterion.code}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{criterion.name}</h3>
                                        <div className="mt-1 flex gap-1.5">
                                            <StatusBadge variant={criterion.attribute_type}>{criterion.attribute_type}</StatusBadge>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => startEdit(criterion)}
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm transition-all hover:bg-indigo-600 hover:text-white active:scale-90"
                                    title="Edit Kriteria"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-2 px-5 py-3">
                                <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed italic">
                                    "{criterion.description || 'Tidak ada deskripsi.'}"
                                </p>
                            </div>

                            <div className="mt-auto px-2 pb-2">
                                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/50">
                                    <div className="grid grid-cols-[3rem_1fr_1fr] border-b border-slate-100 bg-slate-100/50 px-4 py-2">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Skor</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{rangeHintHeader}</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Label</div>
                                    </div>
                                    <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-50">
                                        {[...criterion.subscales]
                                            .sort((a: any, b: any) => b.numeric_value - a.numeric_value)
                                            .map((subscale: any) => (
                                                <div key={subscale.id} className="grid grid-cols-[3rem_1fr_1fr] items-center px-4 py-2.5 transition-colors hover:bg-white">
                                                    <div className="font-black text-slate-900 text-xs">{subscale.numeric_value}</div>
                                                    <div className="text-[10px] font-medium text-slate-500 pr-2">{subscale.range_hint || '—'}</div>
                                                    <div className="text-[10px] font-bold text-slate-700">{subscale.label}</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal for Editing */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="4xl">
                <div className="flex flex-col h-[85vh] overflow-hidden">
                    {/* Modal Header */}
                    {editingCriterion && (
                        <div className={`flex items-center justify-between px-8 py-6 ${getCriterionAccent(data.code).bg} border-b border-slate-100`}>
                            <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-lg text-white font-black text-xl ${getCriterionAccent(data.code).iconBg}`}>
                                    {data.code}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Konfigurasi {editingCriterion.name}</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Sesuaikan rentang nilai dan kategori kriteria</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="group p-2 rounded-2xl bg-white/50 text-slate-400 hover:text-slate-600 hover:bg-white transition-all active:scale-90">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Modal Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <form onSubmit={handleSubmit} id="edit-criterion-form" className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Nama Kriteria</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-2xl border-slate-200 bg-slate-50 py-4 px-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                        />
                                        {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-2 px-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Deskripsi & Tujuan</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-2xl border-slate-200 bg-slate-50 py-4 px-6 text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-500">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Informasi Sifat</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Atribut</span>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${data.attribute_type === 'benefit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {data.attribute_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format Input</span>
                                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                                                {data.input_type}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-500 mt-2 px-1 leading-relaxed">
                                            {data.attribute_type === 'benefit' 
                                                ? 'Nilai yang semakin tinggi akan memberikan dampak positif pada peringkat akhir.' 
                                                : 'Nilai yang semakin tinggi akan memberikan dampak negatif (biaya/hambatan) pada peringkat akhir.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-8">
                                <div className="flex items-center justify-between mb-6 px-1">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Klasifikasi Skor Subskala</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Definisikan rentang nilai untuk skor 1 sampai 5</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSubscale}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black text-white uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Tambah Baris
                                    </button>
                                </div>

                                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                    <div className="grid grid-cols-[6rem_1fr_1fr_4rem] bg-slate-50 border-b border-slate-200 px-6 py-4">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Skor (1-5)</div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{getRangeHintHeader(data.code)}</div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kategori / Label</div>
                                        <div></div>
                                    </div>

                                    <div className="divide-y divide-slate-100">
                                        {data.subscales.length === 0 ? (
                                            <div className="px-6 py-12 text-center">
                                                <p className="text-sm font-bold text-slate-300 italic">Belum ada baris klasifikasi.</p>
                                            </div>
                                        ) : data.subscales.map((subscale, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-[6rem_1fr_1fr_4rem] items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                                            >
                                                <div className="flex justify-center">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={5}
                                                        value={subscale.numeric_value}
                                                        onChange={(e) => updateSubscale(index, 'numeric_value', e.target.value)}
                                                        className="w-16 rounded-xl border-slate-200 bg-white py-2 text-center text-sm font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={subscale.range_hint}
                                                        onChange={(e) => updateSubscale(index, 'range_hint', e.target.value)}
                                                        placeholder={getRangeHintPlaceholder(data.code)}
                                                        className="w-full rounded-xl border-slate-200 bg-white py-2 px-4 text-sm font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-300"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={subscale.label}
                                                        onChange={(e) => updateSubscale(index, 'label', e.target.value)}
                                                        placeholder="Label kategori..."
                                                        className="w-full rounded-xl border-slate-200 bg-white py-2 px-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-300"
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSubscale(index)}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-700 transition-colors"
                        >
                            Batalkan
                        </button>
                        <button
                            type="submit"
                            form="edit-criterion-form"
                            disabled={processing}
                            className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 active:scale-95"
                        >
                            {processing ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </div>
    );
}
