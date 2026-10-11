import Breadcrumbs from '@/Components/Breadcrumbs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ totalParticipants, totalActiveCriteria, active_period }: any) {
    const { pipeline_state } = usePage().props as any;

    const stepLabels: Record<string, string> = {
        setup: 'Kriteria',
        scoring: 'Peserta & Nilai',
        bwm: 'BWM',
        edas: 'EDAS',
        copeland: 'Copeland',
        completed: 'Selesai',
    };

    const stepProgress = pipeline_state ? Math.round(((pipeline_state.current_step - 1) / 5) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Breadcrumbs items={[]} />
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h2>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-indigo-50" />
                        <div className="relative z-10">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Periode aktif</p>
                                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                        {active_period?.name || 'Belum ada periode aktif'}
                                    </h3>
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                            {pipeline_state ? stepLabels[pipeline_state.status] || pipeline_state.status : 'Belum dimulai'}
                                        </span>
                                        {pipeline_state && (
                                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                                Tahap {pipeline_state.current_step}/6
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {active_period ? (
                                        <>
                                            <Link
                                                href={route('pipeline.index', active_period.route_key)}
                                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                                            >
                                                Buka pipeline
                                            </Link>
                                            <Link
                                                href={route('periods.index')}
                                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                            >
                                                Kelola periode
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            href={route('periods.index')}
                                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                                        >
                                            Buat periode
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {pipeline_state && (
                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Progress</div>
                                        <div className="mt-2 text-2xl font-bold text-slate-900">{stepProgress}%</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tahap aktif</div>
                                        <div className="mt-2 text-2xl font-bold text-slate-900">{pipeline_state.current_step}/6</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</div>
                                        <div className="mt-2 text-base font-bold text-slate-900">
                                            {stepLabels[pipeline_state.status] || pipeline_state.status}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Peserta</p>
                                <Link href={route('participants.index')} className="text-sm font-semibold text-indigo-600">
                                    Kelola
                                </Link>
                            </div>
                            <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalParticipants}</div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Kriteria</p>
                                <Link
                                    href={active_period ? route('pipeline.index', active_period.route_key) : route('periods.index')}
                                    className="text-sm font-semibold text-indigo-600"
                                >
                                    Lihat
                                </Link>
                            </div>
                            <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalActiveCriteria}</div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
                            <div className="mt-3 text-xl font-bold text-slate-900">
                                {active_period ? 'Periode siap dikerjakan' : 'Menunggu periode aktif'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Link
                        href={route('participants.index')}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
                    >
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</p>
                        <h3 className="mt-3 text-lg font-bold text-slate-900">Peserta</h3>
                    </Link>

                    <Link
                        href={active_period ? route('pipeline.index', active_period.route_key) : route('periods.index')}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
                    >
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</p>
                        <h3 className="mt-3 text-lg font-bold text-slate-900">Pipeline</h3>
                    </Link>

                    <Link
                        href={route('periods.index')}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
                    >
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Aksi</p>
                        <h3 className="mt-3 text-lg font-bold text-slate-900">Periode</h3>
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
