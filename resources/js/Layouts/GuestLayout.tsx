import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <div className="flex flex-col items-center gap-3">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">SPK LPKS</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">Penerimaan Peserta LPKS</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
