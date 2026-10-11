<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add stage_payload to calculation_runs for intermediate matrix data
        Schema::table('calculation_runs', function (Blueprint $table) {
            $table->json('stage_payload')->nullable()->after('description');
        });

        // Add period_id and consistency_ratio to criterion_weights
        Schema::table('criterion_weights', function (Blueprint $table) {
            $table->foreignId('assessment_period_id')->nullable()->after('criterion_id')
                  ->constrained()->onDelete('cascade');
            $table->double('consistency_ratio')->nullable()->after('source_method');
        });

        // Add copeland detail columns to calculation_results
        Schema::table('calculation_results', function (Blueprint $table) {
            $table->integer('copeland_wins')->nullable()->after('copeland_score');
            $table->integer('copeland_losses')->nullable()->after('copeland_wins');
        });

        // Add sort_order to criteria
        Schema::table('criteria', function (Blueprint $table) {
            $table->integer('sort_order')->default(0)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_runs', function (Blueprint $table) {
            $table->dropColumn('stage_payload');
        });

        Schema::table('criterion_weights', function (Blueprint $table) {
            $table->dropForeign(['assessment_period_id']);
            $table->dropColumn(['assessment_period_id', 'consistency_ratio']);
        });

        Schema::table('calculation_results', function (Blueprint $table) {
            $table->dropColumn(['copeland_wins', 'copeland_losses']);
        });

        Schema::table('criteria', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
