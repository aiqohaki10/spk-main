<?php

namespace App\Http\Controllers\Pipeline;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\CalculationRun;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ResultExportController extends Controller
{
    public function export(AssessmentPeriod $period)
    {
        $edasRun = CalculationRun::where('assessment_period_id', $period->id)
            ->where('method_stage', 'EDAS')
            ->latest()
            ->first();

        if (!$edasRun) {
            return back()->with('error', 'Belum ada hasil akhir untuk diekspor.');
        }

        $results = $edasRun->results()
            ->with('participant')
            ->orderBy('final_rank')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Hasil Akhir');

        // Headers
        $headers = ['Peringkat', 'Nama Peserta', 'Skor EDAS', 'Status'];
        foreach ($headers as $index => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($col . '1', $header);
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Header style
        $headerRange = 'A1:D1';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F46E5']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '3730A3']]],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $acceptedCount = 30;

        foreach ($results as $index => $result) {
            $row = $index + 2;
            $rank = $result->final_rank;
            $isAccepted = $rank <= $acceptedCount;

            $sheet->setCellValue("A{$row}", $rank);
            $sheet->setCellValue("B{$row}", $result->participant->full_name ?? '-');
            $sheet->setCellValue("C{$row}", $result->edas_score != null ? round($result->edas_score, 6) : '-');
            $sheet->setCellValue("D{$row}", $isAccepted ? 'DITERIMA' : 'TIDAK DITERIMA');

            $sheet->getStyle("A{$row}:D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

            if ($isAccepted) {
                $sheet->getStyle("A{$row}:D{$row}")->applyFromArray([
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'DCFCE7'],
                    ],
                ]);
            }

            $sheet->getStyle("A{$row}:D{$row}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color'       => ['rgb' => 'E2E8F0'],
                    ],
                ],
            ]);
        }

        // Summary row
        $summaryRow = count($results) + 3;
        $sheet->setCellValue("A{$summaryRow}", "Total Peserta: " . count($results));
        $sheet->setCellValue("C{$summaryRow}", "Diterima: {$acceptedCount}");
        $sheet->getStyle("A{$summaryRow}:D{$summaryRow}")->getFont()->setBold(true);

        $periodName = preg_replace('/[^a-zA-Z0-9_\- ]/', '', $period->name);
        $filename = "hasil_akhir_{$periodName}.xlsx";

        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment;filename=\"{$filename}\"");
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }
}
