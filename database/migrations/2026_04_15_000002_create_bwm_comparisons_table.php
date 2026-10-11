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
        Schema::create('bwm_comparisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_period_id')->constrained()->onDelete('cascade');
            $table->foreignId('best_criterion_id')->constrained('criteria')->onDelete('cascade');
            $table->foreignId('worst_criterion_id')->constrained('criteria')->onDelete('cascade');
            $table->json('best_to_others');
            $table->json('others_to_worst');
            $table->double('consistency_index')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bwm_comparisons');
    }
};
