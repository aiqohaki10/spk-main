import Breadcrumbs from '@/Components/Breadcrumbs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ period }: any) {
    const { data, setData, put, processing, errors } = useForm({
        name: period.name || '',
        description: period.description || '',
        start_date: period.start_date || '',
        end_date: period.end_date || '',
        is_active: period.is_active || false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('periods.update', period.route_key));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Breadcrumbs
                        items={[
                            { label: 'Sesi Penilaian', href: route('periods.index') },
                            { label: 'Edit' }
                        ]}
                    />
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Edit Periode</h2>
                    <p className="text-slate-500 mt-1 text-sm">Perbarui informasi untuk <span className="text-indigo-600 font-semibold">{period.name}</span>.</p>
                </div>
            }
        >
            <Head title={`Edit ${period.name}`} />

            <div className="max-w-2xl pb-20">
                <form onSubmit={submit} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Sesi" className="text-xs font-medium text-slate-600 mb-1.5" />
                        <TextInput
                            id="name"
                            type="text"
                            className="block w-full rounded-lg border-slate-300 py-2.5"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Deskripsi" className="text-xs font-medium text-slate-600 mb-1.5" />
                        <textarea
                            id="description"
                            className="block w-full rounded-lg border-slate-300 py-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="start_date" value="Tanggal Mulai" className="text-xs font-medium text-slate-600 mb-1.5" />
                            <TextInput id="start_date" type="date" className="block w-full rounded-lg border-slate-300" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel htmlFor="end_date" value="Tanggal Selesai" className="text-xs font-medium text-slate-600 mb-1.5" />
                            <TextInput id="end_date" type="date" className="block w-full rounded-lg border-slate-300" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-slate-600">Tandai sebagai periode aktif</label>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Link
                            href={route('periods.index')}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Kembali
                        </Link>
                        <PrimaryButton className="rounded-lg px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
