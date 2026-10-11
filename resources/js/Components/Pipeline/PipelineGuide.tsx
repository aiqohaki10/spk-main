import { useState } from 'react';
import GuideButton from './GuideButton';
import GuideModal from './GuideModal';
import {
    PIPELINE_GUIDES,
    PipelineGuideContent,
    PipelineGuidePhaseKey,
} from './pipelineGuides';

interface PipelineGuideProps {
    phaseKey: PipelineGuidePhaseKey;
    title?: string;
    content?: PipelineGuideContent;
}

export default function PipelineGuide({ phaseKey, title, content }: PipelineGuideProps) {
    const [open, setOpen] = useState(false);
    const guide = PIPELINE_GUIDES[phaseKey];

    return (
        <>
            <GuideButton onClick={() => setOpen(true)} title={`Buka panduan ${title ?? guide.title}`} />
            <GuideModal
                open={open}
                onClose={() => setOpen(false)}
                title={title ?? guide.title}
                content={content ?? guide.content}
            />
        </>
    );
}
