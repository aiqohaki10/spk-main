import Breadcrumbs from '@/Components/Breadcrumbs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ active_period }: any) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        pre_test_score: '',
        report_score: '',
        domicile_distance_km: '',
        interview_grade: '',
        work_readiness_grade: '',
        notes: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('participants.store'));
    };

    return (
        <AuthenticatedLayout 
            header={
                <div>
                    <Breadcrumbs items={[{ label: 'Peserta', href: route('participants.index') }, { label: 'Tambah Baru' }]} />
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Tambah Peserta Baru
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">
                        Masukkan data profil dan nilai awal untuk peserta pada periode <span className="font-semibold text-indigo-600">{active_period?.name}</span>.
                    </p>
                </div>
            }
        >
            <Head title="Tambah Peserta Baru" />

            <div className="max-w-4xl space-y-6 pb-20">
                <form onSubmit={submit} className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 1: Profil */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Informasi Profil</h3>
                            
                            <div>
                                <InputLabel htmlFor="full_name" value="Nama Lengkap" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" />
                                <TextInput
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    value={data.full_name}
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-2xl py-4"
                                    isFocused={true}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="Masukkan nama lengkap..."
                                    required
                                />
                                <InputError message={errors.full_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value="Catatan Tambahan" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={data.notes}
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-2xl py-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[120px]"
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Catatan kecil mengenai peserta..."
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>
                        </div>

                        {/* Section 2: Nilai Awal */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Parameter Penilaian</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="pre_test_score" value="Skor Pre-Test" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" />
                                    <TextInput
                                        id="pre_test_score"
                                        type="number"
                                        name="pre_test_score"
                                        value={data.pre_test_score}
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-2xl"
                                        onChange={(e) => setData('pre_test_score', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.pre_test_score} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="report_score" value="Nilai Rapor" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" />
                                    <TextInput
                                        id="report_score"
                                        type="number"
                                        name="report_score"
                                        value={data.report_score}
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-2xl"
                                        onChange={(e) => setData('report_score', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.report_score} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="interview_grade" value="Wawancara (Skor 1-5)" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" />
                                <select
                                    id="interview_grade"
                                    className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-2xl py-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                    value={data.interview_grade}
                                    onChange={(e) => setData('interview_grade', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Skor...</option>
                                    <option value="5">5 — Sangat Komunikatif</option>
                                    <option value="4">4 — Komunikatif</option>
                                    <option value="3">3 — Cukup Komunikatif</option>
                                    <option value="2">2 — Kurang Komunikatif</option>
                                    <option value="1">1 — Tidak Komunikatif</option>
                                </select>
                                <InputError message={errors.interview_grade} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="domicile_distance_km" value="Jarak Domisili (km)" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" />
                                    <TextInput
                                        id="domicile_distance_km"
                                        type="number"
                                        name="domicile_distance_km"
                                        value={data.domicile_distance_km}
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-2xl"
                                        onChange={(e) => setData('domicile_distance_km', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.domicile_distance_km} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="work_readiness_grade" value="Kesiapan Pelatihan (Skor 1-5)" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" />
                                    <select
                                        id="work_readiness_grade"
                                        className="mt-1 block w-full bg-slate-50 border-slate-200 rounded-2xl py-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                        value={data.work_readiness_grade}
                                        onChange={(e) => setData('work_readiness_grade', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Skor...</option>
                                        <option value="5">5 — Sangat Siap</option>
                                        <option value="4">4 — Siap</option>
                                        <option value="3">3 — Cukup Siap</option>
                                        <option value="2">2 — Kurang Siap</option>
                                        <option value="1">1 — Tidak Siap</option>
                                    </select>
                                    <InputError message={errors.work_readiness_grade} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <Link href={route('participants.index')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                            Kembali ke Daftar
                        </Link>
                        <PrimaryButton className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black shadow-xl shadow-indigo-100" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Data Peserta'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
