<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\EDAS\EdasCalculationService;
use App\Models\Criterion;
use App\Models\Participant;
use App\Models\ParticipantScore;

class EdasCalculationServiceTest extends TestCase
{
    protected EdasCalculationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new EdasCalculationService();
    }

    public function test_c4_distance_as_benefit_rewards_closer_participants(): void
    {
        // Define C4 as benefit (converted 1-5 score)
        $c4 = new Criterion([
            'code' => 'C4',
            'name' => 'Jarak Domisili',
            'attribute_type' => 'benefit',
        ]);
        $c4->id = 4;

        $criteria = collect([$c4]);
        $weights = ['C4' => 1.0];

        // Participant 1: Near (0-5 km, score 5)
        $p1 = new Participant(['full_name' => 'Dian Puspita']);
        $p1->id = 1;
        $p1->setRelation('scores', collect([
            new ParticipantScore(['criterion_id' => 4, 'raw_value' => 5]),
        ]));

        // Participant 2: Far (>40 km, score 1)
        $p2 = new Participant(['full_name' => 'Sari Widyastuti']);
        $p2->id = 2;
        $p2->setRelation('scores', collect([
            new ParticipantScore(['criterion_id' => 4, 'raw_value' => 1]),
        ]));

        $result = $this->service->calculateWithMatrices(
            collect([$p1, $p2]),
            $criteria,
            $weights
        );

        // Average should be (5 + 1) / 2 = 3.0
        $this->assertEquals(3.0, $result['average_solution']['C4']);

        // Dian (score 5, near) should have positive distance (PDA > 0) and zero NDA
        $pdaP1 = collect($result['pda_matrix'])->firstWhere('participant_id', 1)['C4'];
        $ndaP1 = collect($result['nda_matrix'])->firstWhere('participant_id', 1)['C4'];
        $this->assertGreaterThan(0, $pdaP1);
        $this->assertEquals(0.0, $ndaP1);

        // Sari (score 1, far) should have zero PDA and positive negative distance (NDA > 0)
        $pdaP2 = collect($result['pda_matrix'])->firstWhere('participant_id', 2)['C4'];
        $ndaP2 = collect($result['nda_matrix'])->firstWhere('participant_id', 2)['C4'];
        $this->assertEquals(0.0, $pdaP2);
        $this->assertGreaterThan(0, $ndaP2);

        // Dian should rank higher than Sari
        $scores = $result['appraisal_scores'];
        $this->assertEquals(1, $scores[0]['participant_id']);
        $this->assertEquals(2, $scores[1]['participant_id']);
        $this->assertGreaterThan($scores[1]['score'], $scores[0]['score']);
    }
}
