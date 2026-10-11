import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PipelineLayout from '@/Layouts/PipelineLayout';
import RankBadge from '@/Components/Pipeline/RankBadge';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

interface ScenarioComparison {
    participant_id: number;
    participant_name: string;
    scenario_rank: number;
    baseline_rank: number;
    diff: number;
    copeland_score: number;
    edas_score: number;
}

interface Scenario {
    id: number;
    code: string;
    type: 'swap' | 'increase_top' | 'decrease_lowest' | 'equal';
    type_label: string;
    name: string;
    description: string;
    weights: Record<string, number>;
    spearman_correlation: number;
    status: 'Tetap' | 'Berubah';
    is_stable: boolean;
    is_top1_stable: boolean;
    top1_name: string;
    top3_participants: Array<{ rank: number; name: string; participant_id: number }>;
    rankings_comparison: ScenarioComparison[];
}

interface AnalysisProps {
    baseline: {
        weights: Record<string, number>;
        top1_participant: {
            participant_id: number;
            participant_name: string;
            rank: number;
            copeland_score: number;
            edas_score: number;
        } | null;
        total_participants: number;
        criteria: Array<{ id: number; code: string; name: string }>;
    };
    scenarios: Scenario[];
    summary: {
        total_scenarios: number;
        stable_scenarios_count: number;
        changed_scenarios_count: number;
        stability_percentage: number;
        top1_stable_count: number;
        top1_stability_percentage: number;
        average_spearman: number;
        conclusion_category: string;
        conclusion_text: string;
    };
}

interface Props {
    period: any;
    pipelineState: any;
    analysis: AnalysisProps;
}

