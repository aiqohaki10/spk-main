<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalculationResult extends Model
{
    protected $guarded = [];

    protected $casts = [
        'extra_payload' => 'array',
    ];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function calculationRun()
    {
        return $this->belongsTo(CalculationRun::class);
    }
}
