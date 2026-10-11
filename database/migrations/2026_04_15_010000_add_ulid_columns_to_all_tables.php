<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Add ULID columns for public-facing route obfuscation.
     * Internal FK relationships still use integer IDs for performance.
     */
    public function up(): void
    {
        $tables = ['assessment_periods', 'participants', 'criteria'];

        // Step 1: Add nullable ULID columns (no unique constraint yet)
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('ulid', 26)->nullable()->after('id');
            });
        }

        // Step 2: Backfill existing rows with generated ULIDs
        foreach ($tables as $table) {
            $rows = \Illuminate\Support\Facades\DB::table($table)->get();
            foreach ($rows as $row) {
                \Illuminate\Support\Facades\DB::table($table)
                    ->where('id', $row->id)
                    ->update(['ulid' => (string) Str::ulid()]);
            }
        }

        // Step 3: Now apply the unique constraint
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->unique('ulid');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['assessment_periods', 'participants', 'criteria'];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('ulid');
            });
        }
    }
};
