<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParticipantScore extends Model
{
    protected $guarded = [];

    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    public function criterion()
    {
        return $this->belongsTo(Criterion::class);
    }
}
