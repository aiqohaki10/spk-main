<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\CalculationRun;
use App\Models\CalculationResult;
use App\Services\Copeland\CopelandScoreService;
use InvalidArgumentException;

class CopelandStepController extends Controller
{
    /**
     * Process Copeland scoring from the EDAS appraisal scores.
     */
    public function process(AssessmentPeriod $period, CopelandScoreService $copelandService)
    {
        // Get the latest EDAS run for this period
        $edasRun = CalculationRun::where('assessment_period_id', $period->id)
            ->where('method_stage', 'EDAS')
            ->latest()
            ->first();

        if (!$edasRun || empty($edasRun->stage_payload['appraisal_scores'])) {
            return back()->with('error', 'Data EDAS tidak ditemukan. Jalankan kalkulasi EDAS terlebih dahulu.');
        }

        $edasPayload = $edasRun->stage_payload;
        $edasScores = $edasPayload['appraisal_scores'];
        $weights = $edasPayload['weights_used'] ?? [];
        
        $criteriaTypes = \App\Models\Criterion::where('assessment_period_id', $period->id)
            ->pluck('attribute_type', 'code')
            ->toArray();

        // Fetch true raw values for tie-breaker instead of classified 1-5 scores
        $participants = \App\Models\Participant::where('assessment_period_id', $period->id)->get();
        $rawDecisionMatrix = [];
        $fieldMap = [
            'C1' => 'pre_test_score',
            'C2' => 'interview_grade',
            'C3' => 'report_score',
            'C4' => 'domicile_distance_km',
            'C5' => 'work_readiness_grade',
        ];

        foreach ($participants as $participant) {
            foreach ($fieldMap as $code => $field) {
                $rawDecisionMatrix[$participant->id][$code] = (float) $participant->{$field};
            }
        }

        try {
            $result = $copelandService->rankWithPairwise($edasScores, $rawDecisionMatrix, $weights, $criteriaTypes);
        } catch (InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $run = CalculationRun::create([
            'assessment_period_id' => $period->id,
            'run_code' => 'CPL-' . $period->id . '-' . time(),
            'method_stage' => 'COPELAND',
            'description' => 'Copeland scoring for ' . $period->name,
            'stage_payload' => $result,
            'executed_at' => now(),
        ]);

        foreach ($result['rankings'] as $ranking) {
            CalculationResult::create([
                'calculation_run_id' => $run->id,
                'participant_id' => $ranking['participant_id'],
                'edas_score' => $ranking['edas_score'],
                'copeland_score' => $ranking['copeland_score'],
                'copeland_wins' => $ranking['wins'],
                'copeland_losses' => $ranking['losses'],
                'extra_payload' => [
                    'ties' => $ranking['ties'],
                ],
                'final_rank' => $ranking['final_rank'],
            ]);
        }

        $period->markStepCompleted(5);

        return back()->with('success', 'Pemeringkatan Copeland selesai dihitung. Hasil akhir sudah tersedia.');
    }
}
