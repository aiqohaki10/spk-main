import { router, Link } from '@inertiajs/react';
import ParticipantImportModal from '@/Components/Participants/ParticipantImportModal';
import EmptyState from '@/Components/UI/EmptyState';
import PipelineActionBar from '@/Components/Pipeline/PipelineActionBar';
import PipelineGuide from '@/Components/Pipeline/PipelineGuide';
import { useState } from 'react';

interface Props {
    period: any;
    stepData: any;
    pipelineState: any;
    onNavigateStep: (step: number) => void;
}

export default function ScoringStep({ period, stepData, pipelineState, onNavigateStep }: Props) {
    const participants = stepData.scoring?.participants || [];
    const criteria = stepData.scoring?.criteriaForScoring || [];
    const isCompleted = pipelineState.currentStep > 2;
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleAutoPopulate = () => {
        router.post(route('pipeline.scoring.autoPopulate', period.route_key));
    };

    const handleComplete = () => {
        router.post(route('pipeline.scoring.complete', period.route_key));
    };

    // Check if all participants have scores
    const allScored = participants.length >= 3 && participants.every((p: any) =>
        p.scores?.length >= criteria.length && p.scores.every((s: any) => s.raw_value !== null)
    );
    const readyParticipants = participants.filter((participant: any) =>
        participant.scores?.length >= criteria.length && participant.scores.every((score: any) => score.raw_value !== null)
    ).length;
    const totalScoreSlots = participants.length * criteria.length;
    const filledScoreSlots = participants.reduce((total: number, participant: any) => (
        total + (participant.scores || []).filter((score: any) => score.raw_value !== null && score.raw_value !== undefined).length
    ), 0);
    const missingScoreSlots = Math.max(totalScoreSlots - filledScoreSlots, 0);

    return (
        <div className="space-y-5">
            <PipelineActionBar
                title="Peserta & Nilai"
                subtitle={`Tahap 2 dari 5`}
                onBack={() => onNavigateStep(0)}
                guide={<PipelineGuide phaseKey="scoring" />}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAutoPopulate}
                            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 transition-all hover:bg-violet-100"
                        >
                            Sinkron Skor
                        </button>
                        {allScored && !isCompleted && (
                            <button
                                onClick={handleComplete}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <span>Lanjut ke BWM</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        )}
                        {isCompleted && (
                            <button
                                onClick={() => onNavigateStep(2)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <span>Lanjut</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        )}
                    </div>
                }
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace peserta</p>
                            <h3 className="mt-2 text-xl font-bold text-slate-900">Input peserta tetap di dalam pipeline</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Import Excel
                            </button>
                            <a
                                href={route('participants.template')}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Template Excel
                            </a>
                            <Link
                                href={route('participants.index')}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Modul peserta
                            </Link>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Peserta siap</div>
                            <div className="mt-2 text-2xl font-bold text-slate-900">{readyParticipants}/{participants.length}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Nilai terisi</div>
                            <div className="mt-2 text-2xl font-bold text-slate-900">{filledScoreSlots}/{totalScoreSlots || 0}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</div>
                            <div className={`mt-2 text-base font-bold ${allScored ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {allScored ? 'Siap ke BWM' : 'Lengkapi input'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Checklist</p>
                    <div className="mt-3 space-y-3">
                        {[
                            'Tambah atau import peserta.',
                            'Jalankan sinkron skor setelah ada perubahan data.',
                            'Lanjutkan saat semua nilai sudah terisi.',
                        ].map((item, index) => (
                            <div key={item} className="flex items-start gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                    {index + 1}
                                </div>
                                <p className="pt-1 text-sm text-slate-600">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total peserta</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{participants.length}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Minimal 3 peserta</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Kriteria aktif</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{criteria.length}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Semua kolom dipakai di matriks</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Status matriks</p>
                    <p className={`mt-1 text-2xl font-semibold ${allScored ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {allScored ? 'Siap' : 'Belum siap'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{allScored ? 'Semua skor sudah terisi' : `${missingScoreSlots} nilai masih kosong`}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Sinkronisasi</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{participants.length > 0 ? 'Aktif' : 'Menunggu'}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Jalankan ulang setelah ada perubahan peserta</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">Matriks keputusan</h4>
                        <p className="mt-1 text-xs text-slate-400">Lengkapi semua sel sebelum lanjut ke BWM.</p>
                    </div>
                    <span className="text-xs text-slate-400">
                        {participants.length} x {criteria.length}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                                    Peserta
                                </th>
                                {criteria.map((c: any) => (
                                    <th key={c.id} className="py-3 px-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[80px]">
                                        <div>{c.code}</div>
                                        <div className="font-normal normal-case text-[9px] text-slate-400 mt-0.5">{c.name}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {participants.length === 0 ? (
                                <tr>
                                    <td colSpan={criteria.length + 1}>
                                        <EmptyState
                                            title="Belum ada peserta"
                                            description="Import langsung dari tahap ini."
                                            action={
                                                <button
                                                    onClick={() => setIsImportModalOpen(true)}
                                                    className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                                                >
                                                    Import Excel
                                                </button>
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : participants.map((p: any) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap text-xs sticky left-0 bg-white z-10 border-r border-slate-100">
                                        {p.full_name}
                                    </td>
                                    {criteria.map((c: any) => {
                                        const score = p.scores?.find((s: any) => s.criterion_id === c.id);
                                        const hasValue = score?.raw_value !== null && score?.raw_value !== undefined;
                                        return (
                                            <td key={c.id} className="py-3 px-4 text-center">
                                                {hasValue ? (
                                                    <span className="font-mono text-xs text-slate-700 bg-slate-50 px-2 py-0.5 rounded">
                                                        {Number(score.raw_value).toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-rose-400 bg-rose-50 px-2 py-0.5 rounded">
                                                        --
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ParticipantImportModal
                open={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                importHref={route('participants.import')}
                templateHref={route('participants.template')}
                title="Import peserta ke pipeline"
                description="File yang diimpor akan langsung masuk ke periode aktif ini dan skor awal peserta akan otomatis disinkronkan ke matriks."
            />
        </div>
    );
}
