import Breadcrumbs from '@/Components/Breadcrumbs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmModal from '@/Components/UI/ConfirmModal';

export default function Index({ periods, active_period_id }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [resetTarget, setResetTarget] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: false
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('periods.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const handleReset = () => {
        if (!resetTarget) return;
        router.post(route('periods.reset', resetTarget.route_key), {}, {
            onSuccess: () => setResetTarget(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('periods.destroy', deleteTarget.route_key), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const stepLabels: Record<string, string> = {
        setup: 'Konfigurasi',
        scoring: 'Input Nilai',
        bwm: 'BWM',
        edas: 'EDAS',
        copeland: 'Copeland',
        completed: 'Selesai',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Breadcrumbs items={[{ label: 'Manajemen Periode' }]} />
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Sesi Penilaian
                        </h2>
                        <p className="text-slate-500 mt-1 text-sm">
                            Kelola sesi atau periode penilaian SPK yang berbeda untuk berbagai kebutuhan seleksi.
                        </p>
                    </div>
                    <div>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Sesi Baru
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Periode" />

            <div className="space-y-6 text-slate-900 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {periods.map((period: any) => (
                        <div 
                            key={period.id} 
                            className={`bg-white rounded-xl p-6 border ${active_period_id === period.id ? 'border-indigo-400 ring-1 ring-indigo-100 shadow-md' : 'border-slate-200 shadow-sm'} transition-all group`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active_period_id === period.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'} transition-all`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                {active_period_id === period.id && (
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold uppercase tracking-wider rounded border border-indigo-100">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="text-base font-semibold text-slate-900 mb-1 truncate">{period.name}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                {period.description || 'Tidak ada deskripsi.'}
                            </p>
                            
                            <div className="space-y-1.5 mb-5">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Mulai: {period.start_date || 'Belum diatur'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span>Alur: {stepLabels[period.pipeline_status] || period.pipeline_status} (Tahap {period.current_step}/6)</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                {/* Main Action */}
                                <Link 
                                    href={route('pipeline.index', period.route_key)} 
                                    className={`w-full text-center py-2.5 rounded-lg text-xs font-medium transition-colors ${
                                        active_period_id === period.id 
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {active_period_id === period.id ? 'Buka Alur' : 'Pilih & Buka'}
                                </Link>
                                
                                {/* Secondary Actions */}
                                <div className="flex gap-2">
                                    <Link 
                                        href={route('periods.edit', period.route_key)} 
                                        className="flex-1 text-center py-2 rounded-lg text-xs font-medium bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setResetTarget(period)}
                                        className="flex-1 text-center py-2 rounded-lg text-xs font-medium bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(period)}
                                        className="py-2 px-3 rounded-lg text-xs text-rose-500 border border-rose-200 hover:bg-rose-50 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add Card */}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition-all group min-h-[280px]"
                    >
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-3 group-hover:border-indigo-200 transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="font-medium text-xs">Tambah Sesi Baru</span>
                    </button>
                </div>

                {/* Create Modal */}
                <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="2xl">
                    <form onSubmit={submit} className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Buat Periode Baru</h3>
                        <p className="text-slate-500 text-sm mb-6">Buat wadah baru untuk variabel penilaian SPK yang berbeda.</p>
                        
                        <div className="space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Sesi / Periode" className="text-xs font-medium text-slate-600 mb-1.5" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="block w-full rounded-lg border-slate-300 py-2.5"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Seleksi Calon Karyawan 2024"
                                    required
                                />
                                <InputError message={errors.name} className="mt-1.5" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Deskripsi (Opsional)" className="text-xs font-medium text-slate-600 mb-1.5" />
                                <textarea
                                    id="description"
                                    className="block w-full rounded-lg border-slate-300 py-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan tujuan dari sesi penilaian ini..."
                                />
                                <InputError message={errors.description} className="mt-1.5" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="start_date" value="Tanggal Mulai" className="text-xs font-medium text-slate-600 mb-1.5" />
                                    <TextInput id="start_date" type="date" className="block w-full rounded-lg border-slate-300" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="end_date" value="Tanggal Selesai" className="text-xs font-medium text-slate-600 mb-1.5" />
                                    <TextInput id="end_date" type="date" className="block w-full rounded-lg border-slate-300" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsCreateModalOpen(false)} className="rounded-lg px-4">Batal</SecondaryButton>
                            <PrimaryButton className="rounded-lg px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                                Simpan Sesi
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Reset Confirmation */}
                <ConfirmModal
                    show={!!resetTarget}
                    onClose={() => setResetTarget(null)}
                    onConfirm={handleReset}
                    title="Reset Sesi Penilaian"
                    message={`Ini akan menghapus semua data peserta, skor, dan hasil perhitungan (BWM/EDAS/Copeland) untuk "${resetTarget?.name}". Kriteria yang sudah dikonfigurasi akan tetap dipertahankan. Tindakan ini tidak dapat dibatalkan.`}
                    confirmLabel="Reset Data"
                    variant="warning"
                />

                {/* Delete Confirmation */}
                <ConfirmModal
                    show={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    title="Hapus Periode"
                    message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Semua data terkait (kriteria, peserta, skor, perhitungan) akan ikut terhapus secara permanen.`}
                    confirmLabel="Hapus Permanen"
                />
            </div>
        </AuthenticatedLayout>
    );
}
