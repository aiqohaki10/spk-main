<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AssessmentPeriod;
use Symfony\Component\HttpFoundation\Response;

class EnsurePipelineStep
{
    /**
     * Ensure the user has completed prerequisite steps
     * before accessing the requested pipeline step.
     *
     * Usage in routes: ->middleware('pipeline.step:3')
     * This means: "user must have completed at least step 2 to access this"
     */
    public function handle(Request $request, Closure $next, int $requiredStep): Response
    {
        $period = $request->route('period');

        // If route parameter is an ID, resolve it
        if (is_numeric($period)) {
            $period = AssessmentPeriod::find($period);
        }

        if (!$period) {
            $periodId = session('active_period_id');
            $period = AssessmentPeriod::find($periodId);
        }

        if (!$period) {
            return redirect()->route('periods.index')
                ->with('error', 'Silakan pilih periode penilaian terlebih dahulu.');
        }

        // Check if the previous step has been completed
        if ($period->current_step < ($requiredStep - 1)) {
            $stepNames = AssessmentPeriod::stepNames();
            $previousStep = $requiredStep - 1;

            return redirect()->route('pipeline.index', $period)
                ->with('error', "Selesaikan Tahap {$previousStep} ({$stepNames[$previousStep]}) terlebih dahulu sebelum melanjutkan.");
        }

        return $next($request);
    }
}
