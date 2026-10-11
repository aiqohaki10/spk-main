import Breadcrumbs from '@/Components/Breadcrumbs';
import ParticipantImportModal from '@/Components/Participants/ParticipantImportModal';
import FlashMessage from '@/Components/UI/FlashMessage';
import EmptyState from '@/Components/UI/EmptyState';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ participants, filters, active_period }: any) {
    const { flash } = usePage<any>().props;
    const { data, links, meta } = participants;
    const [search, setSearch] = useState(filters.search || '');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('participants.index'), { search }, { preserveState: true });
    };

    const handleDelete = (participant: any) => {
        if (confirm('Apakah Anda yakin ingin menghapus data peserta ini? Semua data terkait (skor) juga akan terhapus.')) {
            router.delete(route('participants.destroy', participant.route_key));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Breadcrumbs items={[{ label: 'Peserta' }]} />
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Peserta</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
                        >
                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import XLSX
                        </button>
                        <Link
                            href={route('participants.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Peserta
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Daftar Peserta" />

            <div className="space-y-6">
                {(flash as any)?.success && <FlashMessage type="success" message={(flash as any).success} />}
                {(flash as any)?.error && <FlashMessage type="error" message={(flash as any).error} />}

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)_minmax(220px,1fr)]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari peserta"
                                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm leading-5 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </form>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Periode aktif</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{active_period?.name || 'Belum dipilih'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total peserta</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{meta?.total || data.length}</p>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Pre-Test</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Wawancara</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Rapor</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Jarak Domisili</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Kesiapan Pelatihan</th>
                                    <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <EmptyState
                                                title="Belum ada peserta"
                                                description="Import Excel atau tambah data manual."
                                            />
                                        </td>
                                    </tr>
                                ) : data.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.full_name}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">ID: #{p.id.toString().padStart(4, '0')}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-bold text-slate-700">{p.pre_test_score}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100">
                                                {p.interview_grade}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-slate-700">
                                            {p.report_score}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap">
                                            {p.domicile_distance_km} km
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.work_readiness_grade}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                                            <Link 
                                                href={route('participants.edit', p.route_key)} 
                                                className="inline-flex items-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Data"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(p)} 
                                                className="inline-flex items-center p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Hapus Data"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {links && links.length > 3 && (
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-center gap-2">
                            {links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`
                                        min-w-[40px] h-10 flex items-center justify-center px-4 rounded-xl text-sm font-bold transition-all
                                        ${link.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}
                                        ${!link.url && 'opacity-30 cursor-not-allowed pointer-events-none'}
                                    `}
                                    dangerouslySetInnerHTML={{ __html: link.label }} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                <ParticipantImportModal
                    open={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    importHref={route('participants.import')}
                    templateHref={route('participants.template')}
                    title="Import peserta"
                />
            </div>
        </AuthenticatedLayout>
    );
}
