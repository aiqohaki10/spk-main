<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\AssessmentPeriodController;
use App\Http\Controllers\ParticipantExcelController;
use App\Http\Controllers\Pipeline\PipelineController;
use App\Http\Controllers\Pipeline\SetupStepController;
use App\Http\Controllers\Pipeline\ScoringStepController;
use App\Http\Controllers\Pipeline\BwmStepController;
use App\Http\Controllers\Pipeline\EdasStepController;
use App\Http\Controllers\Pipeline\ResultStepController;
use App\Http\Controllers\Pipeline\ResultExportController;
use App\Http\Controllers\Pipeline\SensitivityAnalysisController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Assessment Periods (full CRUD + reset) ──────
    Route::post('periods/switch', [AssessmentPeriodController::class, 'switch'])->name('periods.switch');
    Route::post('periods/{period}/reset', [AssessmentPeriodController::class, 'resetSession'])->name('periods.reset');
    Route::resource('periods', AssessmentPeriodController::class)->except(['create', 'show']);

    // ── Pipeline Routes (Core SPK Flow) ─────────────
    // {period} uses ULID via getRouteKeyName()
    Route::prefix('pipeline/{period}')->name('pipeline.')->group(function () {
        // Main wizard view
        Route::get('/', [PipelineController::class, 'index'])->name('index');

        // Rewind pipeline to a previous step
        Route::post('/rewind', [PipelineController::class, 'rewind'])->name('rewind');

        // Step 1: Setup — Criteria CRUD
        Route::post('/setup/criteria', [SetupStepController::class, 'storeCriteria'])->name('setup.criteria.store');
        Route::put('/setup/criteria/{criterion}', [SetupStepController::class, 'updateCriteria'])->name('setup.criteria.update');
        Route::put('/setup/criteria/{criterion}/subscales', [SetupStepController::class, 'updateSubscales'])->name('setup.criteria.subscales');
        Route::delete('/setup/criteria/{criterion}', [SetupStepController::class, 'destroyCriteria'])->name('setup.criteria.destroy');
        Route::post('/setup/complete', [SetupStepController::class, 'complete'])->name('setup.complete');

        // Step 2: Scoring
        Route::post('/scoring/save', [ScoringStepController::class, 'saveScores'])->name('scoring.save');
        Route::post('/scoring/auto-populate', [ScoringStepController::class, 'autoPopulate'])->name('scoring.autoPopulate');
        Route::post('/scoring/complete', [ScoringStepController::class, 'complete'])->name('scoring.complete');

        // Step 3: BWM
        Route::post('/bwm/process', [BwmStepController::class, 'process'])->name('bwm.process');

        // Step 4: EDAS
        Route::post('/edas/process', [EdasStepController::class, 'process'])->name('edas.process');

        // Step 6: Result
        Route::get('/result', [ResultStepController::class, 'show'])->name('result');
        Route::get('/result/export', [ResultExportController::class, 'export'])->name('result.export');
        Route::get('/sensitivity', [SensitivityAnalysisController::class, 'index'])->name('sensitivity');
    });

    // ── Participants (standalone CRUD) ──
    Route::get('participants/template', [ParticipantExcelController::class, 'template'])->name('participants.template');
    Route::post('participants/import', [ParticipantExcelController::class, 'import'])->name('participants.import');
    Route::resource('participants', ParticipantController::class)->except(['show']);
});

require __DIR__.'/auth.php';
