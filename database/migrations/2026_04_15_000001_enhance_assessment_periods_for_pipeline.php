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
        Schema::table('assessment_periods', function (Blueprint $table) {
            $table->string('pipeline_status')->default('setup')->after('end_date');
            $table->unsignedTinyInteger('current_step')->default(1)->after('pipeline_status');
            $table->json('pipeline_meta')->nullable()->after('current_step');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessment_periods', function (Blueprint $table) {
            $table->dropColumn(['pipeline_status', 'current_step', 'pipeline_meta']);
        });
    }
};
