import { Head, usePage } from '@inertiajs/react';
import PipelineLayout from '@/Layouts/PipelineLayout';
import StepIndicator from '@/Components/Pipeline/StepIndicator';
import FlashMessage from '@/Components/UI/FlashMessage';
import SetupStep from './Steps/SetupStep';
import ScoringStep from './Steps/ScoringStep';
import BwmStep from './Steps/BwmStep';
import EdasStep from './Steps/EdasStep';
import TieBreakingStep from './Steps/TieBreakingStep';
import ResultStep from './Steps/ResultStep';
import { useState } from 'react';

const STEPS = [
    { key: 'setup', label: 'Kriteria', stepNumber: 1, description: 'Setup' },
    { key: 'scoring', label: 'Peserta', stepNumber: 2, description: 'Input' },
    { key: 'bwm', label: 'BWM', stepNumber: 3, description: 'Bobot' },
    { key: 'edas', label: 'EDAS', stepNumber: 4, description: 'Skor' },
    { key: 'tieBreaking', label: 'Tie Breaking', stepNumber: 5, description: 'Seri' },
    { key: 'result', label: 'Hasil', stepNumber: 6, description: 'Final' },
];

export default function PipelineIndex({ period, pipelineState, stepData, completedRuns, finalResults }: any) {
    const { flash } = usePage<any>().props;
    const [activeStep, setActiveStep] = useState(Math.min(pipelineState.currentStep - 1, 5));
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goToStep = (index: number) => {
        if (index > pipelineState.currentStep - 1 && index > activeStep) {
            if (index > pipelineState.currentStep) {
                return;
            }
        }

        setIsTransitioning(true);
        setTimeout(() => {
            setActiveStep(index);
            setIsTransitioning(false);
        }, 150);
    };

    const StepComponents = [SetupStep, ScoringStep, BwmStep, EdasStep, TieBreakingStep, ResultStep];
    const ActiveStepComponent = StepComponents[activeStep];

    return (
        <PipelineLayout period={period} pipelineState={pipelineState}>
            <Head title={`Alur Penilaian - ${period.name}`} />

            <div className="space-y-5">
                {(flash as any)?.success && (
                    <FlashMessage type="success" message={(flash as any).success} />
                )}
                {(flash as any)?.error && (
                    <FlashMessage type="error" message={(flash as any).error} />
                )}

                <StepIndicator
                    steps={STEPS}
                    activeStep={activeStep}
                    completedStep={pipelineState.currentStep - 1}
                    onStepClick={goToStep}
                />

                <div
                    className={`
                        transition-all duration-150 ease-in-out
                        ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
                    `}
                >
                    <ActiveStepComponent
                        period={period}
                        stepData={stepData}
                        completedRuns={completedRuns}
                        pipelineState={pipelineState}
                        finalResults={finalResults}
                        onNavigateStep={goToStep}
                    />
                </div>
            </div>
        </PipelineLayout>
    );
}
