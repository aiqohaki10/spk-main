<?php

namespace App\Services\Ranking;

use Illuminate\Support\Collection;

class TieBreakingService
{
    /**
     * Map of criteria code to Participant model attributes for true raw values.
     */
    protected array $fieldMap = [
        'C1' => 'pre_test_score',
        'C2' => 'interview_grade',
        'C3' => 'report_score',
        'C4' => 'domicile_distance_km',
        'C5' => 'work_readiness_grade',
    ];

    /**
     * Rank EDAS appraisal scores into final rankings, resolving ties using criterion weights and participant raw scores.
     *
     * @param array $appraisalScores List of ['participant_id' => ..., 'participant_name' => ..., 'score' => ..., ...]
     * @param Collection $participants Collection of Participant models
     * @param Collection $criteria Collection of Criterion models
     * @param array $weights Criterion weights [code => weight_value]
     * @return array List of ranked items with 'final_rank', 'is_tied', 'is_tie_broken', 'tie_break_info'
     */
    public function rankWithTieBreaking(
        array $appraisalScores,
        Collection $participants,
        Collection $criteria,
        array $weights
    ): array {
        $participantModels = $participants->keyBy('id');
        $criteriaTypes = $criteria->pluck('attribute_type', 'code')->toArray();
        $criteriaNames = $criteria->pluck('name', 'code')->toArray();

        // Urutkan kriteria berdasarkan bobot tertinggi
        $orderedWeights = $weights;
        arsort($orderedWeights);
        $orderedCriteria = array_keys($orderedWeights);

        // Salin appraisal scores untuk perangkingan akhir
        $rankedList = $appraisalScores;

        // Cek apakah ada skor EDAS yang seri (tie)
        $scoreCounts = [];
        foreach ($rankedList as $row) {
            $s = sprintf('%.6f', (float) $row['score']);
            $scoreCounts[$s] = ($scoreCounts[$s] ?? 0) + 1;
        }

        // Lakukan pengurutan dengan tie-breaking
        usort($rankedList, function (array $left, array $right) use ($participantModels, $orderedCriteria, $criteriaTypes) {
            $scoreComparison = $right['score'] <=> $left['score'];
            if ($scoreComparison !== 0) {
                return $scoreComparison;
            }

            // Nilai EDAS seri -> terapkan Tie-Breaking berdasarkan bobot kriteria tertinggi
            $leftModel = $participantModels[$left['participant_id']] ?? null;
            $rightModel = $participantModels[$right['participant_id']] ?? null;

            if ($leftModel && $rightModel) {
                foreach ($orderedCriteria as $code) {
                    $field = $this->fieldMap[$code] ?? null;
                    if ($field) {
                        $leftVal = (float) ($leftModel->{$field} ?? 0);
                        $rightVal = (float) ($rightModel->{$field} ?? 0);

                        if ($leftVal != $rightVal) {
                            $isBenefit = ($criteriaTypes[$code] ?? 'benefit') === 'benefit';
                            return $isBenefit ? ($rightVal <=> $leftVal) : ($leftVal <=> $rightVal);
                        }
                    }
                }
            }

            return strcmp($left['participant_name'], $right['participant_name']);
        });

        // Tetapkan final_rank dan identifikasi tie-breaking detail
        $finalRankings = [];
        $rank = 1;

        foreach ($rankedList as $row) {
            $scoreKey = sprintf('%.6f', (float) $row['score']);
            $isTied = ($scoreCounts[$scoreKey] ?? 0) > 1;
            $isTieBroken = false;
            $tieBreakInfo = null;

            if ($isTied) {
                $currModel = $participantModels[$row['participant_id']] ?? null;
                if ($currModel) {
                    foreach ($orderedCriteria as $code) {
                        $field = $this->fieldMap[$code] ?? null;
                        if ($field) {
                            $cName = $criteriaNames[$code] ?? $code;
                            $val = (float) ($currModel->{$field} ?? 0);
                            $tieBreakInfo = "Kriteria {$code} ({$cName}): {$val}";
                            $isTieBroken = true;
                            break;
                        }
                    }
                }
            }

            $row['final_rank'] = $rank++;
            $row['edas_score'] = $row['score'];
            $row['is_tied'] = $isTied;
            $row['is_tie_broken'] = $isTieBroken;
            $row['tie_break_info'] = $tieBreakInfo;

            $finalRankings[] = $row;
        }

        return $finalRankings;
    }
}