export default function Sensitivity({ period, pipelineState, analysis }: Props) {
    const { baseline, scenarios, summary } = analysis;
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

    const filteredScenarios = scenarios.filter((s) => {
        if (filterType === 'all') return true;
        return s.type === filterType;
    });

    const criteriaCodes = Object.keys(baseline.weights || {});

    return (
        <PipelineLayout period={period} pipelineState={pipelineState}>
            <Head title={`Analisis Sensitivitas - ${period.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                                UJI KESTABILAN RANKING
                            </span>
                            <span className="text-xs text-slate-400">Metode Spearman & Perturbasi Bobot BWM</span>
                        </div>
                        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                            Analisis Sensitivitas
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Menguji kestabilan peringkat akhir (EDAS & Copeland) terhadap variasi bobot kriteria.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('pipeline.index', period.route_key)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Wizard Hasil
                        </Link>
                    </div>
                </div>

                {/* Summary KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Skenario</div>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">{summary.total_scenarios}</span>
                            <span className="text-xs text-slate-500">skenario diuji</span>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">Tukar bobot, kenaikan & penurunan</p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Skenario Tetap</div>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-700">{summary.stability_percentage}%</span>
                            <span className="text-xs font-medium text-emerald-600">({summary.stable_scenarios_count}/{summary.total_scenarios})</span>
                        </div>
                        <p className="mt-2 text-[11px] text-emerald-600">Korelasi Spearman tinggi & stabil</p>
                    </div>

                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Rata-rata Spearman (rs)</div>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-black text-indigo-700">{summary.average_spearman}</span>
                            <span className="text-xs font-medium text-indigo-600">/ 1.0000</span>
                        </div>
                        <p className="mt-2 text-[11px] text-indigo-600">Koefisien korelasi rank antar skenario</p>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Konsistensi Top 1</div>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-blue-700">{summary.top1_stability_percentage}%</span>
                            <span className="text-xs font-medium text-blue-600">({summary.top1_stable_count}/{summary.total_scenarios})</span>
                        </div>
                        <p className="mt-2 text-[11px] text-blue-600">Peringkat teratas tidak bergeser</p>
                    </div>
                </div>

                {/* Conclusion & Evaluation Box */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                                    Kesimpulan Kestabilan Sistem: {summary.conclusion_category}
                                </h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600">
                                {summary.conclusion_text}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-right">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Baseline Top 1</div>
                                <div className="text-sm font-bold text-slate-900">{baseline.top1_participant?.participant_name || '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Baseline Weights Reference */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Bobot Kriteria Acuan (Baseline BWM)
                        </h4>
                        <span className="text-xs text-slate-400">Total: 1.0000</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {baseline.criteria.map((c) => {
                            const w = baseline.weights[c.code] ?? 0;
                            return (
                                <div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-indigo-600">{c.code}</span>
                                        <span className="font-mono text-xs font-semibold text-slate-700">{Number(w).toFixed(4)}</span>
                                    </div>
                                    <div className="mt-1 truncate text-[11px] text-slate-500">{c.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Scenarios Table Section */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Daftar Skenario Pengujian</h3>
                            <p className="text-xs text-slate-500">
                                Menampilkan detail perubahan bobot, skor korelasi Spearman, dan status per skenario.
                            </p>
                        </div>
                        {/* Filter tabs */}
                        <div className="flex flex-wrap gap-1">
                            {[
                                { key: 'all', label: 'Semua' },
                                { key: 'swap', label: 'Tukar Bobot' },
                                { key: 'increase_top', label: 'Naik Bobot Utama' },
                                { key: 'decrease_lowest', label: 'Turun Bobot Terendah' },
                                { key: 'equal', label: 'Bobot Rata' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterType(tab.key)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                        filterType === tab.key
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-100/70 font-semibold text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-center">Kode</th>
                                    <th className="px-4 py-3">Skenario</th>
                                    <th className="px-4 py-3">Perubahan Bobot</th>
                                    <th className="px-4 py-3">Peringkat 1 Skenario</th>
                                    <th className="px-4 py-3 text-right">Korelasi Spearman (rs)</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredScenarios.map((sc) => (
                                    <tr key={sc.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                                            {sc.code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-900">{sc.name}</div>
                                            <div className="mt-0.5 max-w-sm truncate text-[11px] text-slate-400">
                                                {sc.description}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                                                {criteriaCodes.map((code) => {
                                                    const baseW = baseline.weights[code] ?? 0;
                                                    const scW = sc.weights[code] ?? 0;
                                                    const isChanged = Math.abs(baseW - scW) > 0.0001;
                                                    return (
                                                        <span
                                                            key={code}
                                                            className={`rounded px-1.5 py-0.5 ${
                                                                isChanged
                                                                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                            title={`${code}: ${Number(scW).toFixed(4)}`}
                                                        >
                                                            {code}: {Number(scW).toFixed(2)}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <RankBadge rank={1} size="sm" />
                                                <span className={`font-medium ${
                                                    sc.is_top1_stable ? 'text-slate-900' : 'text-amber-700 font-bold'
                                                }`}>
                                                    {sc.top1_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                                            <span className={
                                                sc.spearman_correlation >= 0.95
                                                    ? 'text-emerald-600'
                                                    : sc.spearman_correlation >= 0.80
                                                        ? 'text-indigo-600'
                                                        : 'text-amber-600'
                                            }>
                                                {sc.spearman_correlation.toFixed(4)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                sc.is_stable
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                                {sc.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedScenario(sc)}
                                                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                                            >
                                                Lihat Rank
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Detail Perbandingan Peringkat */}
            <Modal show={selectedScenario !== null} onClose={() => setSelectedScenario(null)} maxWidth="2xl">
                {selectedScenario && (
                    <div className="p-6">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                                        {selectedScenario.code}
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900">{selectedScenario.name}</h3>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{selectedScenario.description}</p>
                            </div>
                            <button
                                onClick={() => setSelectedScenario(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Metrics */}
                        <div className="my-4 grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400">Korelasi Spearman</div>
                                <div className="mt-0.5 font-mono text-base font-bold text-indigo-700">
                                    {selectedScenario.spearman_correlation.toFixed(4)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400">Status Skenario</div>
                                <div className={`mt-0.5 text-base font-bold ${
                                    selectedScenario.is_stable ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                    {selectedScenario.status}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400">Top 1 Skenario</div>
                                <div className="mt-0.5 truncate text-xs font-bold text-slate-800">
                                    {selectedScenario.top1_name}
                                </div>
                            </div>
                        </div>

                        {/* Participants Rank Table */}
                        <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                                    <tr>
                                        <th className="py-2.5 px-3">Peserta</th>
                                        <th className="py-2.5 px-3 text-center">Rank Awal</th>
                                        <th className="py-2.5 px-3 text-center">Rank Skenario</th>
                                        <th className="py-2.5 px-3 text-center">Perubahan (Δ)</th>
                                        <th className="py-2.5 px-3 text-right">Skor Copeland</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {selectedScenario.rankings_comparison
                                        .sort((a, b) => a.scenario_rank - b.scenario_rank)
                                        .map((row) => (
                                            <tr key={row.participant_id} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-3 font-medium text-slate-900">
                                                    {row.participant_name}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <RankBadge rank={row.baseline_rank} size="sm" />
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <RankBadge rank={row.scenario_rank} size="sm" />
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {row.diff > 0 ? (
                                                        <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                                            ↑ +{row.diff}
                                                        </span>
                                                    ) : row.diff < 0 ? (
                                                        <span className="inline-flex items-center text-xs font-bold text-rose-600">
                                                            ↓ {row.diff}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">0</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                                                    {row.copeland_score > 0 ? `+${row.copeland_score}` : row.copeland_score}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <SecondaryButton onClick={() => setSelectedScenario(null)}>
                                Tutup
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </PipelineLayout>
    );
}
