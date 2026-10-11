import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { PipelineGuideContent } from './pipelineGuides';

interface GuideModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    content: PipelineGuideContent;
}

export default function GuideModal({ open, onClose, title, content }: GuideModalProps) {
    return (
        <Modal show={open} onClose={onClose} maxWidth="5xl">
            <div className="flex max-h-[90vh] flex-col">
                <div className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">Guide</p>
                                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
                                </div>
                            </div>
                            {content.summary && (
                                <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                                    <p className="text-sm leading-relaxed text-slate-700">{content.summary}</p>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-slate-300 hover:bg-white hover:text-slate-600"
                            aria-label="Tutup panduan"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    <div className="space-y-4">
                        {content.sections.map((section, sectionIndex) => (
                            <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                                        {sectionIndex + 1}
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">{section.title}</h3>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {section.items.map((item, itemIndex) => (
                                        <div key={item} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                                                {itemIndex + 1}
                                            </div>
                                            <p className="text-sm leading-relaxed text-slate-600">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {content.note && (
                        <div className="mt-6 flex gap-3 rounded-3xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
                            <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="leading-relaxed">{content.note}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6">
                    <SecondaryButton onClick={onClose} className="!px-8 !py-2.5">
                        Tutup
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
