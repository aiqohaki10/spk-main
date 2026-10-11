<?php

namespace App\Services\Participants;

use App\Models\AssessmentPeriod;
use App\Models\Criterion;
use App\Models\Participant;
use App\Models\ParticipantScore;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ParticipantScoreSyncService
{
    /**
     * Field mapping for the fixed five core criteria.
     */
    private const FIELD_MAP = [
        'C1' => 'pre_test_score',
        'C2' => 'interview_grade',
        'C3' => 'report_score',
        'C4' => 'domicile_distance_km',
        'C5' => 'work_readiness_grade',
    ];

    /**
     * Criteria codes that receive raw numeric input and need classification.
     * These are categorical in definition but accept raw values (0-100, km)
     * which get auto-classified to 1-5 scores.
     */
    private const CLASSIFIABLE_CRITERIA = ['C1', 'C3', 'C4'];

    public function syncParticipant(Participant $participant, ?Collection $criteria = null): int
    {
        $criteria ??= Criterion::where('assessment_period_id', $participant->assessment_period_id)
            ->with('subscales')
            ->orderBy('sort_order')
            ->get();

        $count = 0;

        foreach ($criteria as $criterion) {
            $field = self::FIELD_MAP[$criterion->code] ?? null;

            if (!$field) {
                continue;
            }

            $rawValue = $this->resolveCriterionValue($criterion, $participant->{$field});

            ParticipantScore::updateOrCreate(
                [
                    'participant_id' => $participant->id,
                    'criterion_id' => $criterion->id,
                ],
                [
                    'raw_value' => $rawValue,
                ]
            );

            $count++;
        }

        return $count;
    }

    public function syncPeriod(AssessmentPeriod $period): int
    {
        $criteria = Criterion::where('assessment_period_id', $period->id)
            ->with('subscales')
            ->orderBy('sort_order')
            ->get();

        $participants = $period->participants()->get();
        $count = 0;

        foreach ($participants as $participant) {
            $count += $this->syncParticipant($participant, $criteria);
        }

        return $count;
    }

    public function resolveCriterionValue(Criterion $criterion, mixed $value): float
    {
        // C1, C3, C4 receive raw numeric values that need auto-classification
        if (in_array($criterion->code, self::CLASSIFIABLE_CRITERIA, true)) {
            return $this->classifyScore($criterion->code, (float) $value);
        }

        // C2, C5 receive numeric scores (1-5) directly
        if ($criterion->input_type === 'categorical') {
            return $this->resolveCategoricalValue($criterion, $value);
        }

        return (float) $value;
    }

    /**
     * Classify raw numeric values into 1-5 scores.
     *
     * C1 & C3 (Pre-Test & Rapor): 86-100→5, 71-85→4, 56-70→3, 41-55→2, <40→1
     * C4 (Jarak Domisili/BENEFIT pasca konversi): 0-5km→5, >5-10→4, >10-20→3, >20-40→2, >40→1
     */
    private function classifyScore(string $criterionCode, float $value): float
    {
        return match ($criterionCode) {
            'C1', 'C3' => match (true) {
                $value >= 86 => 5,
                $value >= 71 => 4,
                $value >= 56 => 3,
                $value >= 41 => 2,
                default      => 1,
            },
            'C4' => match (true) {
                $value <= 5  => 5,
                $value <= 10 => 4,
                $value <= 20 => 3,
                $value <= 40 => 2,
                default      => 1,
            },
            default => $value,
        };
    }

    /**
     * Resolve a categorical value — accepts either a numeric score (1-5)
     * or a text label matching a subscale.
     */
    public function resolveCategoricalValue(Criterion $criterion, mixed $value): float
    {
        // If value is numeric, match by numeric_value in subscales
        if (is_numeric($value)) {
            $numericInput = (float) $value;
            $criterion->loadMissing('subscales');

            foreach ($criterion->subscales as $subscale) {
                if ((float) $subscale->numeric_value === $numericInput) {
                    return $numericInput;
                }
            }

            // Allow if within valid subscale range
            if ($criterion->subscales->isNotEmpty()) {
                $minVal = $criterion->subscales->min('numeric_value');
                $maxVal = $criterion->subscales->max('numeric_value');
                if ($numericInput >= $minVal && $numericInput <= $maxVal) {
                    return $numericInput;
                }
            }

            $allowedValues = $criterion->subscales->pluck('numeric_value')->implode(', ');
            throw new InvalidArgumentException(
                "Skor \"{$value}\" tidak valid untuk {$criterion->name}. Gunakan salah satu dari: {$allowedValues}."
            );
        }

        // Otherwise match by label text
        $normalizedInput = $this->normalizeLabel($value);

        if ($normalizedInput === '') {
            throw new InvalidArgumentException("Nilai untuk kriteria {$criterion->name} belum diisi.");
        }

        $criterion->loadMissing('subscales');

        foreach ($criterion->subscales as $subscale) {
            if ($this->normalizeLabel($subscale->label) === $normalizedInput) {
                return (float) $subscale->numeric_value;
            }
        }

        $allowedLabels = $criterion->subscales
            ->pluck('label')
            ->filter()
            ->values()
            ->implode(', ');

        throw new InvalidArgumentException(
            "Label \"{$value}\" tidak cocok dengan subskala {$criterion->name}. Gunakan salah satu dari: {$allowedLabels}."
        );
    }

    public function normalizeLabel(mixed $value): string
    {
        return Str::of((string) $value)
            ->squish()
            ->lower()
            ->value();
    }
}
