<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\ScopedByPeriod;

class CalculationRun extends Model
{
    use ScopedByPeriod;

    protected $guarded = [];

    protected $casts = [
        'stage_payload' => 'array',
        'executed_at' => 'datetime',
    ];

    public function assessmentPeriod()
    {
        return $this->belongsTo(AssessmentPeriod::class);
    }

    public function results()
    {
        return $this->hasMany(CalculationResult::class);
    }
}
