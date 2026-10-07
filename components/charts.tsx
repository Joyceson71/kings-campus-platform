"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from "recharts";
import { attendanceSeries, departmentSeries } from "@/lib/data";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(2,4,8,0.96)",
        border: "1px solid rgba(0,255,200,0.2)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 0 30px rgba(0,255,200,0.1)"
      }}
    >
      <p style={{ color: "#00ffe0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const DeptTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(2,4,8,0.96)",
        border: "1px solid rgba(255,236,0,0.2)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 0 30px rgba(255,236,0,0.08)"
      }}
    >
      <p style={{ color: "#ffec00", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#fff", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
        Score: <strong style={{ color: "#ffec00" }}>{payload[0]?.value}</strong>
      </p>
    </div>
  );
};

const barColors = ["#00ffe0", "#ff0aff", "#ffec00", "#9d00ff", "#0080ff", "#ff6b00"];

export function AttendanceChart() {
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={attendanceSeries} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="grad-present" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00ffe0" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00ffe0" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="grad-late" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffec00" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ffec00" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="grad-absent" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff453a" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ff453a" stopOpacity={0.0} />
            </linearGradient>
            <filter id="glow-cyan">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(0,255,200,0.05)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="rgba(120,160,200,0.3)"
            tick={{ fill: "rgba(120,160,200,0.6)", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(120,160,200,0.3)"
            tick={{ fill: "rgba(120,160,200,0.6)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="present"
            name="Present"
            stroke="#00ffe0"
            fill="url(#grad-present)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#00ffe0", stroke: "#000", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="late"
            name="Late"
            stroke="#ffec00"
            fill="url(#grad-late)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: "#ffec00", stroke: "#000", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="absent"
            name="Absent"
            stroke="#ff453a"
            fill="url(#grad-absent)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: "#ff453a", stroke: "#000", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[["#00ffe0", "Present"], ["#ffec00", "Late"], ["#ff453a", "Absent"]].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 20, height: 2, background: color, borderRadius: 1, boxShadow: `0 0 4px ${color}` }} />
            <span style={{ fontSize: 11, color: "rgba(120,160,200,0.6)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DepartmentChart() {
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={departmentSeries} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} barSize={28}>
          <defs>
            {departmentSeries.map((_, i) => (
              <linearGradient key={i} id={`bar-grad-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={barColors[i]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={barColors[i]} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(255,236,0,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(120,160,200,0.3)"
            tick={{ fill: "rgba(120,160,200,0.6)", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(120,160,200,0.3)"
            tick={{ fill: "rgba(120,160,200,0.6)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
            tickLine={false}
            axisLine={false}
            domain={[60, 100]}
          />
          <Tooltip content={<DeptTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey="score" name="Score" radius={[8, 8, 0, 0]}>
            {departmentSeries.map((_, i) => (
              <Cell
                key={i}
                fill={`url(#bar-grad-${i})`}
                style={{ filter: `drop-shadow(0 0 8px ${barColors[i]}60)` }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
