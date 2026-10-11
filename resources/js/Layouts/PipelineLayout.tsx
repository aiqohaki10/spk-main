import { Link, usePage, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PropsWithChildren, useState } from 'react';

interface PipelineLayoutProps {
    period: any;
    pipelineState: any;
}

export default function PipelineLayout({
    period,
    pipelineState,
    children,
}: PropsWithChildren<PipelineLayoutProps>) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const [confirmingReset, setConfirmingReset] = useState(false);

    const stepProgress = Math.round(((pipelineState.currentStep - 1) / 4) * 100);

    const handleReset = () => {
        router.post(route('periods.reset', period.route_key), {}, {
            onFinish: () => setConfirmingReset(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Link href={route('dashboard')} className="group flex items-center gap-2">
                                <div className="rounded-lg bg-indigo-600 p-1.5 transition-colors group-hover:bg-indigo-700">
                                    <ApplicationLogo className="block h-4 w-auto fill-current text-white" />
                                </div>
                                <span className="hidden text-sm font-bold tracking-tight text-slate-900 sm:block">SPK LPKS</span>
                            </Link>

                            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

                            <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                                <Link href={route('dashboard')} className="transition-colors hover:text-slate-600">
                                    Dashboard
                                </Link>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <Link href={route('periods.index')} className="transition-colors hover:text-slate-600">
                                    Periode
                                </Link>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="max-w-[220px] truncate font-bold text-indigo-600">{period.name}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                <span className="hidden text-[10px] font-black uppercase tracking-widest text-indigo-600 sm:inline">
                                    Tahap {pipelineState.currentStep}/5
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 sm:hidden">
                                    {pipelineState.currentStep}/5
                                </span>
                            </div>

                            <button
                                onClick={() => setConfirmingReset(true)}
                                className="flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-600 transition-all hover:bg-rose-100"
                                title="Reset alur untuk periode ini"
                            >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="hidden uppercase tracking-widest lg:inline">Reset alur</span>
                            </button>

                            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                                    style={{ width: `${stepProgress}%` }}
                                />
                            </div>

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 transition-colors hover:border-indigo-300 focus:outline-none">
                                            <span className="text-xs font-bold text-slate-600">{user.name.charAt(0)}</span>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <div className="border-b border-slate-100 px-4 py-2">
                                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                            <p className="text-[10px] text-slate-400">{user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Keluar
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-5 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl font-bold text-slate-900">{period.name}</h1>
                                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                                        Tahap {pipelineState.currentStep}/5
                                    </span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-slate-500">{pipelineState.statusLabel}</p>
                            </div>
                            <div className="flex flex-col gap-2 sm:min-w-[280px]">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                                    <span>Progress</span>
                                    <span>{stepProgress}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 transition-all duration-700"
                                        style={{ width: `${stepProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {children}
                </div>
            </main>

            <Modal show={confirmingReset} onClose={() => setConfirmingReset(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Reset Seluruh Alur Penilaian?
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Tindakan ini akan menghapus seluruh data peserta, nilai kriteria, dan hasil perhitungan (BWM dan EDAS) untuk periode <span className="font-bold text-slate-900">{period.name}</span>.
                        Data kriteria inti tidak akan dihapus. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingReset(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleReset}>
                            Ya, Reset Sekarang
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
