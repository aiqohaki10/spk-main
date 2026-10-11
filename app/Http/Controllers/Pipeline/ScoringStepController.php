<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\Participant;
use App\Models\ParticipantScore;
use App\Models\Criterion;
use App\Services\Participants\ParticipantScoreSyncService;
use Illuminate\Http\Request;

class ScoringStepController extends Controller
{
    /**
     * Save participant scores in bulk (from the scoring matrix).
     */
    public function saveScores(Request $request, AssessmentPeriod $period)
    {
        $validated = $request->validate([
            'scores' => 'required|array',
            'scores.*.participant_id' => 'required|exists:participants,id',
            'scores.*.criterion_id' => 'required|exists:criteria,id',
            'scores.*.raw_value' => 'required|numeric',
        ]);

        $participantIds = Participant::where('assessment_period_id', $period->id)->pluck('id');
        $criterionIds = Criterion::where('assessment_period_id', $period->id)->pluck('id');

        foreach ($validated['scores'] as $score) {
            if (!$participantIds->contains($score['participant_id']) || !$criterionIds->contains($score['criterion_id'])) {
                return back()->with('error', 'Terdapat skor yang tidak sesuai dengan periode aktif.');
            }

            ParticipantScore::updateOrCreate(
                [
                    'participant_id' => $score['participant_id'],
                    'criterion_id' => $score['criterion_id'],
                ],
                [
                    'raw_value' => $score['raw_value'],
                ]
            );
        }

        return back()->with('success', 'Skor peserta berhasil disimpan.');
    }

    /**
     * Auto-populate scores from participant columns to the scoring matrix.
     * Maps the fixed participant fields (pre_test_score, etc.) to their criteria.
     */
    public function autoPopulate(AssessmentPeriod $period, ParticipantScoreSyncService $scoreSyncService)
    {
        $count = $scoreSyncService->syncPeriod($period);

        return back()->with('success', "{$count} skor berhasil dimuat secara otomatis dari data peserta.");
    }

    /**
     * Mark Step 2 (Scoring) as complete and advance pipeline.
     */
    public function complete(AssessmentPeriod $period)
    {
        $criteriaCount = Criterion::where('assessment_period_id', $period->id)->count();
        $participantCount = Participant::where('assessment_period_id', $period->id)->count();

        if ($participantCount < 3) {
            return back()->with('error', 'Minimal 3 peserta diperlukan untuk melanjutkan.');
        }

        // Check all participants have complete scores
        $incomplete = Participant::where('assessment_period_id', $period->id)
            ->where(function ($query) use ($criteriaCount) {
                $query->whereHas('scores', operator: '<', count: $criteriaCount)
                    ->orWhereHas('scores', fn($q) => $q->whereNull('raw_value'));
            })
            ->count();

        if ($incomplete > 0) {
            return back()->with('error', "{$incomplete} peserta masih memiliki skor yang belum lengkap.");
        }

        $period->markStepCompleted(2);

        return back()->with('success', 'Input nilai selesai. Lanjut ke pembobotan BWM.');
    }
}
