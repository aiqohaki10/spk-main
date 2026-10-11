<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class HandleAssessmentPeriod
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Schema::hasTable('assessment_periods')) {
            return $next($request);
        }

        if (!Session::has('active_period_id')) {
            $activePeriod = \App\Models\AssessmentPeriod::where('is_active', true)->first()
                ?? \App\Models\AssessmentPeriod::latest()->first();
            
            if ($activePeriod) {
                Session::put('active_period_id', $activePeriod->id);
            }
        }

        return $next($request);
    }
}
