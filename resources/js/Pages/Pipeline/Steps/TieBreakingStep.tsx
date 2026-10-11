import PipelineActionBar from '@/Components/Pipeline/PipelineActionBar';
import PipelineGuide from '@/Components/Pipeline/PipelineGuide';

interface Props {
    period: any;
    stepData: any;
    pipelineState: any;
    completedRuns: any;
    finalResults: any[];
    onNavigateStep: (step: number) => void;
}

export default function TieBreakingStep({ period, stepData, completedRuns, finalResults, onNavigateStep }: Props) {
    const results: any[] = finalResults || [];
    const edasPayload = stepData.edas?.runPayload;
    const weights: Record<string, number> = stepData.tieBreaking?.weights || {};
    const criteriaNames: Record<string, string> = stepData.tieBreaking?.criteriaNames || {};

    // Kelompokkan peserta yang nilai EDAS-nya seri
    const scoreCounts: Record<string, number> = {};
    results.forEach((r) => {
        const key = Number(r.edas_score).toFixed(6);
        scoreCounts[key] = (scoreCounts[key] || 0) + 1;
    });

    const tiedResults = results.filter((r) => {
        const key = Number(r.edas_score).toFixed(6);
        return scoreCounts[key] > 1;
    });

    const hasTie = tiedResults.length > 0;
    const hasResult = results.length > 0;

    // Urutan kriteria berdasarkan bobot tertinggi (sama dengan backend)
    const orderedCriteria = Object.entries(weights)
        .sort((a, b) => b[1] - a[1])
        .map(([code]) => code);

    // Kelompokkan tie groups
    const tieGroups: Record<string, any[]> = {};
    tiedResults.forEach((r) => {
        const key = Number(r.edas_score).toFixed(6);
        if (!tieGroups[key]) tieGroups[key] = [];
        tieGroups[key].push(r);
    });

    return (
        <div className="space-y-5">
            <PipelineActionBar
                title="Tie Breaking"
                subtitle="Tahap 5 dari 6"
                onBack={() => onNavigateStep(3)}
                guide={<PipelineGuide phaseKey="tieBreaking" />}
                actions={
                    hasResult ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hidden sm:inline border border-emerald-200">
                                {hasTie ? `${tiedResults.length} PESERTA SERI` : 'TIDAK ADA NILAI SERI'}
                            </span>
                            <button
                                onClick={() => onNavigateStep(5)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <span>Lihat Hasil Akhir</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                            Belum Ada Data EDAS
                        </span>
                    )
                }
            />

            {!hasResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-medium text-slate-900">Belum ada data EDAS</h4>
                        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
                            Selesaikan kalkulasi EDAS (Tahap 4) terlebih dahulu untuk melihat proses tie-breaking.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigateStep(3)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        ← Kembali ke EDAS
                    </button>
                </div>
            )}

            {hasResult && (
                <div className="space-y-5">
                    {/* Bobot Kriteria & Urutan Prioritas */}
                    {orderedCriteria.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">Bobot Kriteria & Urutan Prioritas Tie-Breaking</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Kriteria diurutkan dari bobot tertinggi. Ketika skor EDAS peserta sama, kriteria dengan bobot terbesar menjadi pembeda utama.
                                    </p>
                                </div>
                                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                    Hasil BWM
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {orderedCriteria.map((code, idx) => (
                                    <div
                                        key={code}
                                        className={`flex-1 min-w-[100px] rounded-xl border p-3 text-center transition-all ${
                                            idx === 0
                                                ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                                                : 'border-slate-200 bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            {idx === 0 && (
                                                <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            )}
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${idx === 0 ? 'text-indigo-500' : 'text-slate-400'}`}>
                                                Prioritas {idx + 1}
                                            </span>
                                        </div>
                                        <p className={`text-base font-bold ${idx === 0 ? 'text-indigo-700' : 'text-slate-800'}`}>{code}</p>
                                        <p className={`text-[10px] mt-0.5 ${idx === 0 ? 'text-indigo-500' : 'text-slate-400'}`}>
                                            {criteriaNames[code] || code}
                                        </p>
                                        <p className={`text-xs font-semibold font-mono mt-1 ${idx === 0 ? 'text-indigo-600' : 'text-slate-600'}`}>
                                            {weights[code] != null ? Number(weights[code]).toFixed(4) : '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Tie */}
                    {!hasTie ? (
                        <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-emerald-900 text-sm">Tidak Ada Nilai Seri</h4>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                        Seluruh peserta memiliki nilai Appraisal Score (AS) yang unik. Proses tie-breaking tidak diperlukan.
                                        Peringkat final sudah langsung berdasarkan nilai AS dari EDAS.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">
                                            Ditemukan {Object.keys(tieGroups).length} kelompok nilai seri ({tiedResults.length} peserta)
                                        </p>
                                        <p className="text-xs text-amber-700 mt-0.5">
                                            Peserta dengan nilai AS sama diselesaikan menggunakan kriteria dengan bobot tertinggi secara berurutan.
                                            Pembeda pertama adalah <strong>{orderedCriteria[0]}</strong> ({criteriaNames[orderedCriteria[0]] || orderedCriteria[0]}).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Kelompok-kelompok seri */}
                            {Object.entries(tieGroups).map(([score, group], gi) => (
                                <div key={score} className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-sm">
                                    <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wide">
                                                Kelompok Seri {gi + 1}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {group.length} peserta · AS = <span className="font-mono font-semibold text-slate-700">{Number(score).toFixed(6)}</span>
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            Diselesaikan dengan {orderedCriteria[0]}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="py-2.5 px-3 text-center text-xs font-semibold text-slate-500 w-16">Kode</th>
                                                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-slate-500">Peserta</th>
                                                    <th className="py-2.5 px-3 text-right text-xs font-semibold text-indigo-600">AS (EDAS)</th>
                                                    <th className="py-2.5 px-3 text-center text-xs font-semibold text-slate-500">Peringkat EDAS</th>
                                                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-amber-700">Pembeda Tie-Breaking</th>
                                                    <th className="py-2.5 px-3 text-center text-xs font-semibold text-slate-600">Peringkat Final</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {group
                                                    .sort((a, b) => a.final_rank - b.final_rank)
                                                    .map((r: any) => (
                                                        <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                                                            <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-500">
                                                                {r.extra_payload?.code || '-'}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm font-medium text-slate-800">
                                                                {r.participant?.full_name}
                                                            </td>
                                                            <td className="py-3 px-3 text-right font-mono text-xs font-bold text-indigo-600">
                                                                {Number(r.edas_score).toFixed(6)}
                                                            </td>
                                                            <td className="py-3 px-3 text-center">
                                                                <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                                                    {r.extra_payload?.edas_rank ?? '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-xs text-slate-600">
                                                                {r.extra_payload?.tie_break_info
                                                                    ? (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                                                                            <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                                            </svg>
                                                                            <span className="font-medium text-blue-700">{r.extra_payload.tie_break_info}</span>
                                                                        </span>
                                                                    )
                                                                    : <span className="text-slate-400">—</span>
                                                                }
                                                            </td>
                                                            <td className="py-3 px-3 text-center">
                                                                <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                                                                    {r.final_rank}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tabel Peringkat Final Lengkap */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-slate-900 text-sm">Peringkat Awal EDAS vs Peringkat Final (Setelah Tie-Breaking)</h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Peserta yang mengalami tie-breaking ditandai dengan badge kuning.
                                </p>
                            </div>
                            <span className="text-xs text-slate-400">{results.length} peserta</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-3 text-center text-xs font-semibold text-slate-600 w-16">Kode</th>
                                        <th className="py-3 px-5 text-left text-xs font-semibold text-slate-600">Peserta</th>
                                        <th className="py-3 px-4 text-right text-xs font-semibold text-indigo-600">AS (EDAS)</th>
                                        <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500">Peringkat EDAS</th>
                                        <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700">Peringkat Final</th>
                                        <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500">Tie-Breaking</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {results
                                        .sort((a, b) => a.final_rank - b.final_rank)
                                        .map((r: any) => {
                                            const isTied = r.extra_payload?.is_tied;
                                            const isTieBroken = r.extra_payload?.is_tie_broken;
                                            return (
                                                <tr
                                                    key={r.id}
                                                    className={`transition-colors ${isTied ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50/60'}`}
                                                >
                                                    <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-500">
                                                        {r.extra_payload?.code || '-'}
                                                    </td>
                                                    <td className="py-3 px-5 font-medium text-slate-800">
                                                        {r.participant?.full_name}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono text-xs font-bold text-indigo-600">
                                                        {Number(r.edas_score).toFixed(6)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                            {r.extra_payload?.edas_rank ?? '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold ${
                                                            isTieBroken
                                                                ? 'bg-amber-500 text-white'
                                                                : 'bg-indigo-600 text-white'
                                                        }`}>
                                                            {r.final_rank}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {isTieBroken ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                                </svg>
                                                                Diputus via tie-break
                                                            </span>
                                                        ) : isTied ? (
                                                            <span className="text-[10px] font-medium text-amber-500">Seri (disamakan)</span>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                <strong>Mekanisme Tie-Breaking:</strong> Ketika dua atau lebih peserta memiliki nilai Appraisal Score (AS) yang identik,
                                sistem membandingkan nilai raw peserta pada kriteria dengan bobot tertinggi secara berurutan.
                                Peserta dengan nilai lebih tinggi pada kriteria benefit (atau lebih rendah pada kriteria cost) mendapat peringkat lebih baik.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
