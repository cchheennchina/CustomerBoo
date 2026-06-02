"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface HealthDonutProps {
  score: number;
  label?: string;
}

export function HealthDonut({ score, label = "综合健康" }: HealthDonutProps) {
  const data = [
    { name: "score", value: score },
    { name: "rest", value: Math.max(0, 100 - score) },
  ];

  return (
    <div className="relative h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffb347" />
              <stop offset="100%" stopColor="#7c5cff" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            innerRadius={58}
            outerRadius={78}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="url(#healthGradient)" />
            <Cell fill="rgba(255,255,255,0.08)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-white/60">{label}</span>
      </div>
    </div>
  );
}
