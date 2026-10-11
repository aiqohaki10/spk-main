<?php

namespace App\Services\BWM;

use Illuminate\Support\Collection;
use InvalidArgumentException;

class BwmWeightService
{
    private const CONSISTENCY_INDEX = [
        1 => 0.0000,
        2 => 0.4400,
        3 => 1.0000,
        4 => 1.6300,
        5 => 2.3000,
        6 => 3.0000,
        7 => 3.7300,
        8 => 4.4700,
        9 => 5.2300,
    ];

    private const STEP_SCHEDULE = [0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0001];

    /**
     * Deterministic BWM optimization using pattern search on the simplex.
     * The objective follows the linear BWM model:
     * min xi, subject to max(|w_B - a_Bj*w_j|, |w_j - a_jW*w_W|) <= xi.
     */
    public function calculateFromComparisons(
        Collection $criteria,
        int $bestCriterionId,
        int $worstCriterionId,
        array $bestToOthers,
        array $othersToWorst
    ): array {
        $criteria = $criteria->values();

        if ($criteria->count() < 2) {
            throw new InvalidArgumentException('Minimal dua kriteria diperlukan untuk menghitung bobot BWM.');
        }

        $criteriaById = $criteria->keyBy('id');

        if (!$criteriaById->has($bestCriterionId) || !$criteriaById->has($worstCriterionId)) {
            throw new InvalidArgumentException('Kriteria terbaik dan kriteria prioritas terendah harus berasal dari periode yang sama.');
        }

        if ($bestCriterionId === $worstCriterionId) {
            throw new InvalidArgumentException('Kriteria terbaik dan kriteria prioritas terendah harus berbeda.');
        }

        $criterionIds = $criteria->pluck('id')->map(fn($id) => (int) $id)->all();
        $normalizedBestToOthers = $this->normalizeVector(
            $criterionIds,
            $bestToOthers,
            $bestCriterionId,
            'Best-to-Others'
        );
        $normalizedOthersToWorst = $this->normalizeVector(
            $criterionIds,
            $othersToWorst,
            $worstCriterionId,
            'Others-to-Worst'
        );

        $initialWeights = $this->buildInitialWeights($criterionIds, $normalizedBestToOthers, $normalizedOthersToWorst);
        $weights = $this->optimizeWeights(
            $criterionIds,
            $bestCriterionId,
            $worstCriterionId,
            $normalizedBestToOthers,
            $normalizedOthersToWorst,
            $initialWeights
        );

        $xi = $this->calculateMaxDeviation(
            $criterionIds,
            $weights,
            $bestCriterionId,
            $worstCriterionId,
            $normalizedBestToOthers,
            $normalizedOthersToWorst
        );

        $aBw = (int) $normalizedBestToOthers[$worstCriterionId];
        $ci = self::CONSISTENCY_INDEX[$aBw] ?? 0.0;
        $consistencyRatio = $ci > 0 ? round($xi / $ci, 6) : 0.0;

        return [
            'best_criterion_id' => $bestCriterionId,
            'worst_criterion_id' => $worstCriterionId,
            'weights' => $this->roundWeights($weights),
            'xi' => round($xi, 6),
            'max_deviation' => round($xi, 6),
            'consistency_ratio' => $consistencyRatio,
            'consistency_status' => $consistencyRatio <= 0.1 ? 'konsisten' : 'tidak_konsisten',
            'details' => [
                'criteria_codes' => $criteria->pluck('code', 'id')->toArray(),
                'criteria_names' => $criteria->pluck('name', 'id')->toArray(),
                'best_to_others_input' => $normalizedBestToOthers,
                'others_to_worst_input' => $normalizedOthersToWorst,
                'optimization_method' => 'Deterministic simplex pattern search',
                'consistency_index_reference' => $ci,
            ],
        ];
    }

    private function normalizeVector(array $criterionIds, array $input, int $selfCriterionId, string $label): array
    {
        $normalized = [];

        foreach ($criterionIds as $criterionId) {
            if (!array_key_exists($criterionId, $input) && !array_key_exists((string) $criterionId, $input)) {
                throw new InvalidArgumentException("Input {$label} belum lengkap untuk seluruh kriteria.");
            }

            $value = $input[$criterionId] ?? $input[(string) $criterionId];

            if (!is_numeric($value)) {
                throw new InvalidArgumentException("Nilai {$label} untuk kriteria ID {$criterionId} harus berupa angka 1 sampai 9.");
            }

            $value = (int) $value;

            if ($value < 1 || $value > 9) {
                throw new InvalidArgumentException("Nilai {$label} untuk kriteria ID {$criterionId} harus berada pada rentang 1 sampai 9.");
            }

            $normalized[$criterionId] = $value;
        }

        if (($normalized[$selfCriterionId] ?? null) !== 1) {
            throw new InvalidArgumentException("Perbandingan kriteria terhadap dirinya sendiri pada {$label} wajib bernilai 1.");
        }

        return $normalized;
    }

