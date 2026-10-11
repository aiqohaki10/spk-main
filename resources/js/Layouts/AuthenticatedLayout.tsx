import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, assessment_periods, active_period_id, active_period } = usePage().props as any;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const handleSwitchPeriod = (periodId: number) => {
        router.post(route('periods.switch'), { period_id: periodId });
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                                        <ApplicationLogo className="block h-5 w-auto fill-current text-white" />
                                    </div>
                                    <span className="font-bold text-slate-900 tracking-tight hidden sm:block uppercase">SPK LPKS</span>
                                </Link>
                            </div>

                            <div className="hidden space-x-1 sm:-my-px sm:flex h-16">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('periods.index')}
                                    active={route().current('periods.*')}
                                >
                                    Sesi Penilaian
                                </NavLink>
                                {active_period && (
                                    <NavLink
                                        href={route('pipeline.index', active_period.route_key)}
                                        active={route().current('pipeline.*')}
                                    >
                                        Alur Penilaian
                                    </NavLink>
                                )}
                                <NavLink
                                    href={route('participants.index')}
                                    active={route().current('participants.*')}
                                >
                                    Peserta
                                </NavLink>

                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center gap-4">
                            {/* Period Selector */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                {active_period?.name || 'Pilih Periode'}
                                                <svg
                                                    className="h-3 w-3 opacity-50"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="64">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Sesi Penilaian</p>
                                        </div>
                                        {assessment_periods?.map((period: any) => (
                                            <button
                                                key={period.id}
                                                onClick={() => handleSwitchPeriod(period.id)}
                                                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between group ${
                                                    active_period_id === period.id 
                                                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                            >
                                                <span>{period.name}</span>
                                                {active_period_id === period.id && (
                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                        <div className="border-t border-slate-100 mt-1">
                                            <Dropdown.Link href={route('periods.index')} className="text-indigo-600 font-medium">
                                                Kelola Semua Periode
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-3 group focus:outline-none">
                                            <div className="flex flex-col items-end mr-1">
                                                <span className="text-sm font-semibold text-slate-900 leading-none">{user.name}</span>
                                                <span className="text-[10px] text-slate-500 font-medium mt-1">Administrator</span>
                                            </div>
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-indigo-300 transition-colors">
                                                <span className="text-xs font-bold text-slate-600">{user.name.charAt(0)}</span>
                                            </div>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Keluar
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition duration-150 ease-in-out hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden border-t border-slate-100'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('periods.index')}
                            active={route().current('periods.*')}
                        >
                            Sesi Penilaian
                        </ResponsiveNavLink>
                        {active_period && (
                            <ResponsiveNavLink
                                href={route('pipeline.index', active_period.route_key)}
                                active={route().current('pipeline.*')}
                            >
                                Alur Penilaian
                            </ResponsiveNavLink>
                        )}
                        <ResponsiveNavLink
                            href={route('participants.index')}
                            active={route().current('participants.*')}
                        >
                            Peserta
                        </ResponsiveNavLink>

                    </div>

                    <div className="border-t border-slate-200 pb-1 pt-4 bg-slate-50">
                        <div className="px-4">
                            <div className="text-base font-medium text-slate-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-slate-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Pengaturan Profil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="text-red-600"
                            >
                                Keluar
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b border-slate-200">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
