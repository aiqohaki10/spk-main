<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Sensitivity\SensitivityAnalysisService;
use App\Services\EDAS\EdasCalculationService;
use App\Services\Copeland\CopelandScoreService;
use App\Models\Criterion;
use App\Models\Participant;
use App\Models\ParticipantScore;
use Illuminate\Support\Collection;

class SensitivityAnalysisServiceTest extends TestCase
{
    protected SensitivityAnalysisService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SensitivityAnalysisService(
            new EdasCalculationService(),
            new CopelandScoreService()
        );
    }

    public function test_spearman_correlation_perfect_match(): void
    {
        $baseline = [
            1 => ['rank' => 1, 'participant_name' => 'Peserta A'],
            2 => ['rank' => 2, 'participant_name' => 'Peserta B'],
            3 => ['rank' => 3, 'participant_name' => 'Peserta C'],
        ];

        $scenario = [
            1 => ['scenario_rank' => 1],
            2 => ['scenario_rank' => 2],
            3 => ['scenario_rank' => 3],
        ];

        $rs = $this->service->calculateSpearmanCorrelation($baseline, $scenario);
        $this->assertEquals(1.0, $rs);
    }

    public function test_spearman_correlation_reversed_ranks(): void
    {
        $baseline = [
            1 => ['rank' => 1, 'participant_name' => 'Peserta A'],
            2 => ['rank' => 2, 'participant_name' => 'Peserta B'],
            3 => ['rank' => 3, 'participant_name' => 'Peserta C'],
        ];

        $scenario = [
            1 => ['scenario_rank' => 3],
            2 => ['scenario_rank' => 2],
            3 => ['scenario_rank' => 1],
        ];

        $rs = $this->service->calculateSpearmanCorrelation($baseline, $scenario);
        $this->assertEquals(-1.0, $rs);
    }

    public function test_full_analysis_workflow(): void
    {
        // Mock criteria
        $c1 = new Criterion(['code' => 'C1', 'name' => 'Tes Tertulis', 'attribute_type' => 'benefit']);
        $c1->id = 1;
        $c2 = new Criterion(['code' => 'C2', 'name' => 'Wawancara', 'attribute_type' => 'benefit']);
        $c2->id = 2;
        $c3 = new Criterion(['code' => 'C3', 'name' => 'Praktik', 'attribute_type' => 'benefit']);
        $c3->id = 3;

        $criteria = collect([$c1, $c2, $c3]);

        // Mock participants with scores
        $p1 = new Participant(['full_name' => 'Ahmad']);
        $p1->id = 101;
        $p1->setRelation('scores', collect([
            new ParticipantScore(['criterion_id' => 1, 'raw_value' => 85]),
            new ParticipantScore(['criterion_id' => 2, 'raw_value' => 90]),
            new ParticipantScore(['criterion_id' => 3, 'raw_value' => 80]),
        ]));

        $p2 = new Participant(['full_name' => 'Budi']);
        $p2->id = 102;
        $p2->setRelation('scores', collect([
            new ParticipantScore(['criterion_id' => 1, 'raw_value' => 70]),
            new ParticipantScore(['criterion_id' => 2, 'raw_value' => 75]),
            new ParticipantScore(['criterion_id' => 3, 'raw_value' => 95]),
        ]));

        $p3 = new Participant(['full_name' => 'Citra']);
        $p3->id = 103;
        $p3->setRelation('scores', collect([
            new ParticipantScore(['criterion_id' => 1, 'raw_value' => 60]),
            new ParticipantScore(['criterion_id' => 2, 'raw_value' => 65]),
            new ParticipantScore(['criterion_id' => 3, 'raw_value' => 60]),
        ]));

        $participants = collect([$p1, $p2, $p3]);

        $baselineWeights = [
            'C1' => 0.50,
            'C2' => 0.30,
            'C3' => 0.20,
        ];

        $baselineRankings = [
            ['participant_id' => 101, 'participant_name' => 'Ahmad', 'final_rank' => 1, 'copeland_score' => 2, 'edas_score' => 0.85],
            ['participant_id' => 102, 'participant_name' => 'Budi', 'final_rank' => 2, 'copeland_score' => 0, 'edas_score' => 0.65],
            ['participant_id' => 103, 'participant_name' => 'Citra', 'final_rank' => 3, 'copeland_score' => -2, 'edas_score' => 0.20],
        ];

        $result = $this->service->analyze($participants, $criteria, $baselineWeights, $baselineRankings);

        $this->assertArrayHasKey('baseline', $result);
        $this->assertArrayHasKey('scenarios', $result);
        $this->assertArrayHasKey('summary', $result);

        $this->assertNotEmpty($result['scenarios']);
        $this->assertGreaterThan(0, $result['summary']['total_scenarios']);
        $this->assertIsFloat($result['summary']['average_spearman']);
        $this->assertNotEmpty($result['summary']['conclusion_text']);
    }
}
