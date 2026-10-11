<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\Criterion;
use App\Services\Participants\ParticipantScoreSyncService;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ParticipantExcelController extends Controller
{
    public function template()
    {
        $spreadsheet = new Spreadsheet();
        $activeSheet = $spreadsheet->getActiveSheet();
        
        // Define Headers
        $headers = [
            'No', 
            'Nama Lengkap', 
            'Pre Test (Nilai 0-100)', 
            'Wawancara (Skor 1-5)', 
            'Nilai Rapor (Nilai 0-100)', 
            'Jarak Domisili (km)', 
            'Kesiapan Pelatihan (Skor 1-5)'
        ];

        foreach ($headers as $index => $header) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $activeSheet->setCellValue($colLetter . '1', $header);
            // Auto size columns
            $activeSheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        // Add some sample row style (border)
        $activeSheet->getStyle('A1:G1')->getFont()->setBold(true);

        $writer = new Xlsx($spreadsheet);
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="template_peserta.xlsx"');
        header('Cache-Control: max-age=0');
        
        $writer->save('php://output');
        exit;
    }

    public function import(Request $request, ParticipantScoreSyncService $scoreSyncService)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        $activePeriodId = session('active_period_id');

        if (!$activePeriodId) {
            return back()->with('error', 'Silakan pilih periode aktif terlebih dahulu.');
        }

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        // Skip header
        array_shift($rows);

        $criteria = Criterion::where('assessment_period_id', $activePeriodId)
            ->with('subscales')
            ->orderBy('sort_order')
            ->get()
            ->keyBy('code');

        $requiredCriteria = collect(['C1', 'C2', 'C3', 'C4', 'C5']);
        $missingCriteria = $requiredCriteria->diff($criteria->keys());

        if ($missingCriteria->isNotEmpty()) {
            return back()->with('error', 'Import dibatalkan karena konfigurasi kriteria periode belum lengkap.');
        }

        $existingNames = Participant::where('assessment_period_id', $activePeriodId)
            ->pluck('full_name')
            ->map(fn($name) => Str::of((string) $name)->squish()->lower()->value())
            ->flip();

        $errors = [];
        $preparedRows = [];
        $seenNames = [];

        foreach ($rows as $index => $row) {
            $lineNumber = $index + 2;
            $fullName = Str::of((string) ($row[1] ?? ''))->squish()->value();

            if ($fullName === '') {
                continue;
            }

            $normalizedName = Str::of($fullName)->lower()->value();

            if (isset($seenNames[$normalizedName])) {
                $errors[] = "Baris {$lineNumber}: nama peserta duplikat di file impor.";
                continue;
            }

            if ($existingNames->has($normalizedName)) {
                $errors[] = "Baris {$lineNumber}: peserta \"{$fullName}\" sudah ada pada periode aktif.";
                continue;
            }

            $preTest = $this->parseScore($row[2] ?? null, 'Pre-Test', $lineNumber, 0, 100, $errors);
            $interview = $this->parseScore($row[3] ?? null, 'Wawancara', $lineNumber, 1, 5, $errors);
            $report = $this->parseScore($row[4] ?? null, 'Nilai Rapor', $lineNumber, 0, 100, $errors);
            $distance = $this->parseScore($row[5] ?? null, 'Jarak Domisili', $lineNumber, 0, null, $errors);
            $readiness = $this->parseScore($row[6] ?? null, 'Kesiapan Pelatihan', $lineNumber, 1, 5, $errors);

            if ($preTest === null || $interview === null || $report === null || $distance === null || $readiness === null) {
                continue;
            }

            $preparedRows[] = [
                'full_name' => $fullName,
                'pre_test_score' => $preTest,
                'interview_grade' => $interview,
                'report_score' => $report,
                'domicile_distance_km' => $distance,
                'work_readiness_grade' => $readiness,
                'assessment_period_id' => $activePeriodId,
                'is_active' => true,
            ];

            $seenNames[$normalizedName] = true;
        }

        if ($errors !== []) {
            $message = implode(' ', array_slice($errors, 0, 5));
            if (count($errors) > 5) {
                $message .= ' Terdapat error tambahan pada baris lain.';
            }

            return back()->with('error', "Import dibatalkan. {$message}");
        }

        DB::beginTransaction();
        try {
            $criteriaCollection = $criteria->values();

            foreach ($preparedRows as $participantData) {
                $participant = Participant::create($participantData);
                $scoreSyncService->syncParticipant($participant, $criteriaCollection);
            }
            DB::commit();
            return back()->with('success', count($preparedRows) . ' data peserta berhasil diimpor dan skor awal disinkronkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengimport data: ' . $e->getMessage());
        }
    }

    private function parseScore(mixed $value, string $label, int $lineNumber, float $min, ?float $max, array &$errors): ?float
    {
        if ($value === null || $value === '') {
            $errors[] = "Baris {$lineNumber}: {$label} wajib diisi.";
            return null;
        }

        if (!is_numeric($value)) {
            $errors[] = "Baris {$lineNumber}: {$label} harus berupa angka.";
            return null;
        }

        $number = (float) $value;

        if ($number < $min || ($max !== null && $number > $max)) {
            $range = $max !== null ? "{$min}-{$max}" : "minimal {$min}";
            $errors[] = "Baris {$lineNumber}: {$label} harus berada pada rentang {$range}.";
            return null;
        }

        return $number;
    }
}
