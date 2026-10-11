<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BwmComparison extends Model
{
    protected $guarded = [];

    protected $casts = [
        'best_to_others' => 'array',
        'others_to_worst' => 'array',
    ];

    public function assessmentPeriod()
    {
        return $this->belongsTo(AssessmentPeriod::class);
    }

    public function bestCriterion()
    {
        return $this->belongsTo(Criterion::class, 'best_criterion_id');
    }

    public function worstCriterion()
    {
        return $this->belongsTo(Criterion::class, 'worst_criterion_id');
    }
}
