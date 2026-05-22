import { useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

const THEME = {
  HeartRate: { stroke: "#e11d48", fill: "#fecdd3" },
  SpO2: { stroke: "#0891b2", fill: "#a5f3fc" },
  Temperature: { stroke: "#d97706", fill: "#fde68a" },
};

function LineChartCard({ title, value, unit, data, dataKey }) {
  const [hovered, setHovered] = useState(false);
  const theme = THEME[dataKey] || THEME.SpO2;

  return (
    <div
      className={`card-hover rounded-2xl border bg-white p-5 shadow-md transition-all ${
        hovered ? "border-cyan-200 ring-2 ring-cyan-100" : "border-slate-100"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-800">
            {value}
            <span className="ml-1 text-base font-medium text-slate-400">{unit}</span>
          </p>
        </div>
        <span
          className="h-3 w-3 rounded-full transition-transform duration-300"
          style={{
            backgroundColor: theme.stroke,
            transform: hovered ? "scale(1.5)" : "scale(1)",
          }}
        />
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={theme.stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={40} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              fontWeight: 600,
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={theme.stroke}
            strokeWidth={hovered ? 3.5 : 2.5}
            fill={`url(#g-${dataKey})`}
            dot={{ r: hovered ? 4 : 2, fill: theme.stroke }}
            activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartCard;
