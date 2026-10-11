<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\AssessmentPeriod;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'a@a.com'],
            [
                'name' => 'Admin',
                'email_verified_at' => now(),
                'password' => bcrypt('123'),
            ]
        );

        $period = AssessmentPeriod::updateOrCreate(
            ['name' => 'Rekrutmen Gelombang 1'],
            [
                'description' => 'Periode awal untuk konfigurasi kriteria seleksi peserta LPKS.',
                'is_active' => true,
                'start_date' => now(),
                'end_date' => now()->addMonths(3),
                'current_step' => 1,
                'pipeline_status' => 'setup',
            ]
        );

        if ($period->criteria()->count() === 0) {
            $period->createDefaultCriteria();
        }

        $this->command->info('Database seeded with default admin and core criteria template only.');
    }
}
