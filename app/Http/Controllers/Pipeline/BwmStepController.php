<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\BwmComparison;
use App\Models\CalculationRun;
use App\Models\CriterionWeight;
use App\Models\Criterion;
use App\Services\BWM\BwmWeightService;
use Illuminate\Http\Request;
use InvalidArgumentException;

class BwmStepController extends Controller
{
    /**
     * Process BWM weight calculation from user-provided comparison data.
     */
    public function process(Request $request, AssessmentPeriod $period, BwmWeightService $bwmService)
    {
        $validated = $request->validate([
            'best_criterion_id' => 'required|exists:criteria,id',
            'worst_criterion_id' => 'required|exists:criteria,id|different:best_criterion_id',
            'best_to_others' => 'required|array',
            'others_to_worst' => 'required|array',
        ]);

        $criteria = Criterion::where('assessment_period_id', $period->id)
            ->orderBy('sort_order')
            ->get();

        if (!$criteria->contains('id', (int) $validated['best_criterion_id']) || !$criteria->contains('id', (int) $validated['worst_criterion_id'])) {
            return back()->with('error', 'Kriteria terbaik dan kriteria prioritas terendah harus berasal dari periode aktif.');
        }

        $bestToOthers = $validated['best_to_others'];
        $othersToWorst = $validated['others_to_worst'];

        // Force self-comparison to 1 as per business logic
        $bestToOthers[$validated['best_criterion_id']] = 1;
        $othersToWorst[$validated['worst_criterion_id']] = 1;

        try {
            $result = $bwmService->calculateFromComparisons(
                $criteria,
                (int) $validated['best_criterion_id'],
                (int) $validated['worst_criterion_id'],
                $bestToOthers,
                $othersToWorst
            );
        } catch (InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        BwmComparison::updateOrCreate(
            ['assessment_period_id' => $period->id],
            [
                'best_criterion_id' => $result['best_criterion_id'],
                'worst_criterion_id' => $result['worst_criterion_id'],
                'best_to_others' => $result['details']['best_to_others_input'],
                'others_to_worst' => $result['details']['others_to_worst_input'],
                'consistency_index' => $result['xi'],
            ]
        );

        foreach ($result['weights'] as $criterionId => $weight) {
            CriterionWeight::updateOrCreate(
                [
                    'criterion_id' => $criterionId,
                    'assessment_period_id' => $period->id,
                ],
                [
                    'weight_value' => $weight,
                    'source_method' => 'BWM',
                    'consistency_ratio' => $result['consistency_ratio'] ?? null,
                ]
            );
        }

        CalculationRun::create([
            'assessment_period_id' => $period->id,
            'run_code' => 'BWM-' . $period->id . '-' . time(),
            'method_stage' => 'BWM',
            'description' => 'BWM weight calculation for ' . $period->name,
            'stage_payload' => $result,
            'executed_at' => now(),
        ]);

        $period->markStepCompleted(3);

        return back()->with('success', 'Pembobotan BWM berhasil dihitung. Lanjut ke kalkulasi EDAS.');
    }
}
