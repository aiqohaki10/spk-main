import { useForm } from '@inertiajs/react';
import ProcessButton from '@/Components/Pipeline/ProcessButton';
import PipelineActionBar from '@/Components/Pipeline/PipelineActionBar';
import PipelineGuide from '@/Components/Pipeline/PipelineGuide';

interface Props {
    period: any;
    stepData: any;
    pipelineState: any;
    completedRuns: any;
    onNavigateStep: (step: number) => void;
}

export default function CopelandStep({ period, stepData, onNavigateStep }: Props) {
    const copelandPayload = stepData.copeland?.runPayload;
    const hasResult = !!copelandPayload;

    const { post, processing } = useForm();

    const handleProcess = () => {
        post(route('pipeline.copeland.process', period.route_key));
    };

    const pairwiseMatrix = copelandPayload?.pairwise_matrix || [];
    const participantLabels = copelandPayload?.participant_labels || {};
    const participantIds = Object.keys(participantLabels).map(Number);

    const getCellColor = (value: number) => {
        if (value === 1) {
            return 'bg-emerald-50 text-emerald-700 font-medium';
        }

        if (value === -1) {
            return 'bg-rose-50 text-rose-700 font-medium';
        }

        return 'bg-slate-50 text-slate-400';
    };

    const getCellLabel = (value: number) => {
        if (value === 1) {
            return 'M';
        }

        if (value === -1) {
            return 'K';
        }

        return 'I';
    };

    return (
        <div className="space-y-5">
            <PipelineActionBar
                title="Pemeringkatan Copeland"
                subtitle="Tahap 5 dari 6"
                onBack={() => onNavigateStep(3)}
                guide={<PipelineGuide phaseKey="copeland" />}
                actions={
                    !hasResult ? (
                        <ProcessButton
                            processing={processing}
                            onClick={handleProcess}
                            label="Jalankan Copeland"
                            loadingLabel="Menghitung..."
                            variant="success"
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hidden sm:inline">COPELAND SELESAI</span>
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
                    )
                }
            />

            {!hasResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-medium text-slate-900">Belum ada hasil Copeland</h4>
                        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
                            Jalankan Copeland setelah hasil EDAS tersedia untuk semua peserta.
                        </p>
                    </div>
                </div>
            )}

            {hasResult && (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="font-medium text-slate-900 text-sm">Matriks Perbandingan Berpasangan</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-200" /> Menang</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-200" /> Kalah</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-200" /> Imbang</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="py-2.5 px-3 text-left text-xs font-medium text-slate-500 sticky left-0 bg-slate-50 z-10 min-w-[120px]">
                                            vs
                                        </th>
                                        {pairwiseMatrix.map((row: any) => (
                                            <th key={row.participant_id} className="py-2.5 px-2 text-center text-xs font-medium text-slate-500 min-w-[55px]">
                                                {row.participant_name?.split(' ')[0]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pairwiseMatrix.map((row: any) => (
                                        <tr key={row.participant_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-2 px-3 font-medium text-slate-700 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-100">
                                                {row.participant_name}
                                            </td>
                                            {participantIds.map((columnId: number) => {
                                                const value = row.comparisons[columnId] ?? 0;
                                                const isSelf = row.participant_id === columnId;
                                                return (
                                                    <td key={columnId} className={`py-2 px-2 text-center ${isSelf ? 'bg-slate-100' : ''}`}>
                                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs ${isSelf ? 'text-slate-300' : getCellColor(value)}`}>
                                                            {isSelf ? '-' : getCellLabel(value)}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h4 className="font-medium text-slate-900 text-sm">Ringkasan Copeland</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="py-2.5 px-4 text-center text-xs font-medium text-slate-500 w-16">Peringkat</th>
                                        <th className="py-2.5 px-4 text-left text-xs font-medium text-slate-500">Peserta</th>
                                        <th className="py-2.5 px-4 text-center text-xs font-medium text-slate-500">Menang</th>
                                        <th className="py-2.5 px-4 text-center text-xs font-medium text-slate-500">Kalah</th>
                                        <th className="py-2.5 px-4 text-center text-xs font-medium text-slate-500">Imbang</th>
                                        <th className="py-2.5 px-4 text-right text-xs font-medium text-slate-500">Skor EDAS</th>
                                        <th className="py-2.5 px-4 text-right text-xs font-medium text-slate-500">Skor Copeland</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(copelandPayload.rankings || []).map((ranking: any) => (
                                        <tr key={ranking.participant_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 text-center font-semibold text-slate-700">{ranking.final_rank}</td>
                                            <td className="py-3 px-4 font-medium text-slate-700">{ranking.participant_name}</td>
                                            <td className="py-3 px-4 text-center font-medium text-emerald-600">{ranking.wins}</td>
                                            <td className="py-3 px-4 text-center font-medium text-rose-500">{ranking.losses}</td>
                                            <td className="py-3 px-4 text-center font-medium text-slate-500">{ranking.ties}</td>
                                            <td className="py-3 px-4 text-right font-mono text-xs text-slate-500">{Number(ranking.edas_score).toFixed(6)}</td>
                                            <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                                                {ranking.copeland_score > 0 ? '+' : ''}{ranking.copeland_score}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