    private function buildInitialWeights(array $criterionIds, array $bestToOthers, array $othersToWorst): array
    {
        $weights = [];

        foreach ($criterionIds as $criterionId) {
            $bestPreference = 1 / max((float) $bestToOthers[$criterionId], 0.0001);
            $worstPreference = max((float) $othersToWorst[$criterionId], 0.0001);
            $weights[$criterionId] = sqrt($bestPreference * $worstPreference);
        }

        return $this->normalizeWeights($weights);
    }

    private function optimizeWeights(
        array $criterionIds,
        int $bestCriterionId,
        int $worstCriterionId,
        array $bestToOthers,
        array $othersToWorst,
        array $initialWeights
    ): array {
        $current = $this->normalizeWeights($initialWeights);
        $currentObjective = $this->calculateMaxDeviation(
            $criterionIds,
            $current,
            $bestCriterionId,
            $worstCriterionId,
            $bestToOthers,
            $othersToWorst
        );

        foreach (self::STEP_SCHEDULE as $step) {
            $improved = true;

            while ($improved) {
                $improved = false;

                foreach ($criterionIds as $fromId) {
                    if ($current[$fromId] <= $step) {
                        continue;
                    }

                    foreach ($criterionIds as $toId) {
                        if ($fromId === $toId) {
                            continue;
                        }

                        $candidate = $current;
                        $candidate[$fromId] -= $step;
                        $candidate[$toId] += $step;
                        $candidate = $this->normalizeWeights($candidate);

                        $candidateObjective = $this->calculateMaxDeviation(
                            $criterionIds,
                            $candidate,
                            $bestCriterionId,
                            $worstCriterionId,
                            $bestToOthers,
                            $othersToWorst
                        );

                        if (
                            $candidateObjective + 1e-9 < $currentObjective ||
                            (
                                abs($candidateObjective - $currentObjective) <= 1e-9 &&
                                $this->isLexicographicallySmaller($criterionIds, $candidate, $current)
                            )
                        ) {
                            $current = $candidate;
                            $currentObjective = $candidateObjective;
                            $improved = true;
                        }
                    }
                }
            }
        }

        return $this->normalizeWeights($current);
    }

    private function calculateMaxDeviation(
        array $criterionIds,
        array $weights,
        int $bestCriterionId,
        int $worstCriterionId,
        array $bestToOthers,
        array $othersToWorst
    ): float {
        $wBest = $weights[$bestCriterionId];
        $wWorst = $weights[$worstCriterionId];
        $maxDeviation = 0.0;

        foreach ($criterionIds as $criterionId) {
            $wj = $weights[$criterionId];
            $deviationFromBest = abs($wBest - ($bestToOthers[$criterionId] * $wj));
            $deviationToWorst = abs($wj - ($othersToWorst[$criterionId] * $wWorst));
            $maxDeviation = max($maxDeviation, $deviationFromBest, $deviationToWorst);
        }

        return $maxDeviation;
    }

    private function normalizeWeights(array $weights): array
    {
        $sum = array_sum($weights);

        if ($sum <= 0) {
            throw new InvalidArgumentException('Bobot tidak dapat dinormalisasi karena total bernilai nol.');
        }

        foreach ($weights as $criterionId => $weight) {
            $weights[$criterionId] = max($weight / $sum, 0.000001);
        }

        $sum = array_sum($weights);

        foreach ($weights as $criterionId => $weight) {
            $weights[$criterionId] = $weight / $sum;
        }

        return $weights;
    }

    private function roundWeights(array $weights): array
    {
        $rounded = [];

        foreach ($weights as $criterionId => $weight) {
            $rounded[$criterionId] = round($weight, 6);
        }

        return $rounded;
    }

    private function isLexicographicallySmaller(array $criterionIds, array $candidate, array $current): bool
    {
        foreach ($criterionIds as $criterionId) {
            if (abs($candidate[$criterionId] - $current[$criterionId]) <= 1e-9) {
                continue;
            }

            return $candidate[$criterionId] < $current[$criterionId];
        }

        return false;
    }
}
