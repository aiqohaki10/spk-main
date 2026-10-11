import { Link } from '@inertiajs/react';
import PipelineActionBar from '@/Components/Pipeline/PipelineActionBar';
import PipelineGuide from '@/Components/Pipeline/PipelineGuide';
import RankBadge from '@/Components/Pipeline/RankBadge';

interface Props {
    period: any;
    stepData: any;
    pipelineState: any;
    completedRuns: any;
    finalResults: any[];
    onNavigateStep: (step: number) => void;
}

const ACCEPTED_COUNT = 30;

export default function ResultStep({ period, completedRuns, finalResults, onNavigateStep }: Props) {
    const results = finalResults || [];
    const edasRun = completedRuns?.edas;
    const acceptedResults = results.filter((r: any) => r.final_rank <= ACCEPTED_COUNT);
    const totalResults = results.length;

    return (
        <div className="space-y-5">
            <PipelineActionBar
                title="Hasil Akhir"
                subtitle="Tahap 6 dari 6"
                onBack={() => onNavigateStep(4)}
                guide={<PipelineGuide phaseKey="result" />}
                actions={
                    results.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('pipeline.sensitivity', period.route_key)}
                                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-100"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analisis Sensitivitas
                            </Link>
                            <a
                                href={route('pipeline.result.export', period.route_key)}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export XLSX
                            </a>
                            <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                PENILAIAN SELESAI
                            </span>
                        </div>
                    ) : (
                        <span className="flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
                            HASIL BELUM TERSEDIA
                        </span>
                    )
                }
            />

            {!results.length ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">Belum ada hasil akhir</h3>
                    <p className="text-sm text-slate-500">Selesaikan perhitungan EDAS untuk menampilkan ranking peserta.</p>
                </div>
            ) : (
                <>
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Ringkasan Eksekusi</h3>
                                {edasRun && (
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                                        <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1">
                                            Kode Run: {edasRun.run_code}
                                        </span>
                                        <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1">
                                            Dieksekusi: {new Date(edasRun.executed_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={route('pipeline.sensitivity', period.route_key)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Uji Kestabilan Ranking (Sensitivitas)
                            </Link>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Peserta</div>
                                <div className="mt-0.5 text-xl font-bold text-slate-900">{totalResults}</div>
                            </div>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Diterima</div>
                                <div className="mt-0.5 text-xl font-bold text-blue-700">{Math.min(acceptedResults.length, ACCEPTED_COUNT)}</div>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tidak Diterima</div>
                                <div className="mt-0.5 text-xl font-bold text-slate-500">{Math.max(totalResults - ACCEPTED_COUNT, 0)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {results.slice(0, 3).map((result: any, index: number) => {
                            const styles = [
                                'bg-indigo-600 text-white border-indigo-700',
                                'bg-white text-slate-900 border-slate-200',
                                'bg-white text-slate-900 border-slate-200',
                            ];

                            return (
                                <div key={result.id} className={`relative overflow-hidden rounded-xl border p-6 shadow-sm ${styles[index]}`}>
                                    <div className="absolute top-0 right-0 -mr-3 -mt-3 select-none text-7xl font-semibold opacity-5">
                                        #{index + 1}
                                    </div>
                                    <div className="relative z-10">
                                        <RankBadge rank={index + 1} size="lg" />
                                        <div className={`mt-3 text-[10px] font-medium uppercase tracking-wider ${index === 0 ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            Peringkat {index + 1}
                                        </div>
                                        <h4 className="mt-1 truncate text-lg font-semibold">{result.participant?.full_name}</h4>
                                        <div className={`mt-2 text-xs ${index === 0 ? 'text-indigo-200' : 'text-slate-500'}`}>
                                            EDAS: <span className="font-mono">{result.edas_score != null ? Number(result.edas_score).toFixed(4) : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <div className="flex items-center gap-3">
                                <h4 className="text-sm font-medium text-slate-900">Tabel Peringkat Lengkap</h4>
                                <div className="flex items-center gap-2 text-[10px]">
                                    <span className="flex items-center gap-1">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-100 border border-blue-200"></span>
                                        <span className="text-slate-400">Diterima (Top {ACCEPTED_COUNT})</span>
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">{results.length} peserta</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="w-16 py-3 px-3 text-center text-xs font-semibold text-slate-600">Kode</th>
                                        <th className="w-20 py-3 px-4 text-center text-xs font-semibold text-slate-600">Peringkat</th>
                                        <th className="py-3 px-5 text-xs font-semibold text-slate-600">Peserta</th>
                                        <th className="py-3 px-5 text-right text-xs font-semibold text-slate-600">Skor EDAS</th>
                                        <th className="py-3 px-5 text-center text-xs font-semibold text-slate-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {results.map((result: any) => {
                                        const isAccepted = result.final_rank <= ACCEPTED_COUNT;
                                        return (
                                            <tr
                                                key={result.id}
                                                className={`transition-colors ${
                                                    isAccepted
                                                        ? 'bg-blue-50/40 hover:bg-blue-50/70'
                                                        : 'hover:bg-slate-50/50'
                                                }`}
                                            >
                                                <td className="py-3.5 px-3 text-center font-mono text-xs font-bold text-slate-500">
                                                    {result.extra_payload?.code || '-'}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <RankBadge rank={result.final_rank} size="sm" />
                                                </td>
                                                <td className="py-3.5 px-5 text-sm font-medium text-slate-900">
                                                    {result.participant?.full_name}
                                                </td>
                                                <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-500 font-semibold text-indigo-600">
                                                    {result.edas_score != null ? Number(result.edas_score).toFixed(6) : '-'}
                                                </td>
                                                <td className="py-3.5 px-5 text-center">
                                                    {isAccepted ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Diterima
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-slate-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-800">Alur Penilaian Selesai</p>
                                <p className="mt-0.5 text-xs text-emerald-600">Seluruh tahap untuk "{period.name}" berhasil diselesaikan.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
