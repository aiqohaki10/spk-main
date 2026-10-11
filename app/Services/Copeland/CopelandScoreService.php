<?php

namespace App\Services\Copeland;

use InvalidArgumentException;

class CopelandScoreService
{
    /**
     * Copeland ranking using pairwise comparison on EDAS appraisal scores.
     */
    public function rankWithPairwise(array $appraisalScores, array $decisionMatrix = [], array $weights = [], array $criteriaTypes = []): array
    {
        if (count($appraisalScores) < 2) {
            throw new InvalidArgumentException('Minimal dua peserta diperlukan untuk menghitung Copeland.');
        }

        $participants = [];

        foreach ($appraisalScores as $entry) {
            $participantId = (int) ($entry['participant_id'] ?? 0);

            if ($participantId === 0 || !isset($entry['score'])) {
                throw new InvalidArgumentException('Data Appraisal Score EDAS tidak valid.');
            }

            $participants[$participantId] = [
                'id' => $participantId,
                'name' => (string) ($entry['participant_name'] ?? 'Peserta'),
                'edas_score' => (float) $entry['score'],
            ];
        }

        $participantIds = array_keys($participants);
        $pairwise = [];
        $wins = array_fill_keys($participantIds, 0);
        $losses = array_fill_keys($participantIds, 0);
        $ties = array_fill_keys($participantIds, 0);

        $orderedCriteria = [];
        if (!empty($weights)) {
            arsort($weights);
            $orderedCriteria = array_keys($weights);
        }

        foreach ($participantIds as $leftId) {
            $pairwise[$leftId] = [];

            foreach ($participantIds as $rightId) {
                if ($leftId === $rightId) {
                    $pairwise[$leftId][$rightId] = 0;
                    continue;
                }

                $leftScore = $participants[$leftId]['edas_score'];
                $rightScore = $participants[$rightId]['edas_score'];

                if ($leftScore > $rightScore) {
                    $pairwise[$leftId][$rightId] = 1;
                    $wins[$leftId]++;
                } elseif ($leftScore < $rightScore) {
                    $pairwise[$leftId][$rightId] = -1;
                    $losses[$leftId]++;
                } else {
                    $tieBroken = false;
                    foreach ($orderedCriteria as $code) {
                        $leftVal = $decisionMatrix[$leftId][$code] ?? 0;
                        $rightVal = $decisionMatrix[$rightId][$code] ?? 0;
                        
                        if ($leftVal != $rightVal) {
                            $isBenefit = ($criteriaTypes[$code] ?? 'benefit') === 'benefit';
                            if ($isBenefit) {
                                if ($leftVal > $rightVal) {
                                    $pairwise[$leftId][$rightId] = 1;
                                    $wins[$leftId]++;
                                } else {
                                    $pairwise[$leftId][$rightId] = -1;
                                    $losses[$leftId]++;
                                }
                            } else {
                                if ($leftVal < $rightVal) {
                                    $pairwise[$leftId][$rightId] = 1;
                                    $wins[$leftId]++;
                                } else {
                                    $pairwise[$leftId][$rightId] = -1;
                                    $losses[$leftId]++;
                                }
                            }
                            $tieBroken = true;
                            break;
                        }
                    }

                    if (!$tieBroken) {
                        $pairwise[$leftId][$rightId] = 0;
                        $ties[$leftId]++;
                    }
                }
            }
        }

        $rankingRows = [];

        foreach ($participantIds as $participantId) {
            $rankingRows[] = [
                'participant_id' => $participantId,
                'participant_name' => $participants[$participantId]['name'],
                'edas_score' => $participants[$participantId]['edas_score'],
                'wins' => $wins[$participantId],
                'losses' => $losses[$participantId],
                'ties' => $ties[$participantId],
                'copeland_score' => $wins[$participantId] - $losses[$participantId],
            ];
        }

        usort($rankingRows, function (array $left, array $right) use ($decisionMatrix, $orderedCriteria, $criteriaTypes) {
            $c1 = $right['copeland_score'] <=> $left['copeland_score'];
            if ($c1 !== 0) return $c1;
            
            $c2 = $right['edas_score'] <=> $left['edas_score'];
            if ($c2 !== 0) return $c2;
            
            $c3 = $right['wins'] <=> $left['wins'];
            if ($c3 !== 0) return $c3;
            
            $c4 = $left['losses'] <=> $right['losses'];
            if ($c4 !== 0) return $c4;
            
            foreach ($orderedCriteria as $code) {
                $leftVal = $decisionMatrix[$left['participant_id']][$code] ?? 0;
                $rightVal = $decisionMatrix[$right['participant_id']][$code] ?? 0;
                if ($leftVal != $rightVal) {
                    $isBenefit = ($criteriaTypes[$code] ?? 'benefit') === 'benefit';
                    return $isBenefit ? ($rightVal <=> $leftVal) : ($leftVal <=> $rightVal);
                }
            }
            
            return strcmp($left['participant_name'], $right['participant_name']);
        });

        $position = 0;
        foreach ($rankingRows as &$row) {
            $position++;
            $row['final_rank'] = $position;
        }
        unset($row);

        $pairwiseDisplay = [];
        $participantLabels = [];
        $orderedParticipantIds = array_column($rankingRows, 'participant_id');

        foreach ($orderedParticipantIds as $participantId) {
            $participantLabels[$participantId] = $participants[$participantId]['name'];
            $pairwiseDisplay[] = [
                'participant_id' => $participantId,
                'participant_name' => $participants[$participantId]['name'],
                'comparisons' => $pairwise[$participantId],
            ];
        }

        return [
            'pairwise_matrix' => $pairwiseDisplay,
            'rankings' => $rankingRows,
            'participant_labels' => $participantLabels,
            'summary' => [
                'total_participants' => count($participantIds),
                'total_comparisons' => (count($participantIds) * (count($participantIds) - 1)) / 2,
            ],
        ];
    }
}
