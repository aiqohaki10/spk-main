import { useForm } from '@inertiajs/react';
import ProcessButton from '@/Components/Pipeline/ProcessButton';
import HeatmapMatrix from '@/Components/Pipeline/HeatmapMatrix';
import PipelineActionBar from '@/Components/Pipeline/PipelineActionBar';
import PipelineGuide from '@/Components/Pipeline/PipelineGuide';

interface Props {
    period: any;
    stepData: any;
    pipelineState: any;
    completedRuns: any;
    onNavigateStep: (step: number) => void;
}

export default function EdasStep({ period, stepData, onNavigateStep }: Props) {
    const edasPayload = stepData.edas?.runPayload;
    const hasResult = !!edasPayload;

    const { post, processing } = useForm();

    const handleProcess = () => {
        post(route('pipeline.edas.process', period.route_key));
    };

    const criteriaHeaders = edasPayload?.criteria_codes || [];
    const pdaRows = (edasPayload?.pda_matrix || []).map((row: any) => ({
        label: `${row.code ? row.code + ' - ' : ''}${row.participant_name}`,
        values: criteriaHeaders.map((code: string) => row[code] || 0),
    }));
    const ndaRows = (edasPayload?.nda_matrix || []).map((row: any) => ({
        label: `${row.code ? row.code + ' - ' : ''}${row.participant_name}`,
        values: criteriaHeaders.map((code: string) => row[code] || 0),
    }));

    return (
        <div className="space-y-5">
            <PipelineActionBar
                title="Kalkulasi EDAS"
                subtitle="Tahap 4 dari 6"
                onBack={() => onNavigateStep(2)}
                guide={<PipelineGuide phaseKey="edas" />}
                actions={
                    !hasResult ? (
                        <ProcessButton
                            processing={processing}
                            onClick={handleProcess}
                            label="Jalankan EDAS"
                            loadingLabel="Menghitung..."
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hidden sm:inline">EDAS SELESAI</span>
                            <button
                                type="button"
                                onClick={handleProcess}
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 border border-slate-200"
                                title="Hitung ulang kalkulasi EDAS"
                            >
                                <svg className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{processing ? 'Menghitung...' : 'Hitung Ulang'}</span>
                            </button>
                            <button
                                onClick={() => onNavigateStep(4)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <span>Lihat Tie Breaking</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    )
                }
            />

            {!hasResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-medium text-slate-900">Belum ada hasil EDAS</h4>
                        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
                            Jalankan proses EDAS saat data peserta dan bobot BWM sudah siap.
                        </p>
                    </div>
                </div>
            )}

            {hasResult && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h4 className="font-medium text-slate-900 text-sm mb-3">Average Value per Kriteria (AV)</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(edasPayload.average_solution || {}).map(([code, value]: any) => (
                                <div key={code} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase">{code}</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{Number(value).toFixed(4)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <HeatmapMatrix
                        title="Matriks PDA"
                        headers={criteriaHeaders}
                        rows={pdaRows}
                        colorScale="green-red"
                    />

                    <HeatmapMatrix
                        title="Matriks NDA"
                        headers={criteriaHeaders}
                        rows={ndaRows}
                        colorScale="blue-orange"
                    />

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900 text-sm">
                                Nilai NSP, NSN, Appraisal Score (AS), dan Peringkat EDAS
                            </h4>
                            <span className="text-xs text-slate-400">
                                {(edasPayload.appraisal_scores || []).length} alternatif
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-3 text-center text-xs font-semibold text-slate-600 w-16">Kode</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600">Nama Alternatif / Peserta</th>
                                        <th className="py-3 px-3 text-right text-xs font-semibold text-slate-600">SP</th>
                                        <th className="py-3 px-3 text-right text-xs font-semibold text-slate-600">SN</th>
                                        <th className="py-3 px-3 text-right text-xs font-semibold text-slate-600">NSP</th>
                                        <th className="py-3 px-3 text-right text-xs font-semibold text-slate-600">NSN</th>
                                        <th className="py-3 px-4 text-right text-xs font-semibold text-indigo-700">AS</th>
                                        <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 w-24">Peringkat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(edasPayload.appraisal_scores || []).map((entry: any) => (
                                        <tr key={entry.participant_id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-600 bg-slate-50/50">
                                                {entry.code || '-'}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-slate-800">
                                                {entry.participant_name}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-xs text-slate-500">
                                                {Number(entry.sp).toFixed(5)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-xs text-slate-500">
                                                {Number(entry.sn).toFixed(5)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-xs text-slate-600">
                                                {Number(entry.nsp).toFixed(5)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-xs text-slate-600">
                                                {Number(entry.nsn).toFixed(5)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-xs font-bold text-indigo-600">
                                                {Number(entry.score).toFixed(5)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {entry.rank ?? '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                <strong>Catatan:</strong> Tabel ini menampilkan urutan data perhitungan mentah peserta (A1, A2, ...) beserta Peringkat EDAS murni. Peserta dengan nilai Appraisal Score (AS) yang sama berbagi peringkat yang sama. Pemecahan nilai seri (<em>tie-breaking</em>) diproses pada Tahap 5 (Hasil Akhir).
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
