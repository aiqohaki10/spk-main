<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\Participant;
use App\Models\Criterion;
use App\Models\CalculationRun;
use App\Models\CriterionWeight;
use App\Services\EDAS\EdasCalculationService;
use InvalidArgumentException;

class EdasStepController extends Controller
{
    /**
     * Process EDAS calculation using the period's participants, criteria, and BWM weights.
     */
    public function process(
        AssessmentPeriod $period,
        EdasCalculationService $edasService,
        \App\Services\Ranking\TieBreakingService $tieBreakingService
    ) {
        // Gather data
        $participants = Participant::where('assessment_period_id', $period->id)
            ->with('scores.criterion')
            ->orderBy('id')
            ->get();

        $criteria = Criterion::where('assessment_period_id', $period->id)
            ->orderBy('sort_order')
            ->get();

        $weights = CriterionWeight::where('assessment_period_id', $period->id)
            ->with('criterion')
            ->get()
            ->mapWithKeys(fn($w) => [$w->criterion->code => $w->weight_value])
            ->toArray();

        try {
            // 1. Kalkulasi EDAS murni (tanpa tie-breaking)
            $result = $edasService->calculateWithMatrices($participants, $criteria, $weights);
        } catch (InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        // Hapus run EDAS sebelumnya agar hasil selalu sinkron dan tidak tumpang tindih
        CalculationRun::where('assessment_period_id', $period->id)
            ->where('method_stage', 'EDAS')
            ->delete();

        $run = CalculationRun::create([
            'assessment_period_id' => $period->id,
            'run_code' => 'EDAS-' . $period->id . '-' . time(),
            'method_stage' => 'EDAS',
            'description' => 'EDAS calculation for ' . $period->name,
            'stage_payload' => $result,
            'executed_at' => now(),
        ]);

        // 2. Perangkingan akhir (Tahap Hasil Akhir) menggunakan metode Tie-Breaking bila ada nilai seri
        $finalRankings = $tieBreakingService->rankWithTieBreaking(
            $result['appraisal_scores'],
            $participants,
            $criteria,
            $weights
        );

        foreach ($finalRankings as $ranking) {
            \App\Models\CalculationResult::create([
                'calculation_run_id' => $run->id,
                'participant_id' => $ranking['participant_id'],
                'edas_score' => $ranking['score'],
                'final_rank' => $ranking['final_rank'],
                'extra_payload' => [
                    'code' => $ranking['code'] ?? null,
                    'edas_rank' => $ranking['rank'] ?? null,
                    'is_tied' => $ranking['is_tied'] ?? false,
                    'is_tie_broken' => $ranking['is_tie_broken'] ?? false,
                    'tie_break_info' => $ranking['tie_break_info'] ?? null,
                ],
            ]);
        }

        $period->markStepCompleted(4);

        return back()->with('success', 'Kalkulasi EDAS berhasil. Matriks PDA/NDA dan Peringkat tersedia untuk review.');
    }
}
