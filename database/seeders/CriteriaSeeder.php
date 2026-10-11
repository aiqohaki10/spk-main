<?php

namespace Database\Seeders;

use App\Models\AssessmentPeriod;
use Illuminate\Database\Seeder;

class CriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if there is already an assessment period
        $period = AssessmentPeriod::first();

        if (!$period) {
            $period = AssessmentPeriod::create([
                'name' => 'Sesi Penilaian Default (Template)',
                'description' => 'Sesi awal yang berisi kriteria template standard SPK.',
                'is_active' => true,
                'current_step' => 1,
                'pipeline_status' => 'setup',
            ]);
            
            // Set as active session for first time run
            session(['active_period_id' => $period->id]);
        }

        // Only populate if criteria is empty
        if ($period->criteria()->count() === 0) {
            $period->createDefaultCriteria();
            $this->command->info("Template criteria successfully created for period: {$period->name}");
        } else {
            $this->command->warn("Criteria already exists for period: {$period->name}. Skipping template seeding.");
        }
    }
}
