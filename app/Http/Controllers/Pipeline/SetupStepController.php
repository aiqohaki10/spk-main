<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\Criterion;
use App\Models\CriterionSubscale;
use Illuminate\Http\Request;

class SetupStepController extends Controller
{
    /**
     * Store a new criterion for the given assessment period.
     */
    public function storeCriteria(Request $request, AssessmentPeriod $period)
    {
        return back()->with('error', 'Aplikasi ini menggunakan 5 kriteria inti tetap (C1-C5). Penambahan kriteria baru dinonaktifkan.');
    }

    /**
     * Update an existing criterion.
     */
    public function updateCriteria(Request $request, AssessmentPeriod $period, Criterion $criterion)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10',
            'name' => 'required|string|max:255',
            'attribute_type' => 'required|in:benefit,cost',
            'input_type' => 'required|in:numeric,categorical',
            'description' => 'nullable|string',
            'subscales' => 'nullable|array',
            'subscales.*.label' => 'required_with:subscales|string',
            'subscales.*.range_hint' => 'nullable|string',
            'subscales.*.numeric_value' => 'required_with:subscales|numeric',
        ]);

        $coreConfig = AssessmentPeriod::CORE_CRITERIA[$criterion->code] ?? null;

        if ($coreConfig === null) {
            return back()->with('error', 'Kriteria di luar template inti tidak didukung pada versi produksi ini.');
        }

        if ($validated['code'] !== $criterion->code) {
            return back()->withErrors(['code' => 'Kode inti kriteria tidak dapat diubah.']);
        }

        $criterion->update([
            'code' => $criterion->code,
            'name' => $validated['name'],
            'attribute_type' => $coreConfig['attribute_type'],
            'input_type' => $coreConfig['input_type'],
            'description' => $validated['description'] ?? null,
        ]);

        // Replace subscales if provided
        if (isset($validated['subscales'])) {
            $criterion->subscales()->delete();
            foreach ($validated['subscales'] as $index => $subscale) {
                CriterionSubscale::create([
                    'criterion_id' => $criterion->id,
                    'label' => $subscale['label'],
                    'range_hint' => $subscale['range_hint'] ?? null,
                    'numeric_value' => $subscale['numeric_value'],
                    'order_no' => $index + 1,
                ]);
            }
        }

        // Invalidate downstream calculations when modifying setup
        if ($period->current_step > 1) {
            $period->rewindToStep(1);
        }

        return back()->with('success', "Kriteria '{$criterion->name}' berhasil diperbarui.");
    }

    /**
     * Update subscales for a specific criterion.
     */
    public function updateSubscales(Request $request, AssessmentPeriod $period, Criterion $criterion)
    {
        $validated = $request->validate([
            'subscales' => 'required|array|min:1',
            'subscales.*.label' => 'required|string',
            'subscales.*.range_hint' => 'nullable|string',
            'subscales.*.numeric_value' => 'required|numeric',
        ]);

        $criterion->subscales()->delete();

        foreach ($validated['subscales'] as $index => $subscale) {
            CriterionSubscale::create([
                'criterion_id' => $criterion->id,
                'label' => $subscale['label'],
                'range_hint' => $subscale['range_hint'] ?? null,
                'numeric_value' => $subscale['numeric_value'],
                'order_no' => $index + 1,
            ]);
        }

        return back()->with('success', "Subskala untuk '{$criterion->name}' berhasil diperbarui.");
    }

    /**
     * Delete a criterion.
     */
    public function destroyCriteria(AssessmentPeriod $period, Criterion $criterion)
    {
        return back()->with('error', 'Kriteria inti C1-C5 tidak dapat dihapus dari sistem.');
    }

    /**
     * Mark Step 1 (Setup) as complete and advance pipeline.
     */
    public function complete(AssessmentPeriod $period)
    {
        $criteria = Criterion::where('assessment_period_id', $period->id)->get();
        $requiredCodes = collect(array_keys(AssessmentPeriod::CORE_CRITERIA));
        $configuredCodes = $criteria->pluck('code');
        $missingCodes = $requiredCodes->diff($configuredCodes);
        $extraCodes = $configuredCodes->diff($requiredCodes);

        if ($criteria->count() !== $requiredCodes->count() || $missingCodes->isNotEmpty() || $extraCodes->isNotEmpty()) {
            return back()->with('error', 'Konfigurasi kriteria harus tetap terdiri dari 5 kriteria inti C1 sampai C5.');
        }

        $period->markStepCompleted(1);

        return back()->with('success', 'Konfigurasi selesai. Lanjut ke input peserta & nilai.');
    }
}
