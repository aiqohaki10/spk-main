<?php

namespace App\Services\Sensitivity;

use App\Services\EDAS\EdasCalculationService;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class SensitivityAnalysisService
{
    public function __construct(
        protected EdasCalculationService $edasService,
        protected \App\Services\Ranking\TieBreakingService $tieBreakingService
    ) {}

    /**
     * Run full sensitivity analysis for the given period data.
     */
    public function analyze(
        Collection $participants,
        Collection $criteria,
        array $baselineWeights,
        array $baselineRankings
    ): array {
        if ($participants->count() < 2) {
            throw new InvalidArgumentException('Minimal 2 peserta diperlukan untuk analisis sensitivitas.');
        }

        if ($criteria->count() < 2) {
            throw new InvalidArgumentException('Minimal 2 kriteria diperlukan untuk analisis sensitivitas.');
        }

        if (empty($baselineWeights) || empty($baselineRankings)) {
            throw new InvalidArgumentException('Data bobot acuan (baseline) dan hasil peringkat awal belum lengkap.');
        }

        // Normalize baseline rankings map [participant_id => ['rank' => X, 'name' => Y]]
        $baselineRankMap = [];
        $baselineTop1Id = null;

        foreach ($baselineRankings as $rankRow) {
            $pId = (int) ($rankRow['participant_id'] ?? $rankRow['participant']?->id ?? 0);
            $rank = (int) ($rankRow['final_rank'] ?? 0);
            $name = (string) ($rankRow['participant_name'] ?? $rankRow['participant']?->full_name ?? "Peserta {$pId}");

            $baselineRankMap[$pId] = [
                'participant_id' => $pId,
                'participant_name' => $name,
                'rank' => $rank,
                'copeland_score' => $rankRow['copeland_score'] ?? 0,
                'edas_score' => $rankRow['edas_score'] ?? 0,
            ];

            if ($rank === 1 && $baselineTop1Id === null) {
                $baselineTop1Id = $pId;
            }
        }

        // Generate scenarios
        $criteriaTypes = $criteria->pluck('attribute_type', 'code')->toArray();
        $scenarios = $this->generateScenarios($criteria, $baselineWeights);

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

        $scenarioResults = [];
        $spearmanValues = [];
        $stableCount = 0;
        $top1StableCount = 0;

        $scenarioIndex = 1;

        foreach ($scenarios as $scenario) {
            $scenarioWeights = $scenario['weights'];

            // Run EDAS with modified weights
            $edasResult = $this->edasService->calculateWithMatrices($participants, $criteria, $scenarioWeights);

            // Perangkingan akhir skenario menggunakan TieBreakingService bila ada nilai seri
            $newRankings = $this->tieBreakingService->rankWithTieBreaking(
                $edasResult['appraisal_scores'],
                $participants,
                $criteria,
                $scenarioWeights
            );

            // Map new ranks
            $scenarioRankMap = [];
            $scenarioTop1Id = null;
            $top3Participants = [];

            foreach ($newRankings as $row) {
                $pId = (int) $row['participant_id'];
                $rank = (int) $row['final_rank'];

                $scenarioRankMap[$pId] = [
                    'participant_id' => $pId,
                    'participant_name' => $row['participant_name'],
                    'scenario_rank' => $rank,
                    'baseline_rank' => $baselineRankMap[$pId]['rank'] ?? $rank,
                    'diff' => ($baselineRankMap[$pId]['rank'] ?? $rank) - $rank,
                    'copeland_score' => $row['copeland_score'],
                    'edas_score' => $row['edas_score'],
                ];

                if ($rank === 1 && $scenarioTop1Id === null) {
                    $scenarioTop1Id = $pId;
                }

                if ($rank <= 3) {
                    $top3Participants[] = [
                        'rank' => $rank,
                        'name' => $row['participant_name'],
                        'participant_id' => $pId,
                    ];
                }
            }

            // Calculate Spearman Rank Correlation
            $spearman = $this->calculateSpearmanCorrelation($baselineRankMap, $scenarioRankMap);
            $spearmanValues[] = $spearman;

            // Determine status
            $isTop1Stable = ($baselineTop1Id === $scenarioTop1Id);
            if ($isTop1Stable) {
                $top1StableCount++;
            }

            // Status: "Tetap" jika korelasi Spearman >= 0.90 dan Top 1 stabil, jika tidak "Berubah"
            $isStable = ($spearman >= 0.90 && $isTop1Stable);
            if ($isStable) {
                $stableCount++;
            }

            $statusLabel = $isStable ? 'Tetap' : 'Berubah';

            $scenarioResults[] = [
                'id' => $scenarioIndex,
                'code' => sprintf('SC-%02d', $scenarioIndex),
                'type' => $scenario['type'],
                'type_label' => $scenario['type_label'],
                'name' => $scenario['name'],
                'description' => $scenario['description'],
                'weights' => $scenarioWeights,
                'spearman_correlation' => round($spearman, 4),
                'status' => $statusLabel,
                'is_stable' => $isStable,
                'is_top1_stable' => $isTop1Stable,
                'top1_name' => $scenarioRankMap[$scenarioTop1Id]['participant_name'] ?? '-',
                'top3_participants' => $top3Participants,
                'rankings_comparison' => array_values($scenarioRankMap),
            ];

            $scenarioIndex++;
        }

        $totalScenarios = count($scenarioResults);
        $avgSpearman = $totalScenarios > 0 ? round(array_sum($spearmanValues) / $totalScenarios, 4) : 0.0;
        $stabilityPercentage = $totalScenarios > 0 ? round(($stableCount / $totalScenarios) * 100, 1) : 0.0;
        $top1StabilityPercentage = $totalScenarios > 0 ? round(($top1StableCount / $totalScenarios) * 100, 1) : 0.0;

        // Stability narrative conclusion
        if ($stabilityPercentage >= 80 && $top1StabilityPercentage >= 90) {
            $conclusionCategory = 'Sangat Stabil & Resisten';
            $conclusionText = "Hasil perankingan menunjukkan tingkat kestabilan yang sangat tinggi ({$stabilityPercentage}% skenario konsisten). Peringkat 1 (Top 1) tetap kokoh pada {$top1StabilityPercentage}% skenario pengujian dengan rata-rata korelasi Spearman sebesar {$avgSpearman}.";
        } elseif ($stabilityPercentage >= 60 || $top1StabilityPercentage >= 75) {
            $conclusionCategory = 'Cukup Stabil';
            $conclusionText = "Hasil perankingan cukup stabil ({$stabilityPercentage}% skenario konsisten). Peringkat 1 bertahan pada {$top1StabilityPercentage}% skenario dengan rata-rata korelasi Spearman {$avgSpearman}.";
        } else {
            $conclusionCategory = 'Sensitif terhadap Perubahan Bobot';
            $conclusionText = "Hasil perankingan tergolong sensitif terhadap fluktuasi bobot kriteria ({$stabilityPercentage}% skenario konsisten, rata-rata korelasi Spearman {$avgSpearman}). Disarankan meninjau ulang matriks preferensi BWM bila diperlukan.";
        }

        return [
            'baseline' => [
                'weights' => $baselineWeights,
                'top1_participant' => $baselineRankMap[$baselineTop1Id] ?? null,
                'total_participants' => count($baselineRankMap),
                'criteria' => $criteria->map(fn($c) => ['id' => $c->id, 'code' => $c->code, 'name' => $c->name]),
            ],
            'scenarios' => $scenarioResults,
            'summary' => [
                'total_scenarios' => $totalScenarios,
                'stable_scenarios_count' => $stableCount,
                'changed_scenarios_count' => $totalScenarios - $stableCount,
                'stability_percentage' => $stabilityPercentage,
                'top1_stable_count' => $top1StableCount,
                'top1_stability_percentage' => $top1StabilityPercentage,
                'average_spearman' => $avgSpearman,
                'conclusion_category' => $conclusionCategory,
                'conclusion_text' => $conclusionText,
            ],
        ];
    }

    /**
     * Generate all sensitivity testing scenarios.
     */
    protected function generateScenarios(Collection $criteria, array $baselineWeights): array
    {
        $scenarios = [];
        $criteriaList = $criteria->values();
        $count = $criteriaList->count();

        // 1. SCENARIO GROUP A: Pairwise Weight Swaps (Tukar Bobot antar Kriteria)
        for ($i = 0; $i < $count; $i++) {
            for ($j = $i + 1; $j < $count; $j++) {
                $cI = $criteriaList[$i];
                $cJ = $criteriaList[$j];
                $codeI = $cI->code;
                $codeJ = $cJ->code;

                $wI = (float) ($baselineWeights[$codeI] ?? 0);
                $wJ = (float) ($baselineWeights[$codeJ] ?? 0);

                // If identical weights, swapping produces same result, but we still test or note it
                $modifiedWeights = $baselineWeights;
                $modifiedWeights[$codeI] = $wJ;
                $modifiedWeights[$codeJ] = $wI;

                $scenarios[] = [
                    'type' => 'swap',
                    'type_label' => 'Tukar Bobot',
                    'name' => "Tukar Bobot {$codeI} ↔ {$codeJ}",
                    'description' => "Menukar nilai bobot antara {$cI->name} ({$codeI}: " . round($wI, 4) . ") dan {$cJ->name} ({$codeJ}: " . round($wJ, 4) . ").",
                    'weights' => $this->roundWeights($modifiedWeights),
                ];
            }
        }

        // Identify Top Criterion (Highest Weight) and Lowest Criterion (Lowest Weight)
        $topCode = null;
        $topWeight = -1.0;
        $lowestCode = null;
        $lowestWeight = 999.0;

        foreach ($criteriaList as $c) {
            $w = (float) ($baselineWeights[$c->code] ?? 0);
            if ($w > $topWeight) {
                $topWeight = $w;
                $topCode = $c->code;
            }
            if ($w < $lowestWeight) {
                $lowestWeight = $w;
                $lowestCode = $c->code;
            }
        }

        $topCriterion = $criteriaList->firstWhere('code', $topCode);
        $lowestCriterion = $criteriaList->firstWhere('code', $lowestCode);

        // 2. SCENARIO GROUP B: Kenaikan Bobot Kriteria Terpenting (+10%, +20%, +30%)
        if ($topCode && $topCriterion) {
            $percentages = [10, 20, 30];
            foreach ($percentages as $pct) {
                $delta = $topWeight * ($pct / 100);
                $newTopWeight = min(0.95, $topWeight + $delta);

                $remainingTarget = 1.0 - $newTopWeight;
                $originalOtherSum = 1.0 - $topWeight;

                $modifiedWeights = [];
                foreach ($criteriaList as $c) {
                    if ($c->code === $topCode) {
                        $modifiedWeights[$c->code] = $newTopWeight;
                    } else {
                        $origW = (float) ($baselineWeights[$c->code] ?? 0);
                        $ratio = $originalOtherSum > 0 ? ($origW / $originalOtherSum) : (1 / ($count - 1));
                        $modifiedWeights[$c->code] = $ratio * $remainingTarget;
                    }
                }

                $scenarios[] = [
                    'type' => 'increase_top',
                    'type_label' => 'Kenaikan Bobot Utama',
                    'name' => "Kenaikan Bobot {$topCode} (+{$pct}%)",
                    'description' => "Menaikkan bobot kriteria terpenting {$topCriterion->name} ({$topCode}) sebesar {$pct}% (menjadi " . round($newTopWeight, 4) . ") dengan normalisasi kriteria lainnya.",
                    'weights' => $this->roundWeights($modifiedWeights),
                ];
            }
        }

        // 3. SCENARIO GROUP C: Penurunan Bobot Kriteria Terendah (-20%, -40%, -60%)
        if ($lowestCode && $lowestCriterion) {
            $percentages = [20, 40, 60];
            foreach ($percentages as $pct) {
                $delta = $lowestWeight * ($pct / 100);
                $newLowestWeight = max(0.01, $lowestWeight - $delta);

                $remainingTarget = 1.0 - $newLowestWeight;
                $originalOtherSum = 1.0 - $lowestWeight;

                $modifiedWeights = [];
                foreach ($criteriaList as $c) {
                    if ($c->code === $lowestCode) {
                        $modifiedWeights[$c->code] = $newLowestWeight;
                    } else {
                        $origW = (float) ($baselineWeights[$c->code] ?? 0);
                        $ratio = $originalOtherSum > 0 ? ($origW / $originalOtherSum) : (1 / ($count - 1));
                        $modifiedWeights[$c->code] = $ratio * $remainingTarget;
                    }
                }

                $scenarios[] = [
                    'type' => 'decrease_lowest',
                    'type_label' => 'Penurunan Bobot Terendah',
                    'name' => "Penurunan Bobot {$lowestCode} (-{$pct}%)",
                    'description' => "Menurunkan bobot kriteria terendah {$lowestCriterion->name} ({$lowestCode}) sebesar {$pct}% (menjadi " . round($newLowestWeight, 4) . ") dengan normalisasi kriteria lainnya.",
                    'weights' => $this->roundWeights($modifiedWeights),
                ];
            }
        }

        // 4. SCENARIO GROUP D: Pembobotan Setara (Equal Weights - Uji Ekstrem)
        $equalWeight = 1.0 / $count;
        $equalWeights = [];
        foreach ($criteriaList as $c) {
            $equalWeights[$c->code] = $equalWeight;
        }

        $scenarios[] = [
            'type' => 'equal',
            'type_label' => 'Pembobotan Rata',
            'name' => 'Bobot Sama Rata (Equal Weights)',
            'description' => 'Menguji jika seluruh kriteria diberi bobot yang sama persis (' . round($equalWeight, 4) . ').',
            'weights' => $this->roundWeights($equalWeights),
        ];

        return $scenarios;
    }

    /**
     * Helper to round and normalize weights array.
     */
    protected function roundWeights(array $weights): array
    {
        $sum = array_sum($weights);
        $normalized = [];
        foreach ($weights as $code => $val) {
            $normalized[$code] = $sum > 0 ? round($val / $sum, 6) : round(1 / count($weights), 6);
        }
        return $normalized;
    }

    /**
     * Calculate Spearman Rank Correlation Coefficient.
     * rs = 1 - (6 * sum(di^2)) / (n * (n^2 - 1))
     */
    public function calculateSpearmanCorrelation(array $baselineRankMap, array $scenarioRankMap): float
    {
        $n = count($baselineRankMap);
        if ($n < 2) {
            return 1.0;
        }

        $sumD2 = 0.0;
        foreach ($baselineRankMap as $pId => $baseData) {
            $rank1 = (float) ($baseData['rank'] ?? 0);
            $rank2 = (float) ($scenarioRankMap[$pId]['scenario_rank'] ?? $rank1);
            $d = $rank1 - $rank2;
            $sumD2 += ($d * $d);
        }

        $denominator = $n * ($n * $n - 1);
        if ($denominator == 0) {
            return 1.0;
        }

        $rs = 1.0 - ((6.0 * $sumD2) / $denominator);

        // Clamp between -1.0 and 1.0
        return max(-1.0, min(1.0, $rs));
    }
}
