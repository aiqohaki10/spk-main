<?php

namespace App\Http\Controllers;

use App\Models\CalculationResult;
use App\Models\CalculationRun;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RankingController extends Controller
{
    public function index()
    {
        $latestRun = CalculationRun::forActivePeriod()->latest('executed_at')->first();
        
        $results = [];
        if ($latestRun) {
            $results = CalculationResult::with('participant')
                ->where('calculation_run_id', $latestRun->id)
                ->orderBy('final_rank')
                ->get();
        }

        return Inertia::render('Rankings/Index', [
            'results' => $results,
            'latestRun' => $latestRun,
        ]);
    }
}
