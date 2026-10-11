import { router } from '@inertiajs/react';
import { useState } from 'react';
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

export default function BwmStep({ period, stepData, onNavigateStep }: Props) {
    const criteria = stepData.setup?.criteria || [];
    const bwmData = stepData.bwm;
    const hasResult = !!bwmData?.runPayload;

    const [bestId, setBestId] = useState<number | ''>(bwmData?.comparison?.best_criterion_id || '');
    const [worstId, setWorstId] = useState<number | ''>(bwmData?.comparison?.worst_criterion_id || '');
    const [processing, setProcessing] = useState(false);

    const initializeVector = (savedValues: any) => {
        const vector: Record<number, number> = {};
        criteria.forEach((criterion: any) => {
            vector[criterion.id] = savedValues?.[criterion.id] || 1;
        });
        return vector;
    };

    const [bestToOthers, setBestToOthers] = useState<Record<number, number>>(initializeVector(bwmData?.comparison?.best_to_others));
    const [othersToWorst, setOthersToWorst] = useState<Record<number, number>>(initializeVector(bwmData?.comparison?.others_to_worst));

    const handleProcess = () => {
        setProcessing(true);
        router.post(route('pipeline.bwm.process', period.route_key), {
            best_criterion_id: bestId,
            worst_criterion_id: worstId,
            best_to_others: bestToOthers,
            others_to_worst: othersToWorst,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="space-y-5">
            <PipelineActionBar
                title="BWM"
                subtitle="Tahap 3 dari 5"
                onBack={() => onNavigateStep(1)}
                guide={<PipelineGuide phaseKey="bwm" />}
                actions={
                    !hasResult ? (
                        bestId && worstId && (
                            <ProcessButton
                                processing={processing}
                                onClick={handleProcess}
                                label="Hitung Bobot BWM"
                                loadingLabel="Menghitung..."
                            />
                        )
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hidden sm:inline">BWM SELESAI</span>
                            <button
                                onClick={() => onNavigateStep(3)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <span>Lanjut ke EDAS</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    )
                }
            />

            {!hasResult && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Input prioritas</p>
                                <p className="mt-1 text-sm text-slate-600">Tentukan kriteria terbaik, kriteria terendah, lalu isi preferensi 1 sampai 9.</p>
                            </div>
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                Output: bobot + consistency ratio
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Kriteria Terbaik</label>
                                <select
                                    value={bestId}
                                    onChange={(event) => {
                                        const val = event.target.value === '' ? '' : Number(event.target.value);
                                        setBestId(val);
                                        if (val !== '') {
                                            setBestToOthers(prev => ({ ...prev, [val]: 1 }));
                                        }
                                    }}
                                    className="w-full rounded-lg border-slate-300 bg-white py-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Pilih kriteria terbaik...</option>
                                    {criteria.map((criterion: any) => (
                                        <option key={criterion.id} value={criterion.id} disabled={criterion.id === worstId}>
                                            {criterion.code} - {criterion.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Kriteria Prioritas Terendah</label>
                                <select
                                    value={worstId}
                                    onChange={(event) => {
                                        const val = event.target.value === '' ? '' : Number(event.target.value);
                                        setWorstId(val);
                                        if (val !== '') {
                                            setOthersToWorst(prev => ({ ...prev, [val]: 1 }));
                                        }
                                    }}
                                    className="w-full rounded-lg border-slate-300 bg-white py-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Pilih kriteria prioritas terendah...</option>
                                    {criteria.map((criterion: any) => (
                                        <option key={criterion.id} value={criterion.id} disabled={criterion.id === bestId}>
                                            {criterion.code} - {criterion.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    {bestId && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-900 mb-3">
                                Preferensi Kriteria Terbaik ke Kriteria Lain
                                <span className="text-xs text-slate-400"> (1 = sama penting, 9 = jauh lebih penting)</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {criteria.map((criterion: any) => {
                                    const isSelf = criterion.id === bestId;
                                    return (
                                        <div key={criterion.id} className={`flex items-center gap-3 rounded-lg p-3 border transition-all ${isSelf ? 'bg-slate-100 border-slate-300 opacity-80' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}>
                                            <span className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-medium shrink-0 border ${isSelf ? 'bg-slate-200 border-slate-400 text-slate-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                                                {criterion.code}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium truncate ${isSelf ? 'text-slate-500' : 'text-slate-700'}`}>{criterion.name}</p>
                                                {isSelf ? (
                                                    <p className="text-[10px] text-slate-500 mt-1 font-medium italic flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Otomatis 1
                                                    </p>
                                                ) : (
                                                    <input
                                                        type="range"
                                                        min={1}
                                                        max={9}
                                                        value={bestToOthers[criterion.id] || 1}
                                                        onChange={(event) => setBestToOthers((previous) => ({ ...previous, [criterion.id]: Number(event.target.value) }))}
                                                        className="w-full h-1 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600 mt-1.5"
                                                    />
                                                )}
                                            </div>
                                            <span className={`text-sm font-semibold w-6 text-center ${isSelf ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                {isSelf ? 1 : (bestToOthers[criterion.id] || 1)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {worstId && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-900 mb-3">
                                Preferensi Kriteria Lain ke Kriteria Prioritas Terendah
                                <span className="text-xs text-slate-400"> (1 = sama penting, 9 = jauh lebih penting)</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {criteria.map((criterion: any) => {
                                    const isSelf = criterion.id === worstId;
                                    return (
                                        <div key={criterion.id} className={`flex items-center gap-3 rounded-lg p-3 border transition-all ${isSelf ? 'bg-slate-100 border-slate-300 opacity-80' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}>
                                            <span className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-medium shrink-0 border ${isSelf ? 'bg-slate-200 border-slate-400 text-slate-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                                                {criterion.code}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium truncate ${isSelf ? 'text-slate-500' : 'text-slate-700'}`}>{criterion.name}</p>
                                                {isSelf ? (
                                                    <p className="text-[10px] text-slate-500 mt-1 font-medium italic flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Otomatis 1
                                                    </p>
                                                ) : (
                                                    <input
                                                        type="range"
                                                        min={1}
                                                        max={9}
                                                        value={othersToWorst[criterion.id] || 1}
                                                        onChange={(event) => setOthersToWorst((previous) => ({ ...previous, [criterion.id]: Number(event.target.value) }))}
                                                        className="w-full h-1 bg-amber-100 rounded-full appearance-none cursor-pointer accent-amber-600 mt-1.5"
                                                    />
                                                )}
                                            </div>
                                            <span className={`text-sm font-semibold w-6 text-center ${isSelf ? 'text-slate-400' : 'text-amber-600'}`}>
                                                {isSelf ? 1 : (othersToWorst[criterion.id] || 1)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    </div>
                </div>
            )}

            {hasResult && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
                            <h4 className="font-medium text-slate-900 text-sm mb-5">Bobot Kriteria</h4>
                            <div className="space-y-3">
                                {bwmData.weights?.map((weight: any) => {
                                    const percentage = weight.weight_value * 100;
                                    return (
                                        <div key={weight.id} className="flex items-center gap-3">
                                            <span className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-medium border border-indigo-100 shrink-0">
                                                {weight.criterion?.code}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-slate-700">{weight.criterion?.name}</span>
                                                    <span className="text-xs font-semibold text-indigo-600">{percentage.toFixed(2)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deviasi Maksimum / Xi</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">{Number(bwmData.runPayload?.xi || 0).toFixed(6)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Consistency Ratio</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">{Number(bwmData.runPayload?.consistency_ratio || 0).toFixed(6)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status Konsistensi</p>
                                <span className={`mt-2 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    bwmData.runPayload?.consistency_status === 'konsisten'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                    {bwmData.runPayload?.consistency_status === 'konsisten' ? 'Konsisten' : 'Belum Konsisten'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <h4 className="font-medium text-slate-900 text-sm mb-4">Ringkasan Input BWM</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 mb-1">Kriteria Terbaik</p>
                                <p className="font-medium text-slate-900">
                                    {criteria.find((criterion: any) => criterion.id === bwmData.runPayload?.best_criterion_id)?.name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-1">Kriteria Prioritas Terendah</p>
                                <p className="font-medium text-slate-900">
                                    {criteria.find((criterion: any) => criterion.id === bwmData.runPayload?.worst_criterion_id)?.name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
