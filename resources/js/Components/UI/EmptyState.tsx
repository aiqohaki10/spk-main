import { PropsWithChildren } from 'react';

interface Props {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
    return (
        <div className="py-16 text-center">
            {icon ? (
                <div className="flex justify-center mb-4">
                    {icon}
                </div>
            ) : (
                <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
            )}
            <p className="font-semibold text-sm text-slate-500">{title}</p>
            {description && (
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">{description}</p>
            )}
            {action && (
                <div className="mt-4">{action}</div>
            )}
        </div>
    );
}
