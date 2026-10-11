<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\CalculationRun;
use App\Models\CalculationResult;

class ResultStepController extends Controller
{
    /**
     * Show the final ranking result page (part of the wizard).
     * This is already handled by PipelineController::index,
     * but can be used for standalone deep-link access.
     */
    public function show(AssessmentPeriod $period)
    {
        return redirect()->route('pipeline.index', $period);
    }
}
