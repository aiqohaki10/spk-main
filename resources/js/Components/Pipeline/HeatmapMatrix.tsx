interface Props {
    title: string;
    headers: string[];
    rows: {
        label: string;
        values: number[];
    }[];
    colorScale?: 'green-red' | 'blue-orange';
}

export default function HeatmapMatrix({ title, headers, rows, colorScale = 'green-red' }: Props) {
    const allValues = rows.flatMap(r => r.values);
    const maxVal = Math.max(...allValues, 0.001);
    const minVal = Math.min(...allValues, 0);

    const getColor = (value: number) => {
        const range = maxVal - minVal;
        const normalized = range > 0 ? (value - minVal) / range : 0.5;

        if (colorScale === 'green-red') {
            // Low = red-ish, High = green-ish
            const r = Math.round(240 - normalized * 180);
            const g = Math.round(80 + normalized * 140);
            const b = Math.round(80);
            return `rgba(${r}, ${g}, ${b}, ${0.08 + normalized * 0.18})`;
        }
        // blue-orange
        const hue = Math.round(220 - normalized * 180);
        return `hsla(${hue}, 75%, 55%, ${0.08 + normalized * 0.15})`;
    };

    const getTextColor = (value: number) => {
        const range = maxVal - minVal;
        const normalized = range > 0 ? (value - minVal) / range : 0.5;
        return normalized > 0.6 ? 'text-emerald-700' : normalized > 0.3 ? 'text-slate-600' : 'text-rose-600';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">{title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {rows.length} × {headers.length}
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="py-3 px-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                                Peserta
                            </th>
                            {headers.map(h => (
                                <th key={h} className="py-3 px-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[80px]">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-700 whitespace-nowrap text-xs sticky left-0 bg-white z-10 border-r border-slate-100">
                                    {row.label}
                                </td>
                                {row.values.map((val, j) => (
                                    <td
                                        key={j}
                                        className={`py-3 px-4 text-center font-mono text-xs font-bold transition-colors ${getTextColor(val)}`}
                                        style={{ backgroundColor: getColor(val) }}
                                    >
                                        {val.toFixed(4)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
