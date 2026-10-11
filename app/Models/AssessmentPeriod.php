<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUlid;

class AssessmentPeriod extends Model
{
    use HasUlid;

    public const CORE_CRITERIA = [
        'C1' => [
            'code' => 'C1',
            'name' => 'Nilai Pre-Test',
            'description' => 'Nilai hasil ujian tertulis atau kompetensi dasar (0-100, diklasifikasi ke skor 1-5).',
            'attribute_type' => 'benefit',
            'input_type' => 'categorical',
            'sort_order' => 1,
            'is_active' => true,
            'subscales' => [
                ['label' => 'Sangat Kurang', 'range_hint' => '< 40',     'numeric_value' => 1, 'order_no' => 1],
                ['label' => 'Kurang',         'range_hint' => '41 – 55',  'numeric_value' => 2, 'order_no' => 2],
                ['label' => 'Cukup',          'range_hint' => '56 – 70',  'numeric_value' => 3, 'order_no' => 3],
                ['label' => 'Baik',           'range_hint' => '71 – 85',  'numeric_value' => 4, 'order_no' => 4],
                ['label' => 'Sangat Baik',    'range_hint' => '86 – 100', 'numeric_value' => 5, 'order_no' => 5],
            ],
        ],
        'C2' => [
            'code' => 'C2',
            'name' => 'Wawancara',
            'description' => 'Evaluasi komunikasi, motivasi, dan kesiapan peserta saat wawancara.',
            'attribute_type' => 'benefit',
            'input_type' => 'categorical',
            'sort_order' => 2,
            'is_active' => true,
            'subscales' => [
                ['label' => 'Tidak Komunikatif',  'range_hint' => 'Tidak tahu alasan memilih pelatihan',           'numeric_value' => 1, 'order_no' => 1],
                ['label' => 'Kurang Komunikatif', 'range_hint' => 'Motivasi rendah',                               'numeric_value' => 2, 'order_no' => 2],
                ['label' => 'Cukup Komunikatif',  'range_hint' => 'Motivasi rata-rata, rencana karier kurang jelas','numeric_value' => 3, 'order_no' => 3],
                ['label' => 'Komunikatif',         'range_hint' => 'Motivasi tinggi, memahami tujuan pelatihan',   'numeric_value' => 4, 'order_no' => 4],
                ['label' => 'Sangat Komunikatif',  'range_hint' => 'Motivasi sangat tinggi, rencana karier jelas', 'numeric_value' => 5, 'order_no' => 5],
            ],
        ],
        'C3' => [
            'code' => 'C3',
            'name' => 'Nilai Rapor',
            'description' => 'Rata-rata nilai akademik dari pendidikan terakhir (0-100, diklasifikasi ke skor 1-5).',
            'attribute_type' => 'benefit',
            'input_type' => 'categorical',
            'sort_order' => 3,
            'is_active' => true,
            'subscales' => [
                ['label' => 'Sangat Kurang', 'range_hint' => '< 40',     'numeric_value' => 1, 'order_no' => 1],
                ['label' => 'Kurang',         'range_hint' => '41 – 55',  'numeric_value' => 2, 'order_no' => 2],
                ['label' => 'Cukup',          'range_hint' => '56 – 70',  'numeric_value' => 3, 'order_no' => 3],
                ['label' => 'Baik',           'range_hint' => '71 – 85',  'numeric_value' => 4, 'order_no' => 4],
                ['label' => 'Sangat Baik',    'range_hint' => '86 – 100', 'numeric_value' => 5, 'order_no' => 5],
            ],
        ],
        'C4' => [
            'code' => 'C4',
            'name' => 'Jarak Domisili',
            'description' => 'Estimasi jarak tempuh ke lokasi pelatihan dalam kilometer.',
            'attribute_type' => 'benefit',
            'input_type' => 'categorical',
            'sort_order' => 4,
            'is_active' => true,
            'subscales' => [
                ['label' => 'Sangat Jauh',  'range_hint' => '> 40 km',    'numeric_value' => 1, 'order_no' => 1],
                ['label' => 'Jauh',         'range_hint' => '> 20 – 40 km','numeric_value' => 2, 'order_no' => 2],
                ['label' => 'Cukup Jauh',   'range_hint' => '> 10 – 20 km','numeric_value' => 3, 'order_no' => 3],
                ['label' => 'Dekat',        'range_hint' => '> 5 – 10 km', 'numeric_value' => 4, 'order_no' => 4],
                ['label' => 'Sangat Dekat', 'range_hint' => '0 – 5 km',   'numeric_value' => 5, 'order_no' => 5],
            ],
        ],
        'C5' => [
            'code' => 'C5',
            'name' => 'Kesiapan Pelatihan',
            'description' => 'Tingkat kesiapan peserta untuk mengikuti pelatihan.',
            'attribute_type' => 'benefit',
            'input_type' => 'categorical',
            'sort_order' => 5,
            'is_active' => true,
            'subscales' => [
                ['label' => 'Tidak Siap',   'range_hint' => 'Terikat kontrak lain, tidak bisa jadwal penuh',           'numeric_value' => 1, 'order_no' => 1],
                ['label' => 'Kurang Siap',  'range_hint' => 'Ada kesibukan sampingan yang berpotensi mengganggu',       'numeric_value' => 2, 'order_no' => 2],
                ['label' => 'Cukup Siap',   'range_hint' => 'Bersedia pelatihan, masih ragu soal penempatan luar kota', 'numeric_value' => 3, 'order_no' => 3],
                ['label' => 'Siap',         'range_hint' => 'Bersedia ditempatkan (syarat tertentu), komit jadwal penuh','numeric_value' => 4, 'order_no' => 4],
                ['label' => 'Sangat Siap',  'range_hint' => 'Bersedia ditempatkan di mana saja, komit jadwal penuh',   'numeric_value' => 5, 'order_no' => 5],
            ],
        ],
    ];

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'current_step' => 'integer',
        'pipeline_meta' => 'array',
    ];

    /**
     * Attributes appended to JSON/array serialization for frontend consumption.
     */
    protected $appends = ['route_key'];

    public function getRouteKeyAttribute(): string
    {
        return $this->ulid;
    }

    /* ── Relationships ────────────────────────────── */

    public function criteria()
    {
        return $this->hasMany(Criterion::class);
    }

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

    public function calculationRuns()
    {
        return $this->hasMany(CalculationRun::class);
    }

    public function bwmComparison()
    {
        return $this->hasOne(BwmComparison::class);
    }

    public function criterionWeights()
    {
        return $this->hasMany(CriterionWeight::class);
    }

    /* ── Pipeline Helpers ─────────────────────────── */

    /**
     * Get the pipeline step names mapped by number.
     */
    public static function stepNames(): array
    {
        return [
            1 => 'setup',
            2 => 'scoring',
            3 => 'bwm',
            4 => 'edas',
            5 => 'tieBreaking',
            6 => 'completed',
        ];
    }

    /**
     * Get a human-readable label for the current pipeline status.
     */
    public function getPipelineStatusLabelAttribute(): string
    {
        return match ($this->pipeline_status) {
            'setup'       => 'Konfigurasi Awal',
            'scoring'     => 'Input Nilai',
            'bwm'         => 'Pembobotan BWM',
            'edas'        => 'Kalkulasi EDAS',
            'tieBreaking' => 'Tie Breaking',
            'completed'   => 'Selesai',
            default       => 'Tidak Diketahui',
        };
    }

    /**
     * Check if a given step number has been completed.
     */
    public function hasCompletedStep(int $step): bool
    {
        return $this->current_step > $step;
    }

    /**
     * Check if a given step can currently be accessed.
     */
    public function canAccessStep(int $step): bool
    {
        return $this->current_step >= $step;
    }

    /**
     * Record a step completion timestamp in pipeline_meta.
     */
    public function markStepCompleted(int $step): void
    {
        $meta = $this->pipeline_meta ?? [];
        $meta["step_{$step}_completed_at"] = now()->toIso8601String();

        $nextStep = min($step + 1, 6);
        $stepNames = self::stepNames();

        $this->update([
            'current_step' => max($this->current_step, $nextStep),
            'pipeline_status' => $stepNames[$nextStep] ?? 'completed',
            'pipeline_meta' => $meta,
        ]);
    }

    /**
     * Rewind the pipeline to a specific step, clearing downstream data.
     */
    public function rewindToStep(int $step): void
    {
        $stepNames = self::stepNames();

        // If rewinding to setup, refresh criteria definitions from core config
        if ($step === 1) {
            $this->syncCriteriaWithDefault();
        }

        // Clear downstream calculation runs
        if ($step <= 3) {
            CalculationRun::where('assessment_period_id', $this->id)
                ->where('method_stage', 'BWM')->delete();
            CriterionWeight::where('assessment_period_id', $this->id)->delete();
            BwmComparison::where('assessment_period_id', $this->id)->delete();
        }
        if ($step <= 4) {
            // Delete EDAS runs and their results
            $edasRuns = CalculationRun::where('assessment_period_id', $this->id)
                ->where('method_stage', 'EDAS')->get();
            foreach ($edasRuns as $run) {
                CalculationResult::where('calculation_run_id', $run->id)->delete();
            }
            $edasRuns->each->delete();
        }

        $this->update([
            'current_step' => $step,
            'pipeline_status' => $stepNames[$step] ?? 'setup',
            'pipeline_meta' => array_filter(
                $this->pipeline_meta ?? [],
                fn($key) => (int) filter_var($key, FILTER_SANITIZE_NUMBER_INT) < $step,
                ARRAY_FILTER_USE_KEY
            ),
        ]);
    }

    /**
     * Reset all transactional data within this period without deleting
     * the period itself or its criteria configuration.
     */
    public function resetSession(): void
    {
        // Delete all calculation results via runs
        $runs = $this->calculationRuns()->get();
        foreach ($runs as $run) {
            CalculationResult::where('calculation_run_id', $run->id)->delete();
        }

        // Delete BWM data
        BwmComparison::where('assessment_period_id', $this->id)->delete();
        CriterionWeight::where('assessment_period_id', $this->id)->delete();
        CalculationRun::where('assessment_period_id', $this->id)->delete();

        // Delete scores then participants
        $participantIds = $this->participants()->pluck('id');
        ParticipantScore::whereIn('participant_id', $participantIds)->delete();
        Participant::where('assessment_period_id', $this->id)->delete();

        // Refresh criteria definitions from core config
        $this->syncCriteriaWithDefault();

        // Reset pipeline state
        $this->update([
            'current_step' => 1,
            'pipeline_status' => 'setup',
            'pipeline_meta' => null,
        ]);
    }

    /**
     * Build the access map for all pipeline steps.
     */
    public function getPipelineAccessMap(): array
    {
        return [
            'setup'       => true,
            'scoring'     => $this->current_step >= 2,
            'bwm'         => $this->current_step >= 3,
            'edas'        => $this->current_step >= 4,
            'tieBreaking' => $this->current_step >= 5,
            'result'      => $this->current_step >= 6,
        ];
    }

    public function createDefaultCriteria(): void
    {
        foreach (self::CORE_CRITERIA as $data) {
            $subscales = $data['subscales'] ?? null;
            unset($data['subscales']);
            
            $criterion = $this->criteria()->create($data);
            
            if ($subscales) {
                $criterion->subscales()->createMany($subscales);
            }
        }
    }

    /**
     * Synchronize existing criteria with the latest CORE_CRITERIA definition.
     * This updates names, types, descriptions and refreshes subscales.
     */
    public function syncCriteriaWithDefault(): void
    {
        foreach (self::CORE_CRITERIA as $code => $config) {
            $subscales = $config['subscales'] ?? null;
            unset($config['subscales']);

            $criterion = $this->criteria()->where('code', $code)->first();

            if ($criterion) {
                $criterion->update($config);
                if ($subscales) {
                    $criterion->subscales()->delete();
                    $criterion->subscales()->createMany($subscales);
                }
            } else {
                // If somehow missing, create it
                $newCriterion = $this->criteria()->create($config);
                if ($subscales) {
                    $newCriterion->subscales()->createMany($subscales);
                }
            }
        }
    }
}
