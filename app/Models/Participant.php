<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\ScopedByPeriod;
use App\Traits\HasUlid;

class Participant extends Model
{
    use ScopedByPeriod, HasUlid;

    protected $guarded = [];

    protected $appends = ['route_key'];

    public function getRouteKeyAttribute(): string
    {
        return $this->ulid;
    }

    public function assessmentPeriod()
    {
        return $this->belongsTo(AssessmentPeriod::class);
    }

    public function scores()
    {
        return $this->hasMany(ParticipantScore::class);
    }
}
