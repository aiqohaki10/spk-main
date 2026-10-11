<?php

namespace App\Services\EDAS;

use Illuminate\Support\Collection;
use InvalidArgumentException;

class EdasCalculationService
{
    /**
     * Full deterministic EDAS calculation with intermediate matrices.
     */
    public function calculateWithMatrices(Collection $participants, Collection $criteria, array $weights): array
    {
        if ($participants->count() === 0) {
            throw new InvalidArgumentException('Data peserta belum tersedia untuk kalkulasi EDAS.');
        }

        if ($criteria->count() === 0) {
            throw new InvalidArgumentException('Data kriteria belum tersedia untuk kalkulasi EDAS.');
        }

        $criteriaCodes = $criteria->pluck('code')->all();
        $missingWeights = collect($criteriaCodes)->reject(fn($code) => array_key_exists($code, $weights));

        if ($missingWeights->isNotEmpty()) {
            throw new InvalidArgumentException('Bobot BWM belum lengkap untuk seluruh kriteria.');
        }

        $decisionMatrix = [];
        $participantMap = [];

        foreach ($participants as $participant) {
            $row = [];
            $participantMap[$participant->id] = $participant->full_name;

            foreach ($criteria as $criterion) {
                $score = $participant->scores->firstWhere('criterion_id', $criterion->id);

                if ($score === null || $score->raw_value === null) {
                    throw new InvalidArgumentException("Nilai peserta {$participant->full_name} untuk kriteria {$criterion->name} belum lengkap.");
                }

                $row[$criterion->code] = (float) $score->raw_value;
            }

            $decisionMatrix[$participant->id] = $row;
        }

        $averageSolution = [];

        foreach ($criteria as $criterion) {
            $averageSolution[$criterion->code] = round(
                array_sum(array_column($decisionMatrix, $criterion->code)) / $participants->count(),
                6
            );
        }

        $pdaMatrix = [];
        $ndaMatrix = [];
        $summaryRows = [];

        foreach ($decisionMatrix as $participantId => $row) {
            $pdaRow = [];
            $ndaRow = [];
            $sp = 0.0;
            $sn = 0.0;

            foreach ($criteria as $criterion) {
                $criterionCode = $criterion->code;
                $value = $row[$criterionCode];
                $average = $averageSolution[$criterionCode];
                $distanceBase = abs($average) > 0 ? abs($average) : null;

                if ($distanceBase === null) {
                    $pda = 0.0;
                    $nda = 0.0;
                } elseif ($criterion->attribute_type === 'benefit') {
                    $pda = max(0, ($value - $average) / $distanceBase);
                    $nda = max(0, ($average - $value) / $distanceBase);
                } else {
                    $pda = max(0, ($average - $value) / $distanceBase);
                    $nda = max(0, ($value - $average) / $distanceBase);
                }

                $pdaRow[$criterionCode] = round($pda, 6);
                $ndaRow[$criterionCode] = round($nda, 6);
                $sp += ($weights[$criterionCode] ?? 0) * $pda;
                $sn += ($weights[$criterionCode] ?? 0) * $nda;
            }

            $pdaMatrix[$participantId] = $pdaRow;
            $ndaMatrix[$participantId] = $ndaRow;
            $summaryRows[$participantId] = [
                'participant_id' => (int) $participantId,
                'participant_name' => $participantMap[$participantId],
                'sp' => round($sp, 6),
                'sn' => round($sn, 6),
            ];
        }

        $maxSp = max(array_column($summaryRows, 'sp')) ?: 0.0;
        $maxSn = max(array_column($summaryRows, 'sn')) ?: 0.0;

        foreach ($summaryRows as $participantId => $row) {
            $nsp = $maxSp > 0 ? $row['sp'] / $maxSp : 0.0;
            $nsn = $maxSn > 0 ? 1 - ($row['sn'] / $maxSn) : 1.0;
            $summaryRows[$participantId]['nsp'] = round($nsp, 6);
            $summaryRows[$participantId]['nsn'] = round($nsn, 6);
            $summaryRows[$participantId]['score'] = round(($nsp + $nsn) / 2, 6);
        }

        // Hitung peringkat EDAS (standard competition ranking: skor yang sama memiliki peringkat yang sama)
        $allScores = array_column($summaryRows, 'score');
        rsort($allScores);

        $index = 1;
        foreach ($summaryRows as $participantId => &$row) {
            $code = 'A' . $index++;
            $score = $row['score'];

            // Peringkat adalah 1 + jumlah peserta dengan skor lebih tinggi
            $greaterCount = 0;
            foreach ($allScores as $s) {
                if ($s > $score) {
                    $greaterCount++;
                }
            }

            $row['code'] = $code;
            $row['rank'] = 1 + $greaterCount;
        }
        unset($row);

        // Pertahankan urutan data mentah peserta (A1, A2, A3, ...) sesuai urutan input
        $appraisalScores = array_values($summaryRows);

        $pdaDisplay = [];
        $ndaDisplay = [];

        $index = 1;
        foreach ($decisionMatrix as $participantId => $row) {
            $code = 'A' . $index++;
            $pdaDisplay[] = array_merge(
                ['participant_id' => $participantId, 'code' => $code, 'participant_name' => $participantMap[$participantId]],
                $pdaMatrix[$participantId]
            );
            $ndaDisplay[] = array_merge(
                ['participant_id' => $participantId, 'code' => $code, 'participant_name' => $participantMap[$participantId]],
                $ndaMatrix[$participantId]
            );
        }

        return [
            'decision_matrix' => $decisionMatrix,
            'participant_map' => $participantMap,
            'average_solution' => $averageSolution,
            'pda_matrix' => $pdaDisplay,
            'nda_matrix' => $ndaDisplay,
            'appraisal_scores' => $appraisalScores,
            'criteria_codes' => $criteriaCodes,
            'weights_used' => $weights,
        ];
    }
}
