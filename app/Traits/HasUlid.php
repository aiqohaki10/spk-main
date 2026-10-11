<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Generates a ULID on model creation and uses it for route model binding.
 * Internal FK relationships still use integer `id` for performance.
 */
trait HasUlid
{
    public static function bootHasUlid(): void
    {
        static::creating(function ($model) {
            if (empty($model->ulid)) {
                $model->ulid = (string) Str::ulid();
            }
        });
    }

    /**
     * Use 'ulid' as the route key for public-facing URLs.
     */
    public function getRouteKeyName(): string
    {
        return 'ulid';
    }
}
