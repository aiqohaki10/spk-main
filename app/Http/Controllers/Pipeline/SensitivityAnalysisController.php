<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\Criterion;
use App\Models\Participant;
use App\Models\CalculationRun;
use App\Models\CalculationResult;
use App\Models\CriterionWeight;
use App\Services\PipelineStateService;
use App\Services\Sensitivity\SensitivityAnalysisService;
use Inertia\Inertia;
use InvalidArgumentException;

class SensitivityAnalysisController extends Controller
{
    public function __construct(
        protected PipelineStateService $pipelineService,
        protected SensitivityAnalysisService $sensitivityService
    ) {}

    /**
     * Display the Sensitivity Analysis page for a given assessment period.
     */
    public function index(AssessmentPeriod $period)
    {
        session(['active_period_id' => $period->id]);

        // Get latest EDAS run
        $edasRun = CalculationRun::where('assessment_period_id', $period->id)
            ->where('method_stage', 'EDAS')
            ->latest()
            ->first();

        if (!$edasRun) {
            return redirect()->route('pipeline.index', $period)
                ->with('error', 'Hasil akhir perankingan belum tersedia. Harap selesaikan kalkulasi EDAS terlebih dahulu.');
        }

        // Fetch baseline results
        $baselineResults = CalculationResult::where('calculation_run_id', $edasRun->id)
            ->with('participant')
            ->orderBy('final_rank')
            ->get();

        if ($baselineResults->isEmpty()) {
            return redirect()->route('pipeline.index', $period)
                ->with('error', 'Data hasil peringkat tidak ditemukan.');
        }

        // Fetch participants with scores
        $participants = Participant::where('assessment_period_id', $period->id)
            ->with('scores.criterion')
            ->get();

        // Fetch criteria
        $criteria = Criterion::where('assessment_period_id', $period->id)
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get();

        // Fetch baseline BWM weights
        $baselineWeights = CriterionWeight::where('assessment_period_id', $period->id)
            ->with('criterion')
            ->get()
            ->mapWithKeys(fn($w) => [$w->criterion->code => (float) $w->weight_value])
            ->toArray();

        try {
            $analysisData = $this->sensitivityService->analyze(
                $participants,
                $criteria,
                $baselineWeights,
                $baselineResults->toArray()
            );
        } catch (InvalidArgumentException $e) {
            return redirect()->route('pipeline.index', $period)
                ->with('error', 'Gagal memproses analisis sensitivitas: ' . $e->getMessage());
        }

        $stepStatus = $this->pipelineService->getFullStatus($period);

        return Inertia::render('Pipeline/Sensitivity', [
            'period' => $period,
            'pipelineState' => [
                'currentStep' => $period->current_step,
                'status' => $period->pipeline_status,
                'statusLabel' => $period->pipeline_status_label,
                'meta' => $period->pipeline_meta,
                'stepStatus' => $stepStatus,
            ],
            'analysis' => $analysisData,
        ]);
    }
}
