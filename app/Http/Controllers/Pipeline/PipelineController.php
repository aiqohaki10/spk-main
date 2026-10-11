<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\Criterion;
use App\Models\Participant;
use App\Models\CalculationRun;
use App\Models\CriterionWeight;
use App\Services\PipelineStateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PipelineController extends Controller
{
    public function __construct(
        private PipelineStateService $pipelineService
    ) {}

    /**
     * Main pipeline view — renders the wizard shell.
     * The React component handles step navigation internally.
     */
    public function index(AssessmentPeriod $period)
    {
        // Set as active period in session
        session(['active_period_id' => $period->id]);

        // Gather criteria with relationships
        $criteria = Criterion::where('assessment_period_id', $period->id)
            ->with(['subscales', 'weights' => fn($q) => $q->where('assessment_period_id', $period->id)])
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get();

        // Gather participants with scores
        $participants = Participant::where('assessment_period_id', $period->id)
            ->with('scores.criterion')
            ->orderBy('id')
            ->get();

        // Gather calculation runs
        $bwmRun = CalculationRun::where('assessment_period_id', $period->id)
            ->where('method_stage', 'BWM')->latest()->first();
        $edasRun = CalculationRun::where('assessment_period_id', $period->id)
            ->where('method_stage', 'EDAS')->latest()->first();

        // Build comprehensive step validation status
        $stepStatus = $this->pipelineService->getFullStatus($period);

        // BWM comparison if exists
        $bwmComparison = $period->bwmComparison;

        return Inertia::render('Pipeline/Index', [
            'period' => $period,
            'pipelineState' => [
                'currentStep' => $period->current_step,
                'status' => $period->pipeline_status,
                'statusLabel' => $period->pipeline_status_label,
                'meta' => $period->pipeline_meta,
                'stepStatus' => $stepStatus,
            ],
            'stepData' => [
                'setup' => [
                    'criteria' => $criteria,
                    'criteriaCount' => $criteria->count(),
                ],
                'scoring' => [
                    'participants' => $participants,
                    'participantCount' => $participants->count(),
                    'criteriaForScoring' => $criteria->map(fn($c) => [
                        'id' => $c->id,
                        'code' => $c->code,
                        'name' => $c->name,
                        'input_type' => $c->input_type,
                        'attribute_type' => $c->attribute_type,
                        'subscales' => $c->subscales,
                    ]),
                ],
                'bwm' => [
                    'comparison' => $bwmComparison,
                    'runPayload' => $bwmRun?->stage_payload,
                    'weights' => CriterionWeight::where('assessment_period_id', $period->id)
                        ->with('criterion')
                        ->get(),
                ],
                'edas' => [
                    'runPayload' => $edasRun?->stage_payload,
                ],
                'tieBreaking' => [
                    'weights' => CriterionWeight::where('assessment_period_id', $period->id)
                        ->with('criterion')
                        ->get()
                        ->mapWithKeys(fn($w) => [$w->criterion->code => $w->weight_value])
                        ->toArray(),
                    'criteriaNames' => $criteria->pluck('name', 'code')->toArray(),
                ],
            ],
            'completedRuns' => [
                'bwm' => $bwmRun,
                'edas' => $edasRun,
            ],
            'finalResults' => $edasRun
                ? $edasRun->results()->with('participant')->orderBy('final_rank')->get()
                : [],
        ]);
    }

    /**
     * Rewind the pipeline to a previous step, invalidating downstream data.
     */
    public function rewind(Request $request, AssessmentPeriod $period)
    {
        $validated = $request->validate([
            'step' => 'required|integer|min:1|max:5',
        ]);

        $targetStep = $validated['step'];

        if ($targetStep >= $period->current_step) {
            return back()->with('error', 'Tidak dapat rewind ke tahap yang sama atau lebih tinggi.');
        }

        $period->rewindToStep($targetStep);

        $stepLabels = [
            1 => 'Konfigurasi',
            2 => 'Input Nilai',
            3 => 'Pembobotan BWM',
            4 => 'EDAS',
            5 => 'Tie Breaking',
        ];

        return back()->with('success', "Pipeline direset ke tahap \"{$stepLabels[$targetStep]}\". Data perhitungan setelah tahap ini telah dihapus.");
    }
}
