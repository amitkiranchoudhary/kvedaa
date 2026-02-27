import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="border border-forest-border/30 p-3.5 rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 33, 15, 0.97), rgba(10, 23, 10, 0.99))',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(12px)',
                }}>
                <p className="text-forest-muted/60 text-xs font-medium mb-1 uppercase tracking-wider">{label}</p>
                <p className="text-forest-cream text-lg font-bold flex items-end gap-1">
                    {payload[0].value} <span className="text-xs text-forest-muted/50 font-medium mb-0.5">{payload[0].unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

const LiveChart = ({ data, metric, color = "#52b788", unit = "" }) => {
    return (
        <div className="h-[320px] w-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pl-6 pr-6 pt-6">
                <h3 className="text-sm font-bold text-forest-muted uppercase tracking-widest">{metric}</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                    style={{
                        background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.06), rgba(74, 222, 128, 0.03))',
                        borderColor: 'rgba(82, 183, 136, 0.12)',
                    }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse"
                        style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }} />
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#254025" vertical={false} opacity={0.25} />
                        <XAxis
                            dataKey="timestamp"
                            hide
                            padding={{ left: 0, right: 0 }}
                        />
                        <YAxis
                            stroke="#254025"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#7aaf7a', fontSize: 10 }}
                            width={45}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#254025', strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#color${metric})`}
                            unit={unit}
                            isAnimationActive={false}
                            activeDot={{
                                r: 5,
                                strokeWidth: 0,
                                fill: '#faf5eb',
                                style: { filter: 'drop-shadow(0 0 6px rgba(250, 245, 235, 0.5))' }
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LiveChart;
