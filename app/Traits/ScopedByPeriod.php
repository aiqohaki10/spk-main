<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait ScopedByPeriod
{
    /**
     * Scope a query to only include records from the active assessment period.
     */
    public function scopeForActivePeriod(Builder $query)
    {
        return $query->where('assessment_period_id', session('active_period_id'));
    }
}
