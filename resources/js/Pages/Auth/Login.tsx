import { useState, FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleAutoFill = () => {
        setData({
            email: 'a@a.com',
            password: '123',
            remember: true,
        });
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
            <Head title="Masuk - SPK Penerimaan Peserta LPKS" />

            {/* Left Hero / Brand Pane (Desktop) */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 p-2 shadow-lg shadow-indigo-500/20">
                            <ApplicationLogo className="h-full w-full fill-current text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-black tracking-wider text-white">SPK LPKS</span>
                            <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                                Decision Support System
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 my-auto max-w-lg space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        Sistem Penilaian Terstruktur
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Penerimaan Peserta Berbasis Multi-Kriteria
                    </h1>

                    <p className="text-sm leading-relaxed text-slate-400">
                        Platform evaluasi dan perangkingan seleksi peserta LPKS menggunakan integrasi algoritma Best-Worst Method (BWM), EDAS, Copeland Score, dan Analisis Sensitivitas Spearman.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3.5 backdrop-blur-sm">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Tahap 1-3</div>
                            <div className="mt-1 text-xs font-bold text-slate-200">BWM Weighting</div>
                            <div className="mt-0.5 text-[11px] text-slate-500">Optimasi bobot kriteria terstruktur</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3.5 backdrop-blur-sm">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Tahap 4-5</div>
                            <div className="mt-1 text-xs font-bold text-slate-200">EDAS & Copeland</div>
                            <div className="mt-0.5 text-[11px] text-slate-500">Evaluasi jarak & pairwise ranking</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} SPK LPKS &middot; PT. Sangkolo Mitra Teknologi
                </div>
            </div>

            {/* Right Form Pane */}
            <div className="flex w-full flex-col justify-between p-6 sm:p-12 lg:w-1/2">
                <div className="flex items-center justify-between lg:hidden">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 p-1.5">
                            <ApplicationLogo className="h-full w-full fill-current text-white" />
                        </div>
                        <span className="text-sm font-black text-slate-900">SPK LPKS</span>
                    </div>
                    <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Admin Portal
                    </span>
                </div>

                <div className="mx-auto my-auto w-full max-w-md py-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            Masuk ke Portal
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Gunakan akun administrator untuk mengakses panel penilaian.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="email">
                                Alamat Email
                            </label>
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="nama@email.com"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="password">
                                    Kata Sandi
                                </label>
                            </div>
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData(
                                            'remember',
                                            (e.target.checked || false) as false,
                                        )
                                    }
                                />
                                <span className="text-xs font-semibold text-slate-600 select-none">
                                    Ingat sesi saya
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-500/10 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Masuk ke Sistem
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick helper for default admin credentials */}
                    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Akun Administrator Default</div>
                                <div className="mt-0.5 text-xs font-mono font-medium text-slate-700">
                                    a@a.com &middot; 123
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAutoFill}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-600 shadow-sm transition hover:bg-slate-50"
                            >
                                Isi Otomatis
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center text-[11px] text-slate-400 lg:hidden">
                    &copy; {new Date().getFullYear()} SPK LPKS &middot; PT. Sangkolo Mitra Teknologi
                </div>
            </div>
        </div>
    );
}
