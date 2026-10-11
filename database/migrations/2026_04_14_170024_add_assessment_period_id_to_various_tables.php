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
        Schema::table('criteria', function (Blueprint $table) {
            $table->foreignId('assessment_period_id')->after('id')->nullable()->constrained()->onDelete('cascade');
            $table->dropUnique(['code']);
            $table->unique(['assessment_period_id', 'code']);
        });

        Schema::table('participants', function (Blueprint $table) {
            $table->foreignId('assessment_period_id')->after('id')->nullable()->constrained()->onDelete('cascade');
        });

        Schema::table('calculation_runs', function (Blueprint $table) {
            $table->foreignId('assessment_period_id')->after('id')->nullable()->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_runs', function (Blueprint $table) {
            $table->dropForeign(['assessment_period_id']);
            $table->dropColumn('assessment_period_id');
        });

        Schema::table('participants', function (Blueprint $table) {
            $table->dropForeign(['assessment_period_id']);
            $table->dropColumn('assessment_period_id');
        });

        Schema::table('criteria', function (Blueprint $table) {
            $table->dropUnique(['assessment_period_id', 'code']);
            $table->dropForeign(['assessment_period_id']);
            $table->dropColumn('assessment_period_id');
            $table->unique('code');
        });
    }
};
