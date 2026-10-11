<?php

namespace App\Http\Controllers;

use App\Models\AssessmentPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssessmentPeriodController extends Controller
{
    public function switch(Request $request)
    {
        $request->validate([
            'period_id' => 'required|exists:assessment_periods,id'
        ]);

        session(['active_period_id' => $request->period_id]);

        return back()->with('success', 'Periode aktif berhasil diubah.');
    }

    public function index()
    {
        $periods = AssessmentPeriod::latest()->get();
        return Inertia::render('Periods/Index', [
            'periods' => $periods
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        if ($validated['is_active'] ?? false) {
            AssessmentPeriod::where('is_active', true)->update(['is_active' => false]);
        }

        // Ensure clean defaults for new periods
        $validated['current_step'] = 1;
        $validated['pipeline_status'] = 'setup';
        $validated['pipeline_meta'] = null;

        $period = AssessmentPeriod::create($validated);

        // Auto-populate with template criteria
        $period->createDefaultCriteria();

        // Auto select if it's the only one
        if (AssessmentPeriod::count() === 1) {
            session(['active_period_id' => $period->id]);
        }

        return redirect()->route('periods.index')->with('success', 'Periode berhasil dibuat.');
    }

    public function edit(AssessmentPeriod $period)
    {
        return Inertia::render('Periods/Edit', [
            'period' => $period,
        ]);
    }

    public function update(Request $request, AssessmentPeriod $period)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        if ($validated['is_active'] ?? false) {
            AssessmentPeriod::where('is_active', true)
                ->where('id', '!=', $period->id)
                ->update(['is_active' => false]);
        }

        $period->update($validated);

        return redirect()->route('periods.index')->with('success', 'Periode berhasil diperbarui.');
    }

    public function destroy(AssessmentPeriod $period)
    {
        // Clean up all associated data before deleting
        $period->resetSession();

        // Delete criteria and subscales
        foreach ($period->criteria as $criterion) {
            $criterion->subscales()->delete();
        }
        $period->criteria()->delete();

        $period->delete();

        // Clear session if this was the active period
        if (session('active_period_id') == $period->id) {
            session()->forget('active_period_id');
        }

        return redirect()->route('periods.index')->with('success', 'Periode dan seluruh data terkait berhasil dihapus.');
    }

    /**
     * Reset all transactional data (participants, scores, calculations)
     * within a period WITHOUT deleting the period or its criteria.
     */
    public function resetSession(AssessmentPeriod $period)
    {
        $period->resetSession();

        return back()->with('success', 'Sesi berhasil direset. Semua data peserta dan perhitungan telah dihapus.');
    }
}
