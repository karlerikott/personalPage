"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";

interface WeightEntry {
  id: number;
  weightKg: number;
  createdAt: string;
}

interface FoodEntry {
  id: number;
  kcal: number;
  description: string;
  createdAt: string;
}

interface TrainingEntry {
  id: number;
  type: string;
  description: string | null;
  createdAt: string;
}

type Range = "week" | "month" | "year" | "all";

const TRAINING_COLORS: Record<string, string> = {
  PADEL:    "#10b981",
  GYM:      "#3b82f6",
  RUNNING:  "#f97316",
  BIKE:     "#eab308",
  SWIMMING: "#06b6d4",
};

function toIsoDay(iso: string) {
  return iso.slice(0, 10);
}

function displayDate(isoDay: string) {
  const [year, month, day] = isoDay.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

function filterByRange<T extends { createdAt: string }>(items: T[], range: Range): T[] {
  if (range === "all") return items;
  const days = range === "week" ? 7 : range === "month" ? 30 : 365;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return items.filter((i) => new Date(i.createdAt) >= cutoff);
}

function calcStreak(weights: WeightEntry[]): number {
  if (weights.length === 0) return 0;
  const days = new Set(weights.map((w) => toIsoDay(w.createdAt)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 86400000);
  // Allow today not logged yet — start from yesterday if today is missing
  let cursor = days.has(fmt(today)) ? new Date(today) : new Date(yesterday);
  if (!days.has(fmt(cursor))) return 0;
  let streak = 0;
  while (days.has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calcAvgKcal(food: FoodEntry[], days: number): number {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const filtered = food.filter((f) => new Date(f.createdAt) >= cutoff);
  const byDay = filtered.reduce<Record<string, number>>((acc, f) => {
    const d = toIsoDay(f.createdAt);
    acc[d] = (acc[d] ?? 0) + f.kcal;
    return acc;
  }, {});
  const daysWithData = Object.keys(byDay).length;
  if (daysWithData === 0) return 0;
  return Math.round(Object.values(byDay).reduce((s, v) => s + v, 0) / daysWithData);
}

function buildHeatmap(trainings: TrainingEntry[]) {
  const byDay = new Map<string, string>();
  [...trainings].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((t) => byDay.set(toIsoDay(t.createdAt), t.type));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align start to Monday 26 weeks ago
  const start = new Date(today);
  start.setDate(today.getDate() - 26 * 7);
  const dow = start.getDay();
  start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));

  const weeks: { date: string; type: string | null }[][] = [];
  for (let w = 0; w < 27; w++) {
    const week: { date: string; type: string | null }[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + w * 7 + d);
      if (cell > today) break;
      const iso = cell.toISOString().slice(0, 10);
      week.push({ date: iso, type: byDay.get(iso) ?? null });
    }
    if (week.length > 0) weeks.push(week);
  }
  return weeks;
}

const RANGES: { label: string; value: Range }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

export default function TrackerStats() {
  const [weights, setWeights]     = useState<WeightEntry[]>([]);
  const [food, setFood]           = useState<FoodEntry[]>([]);
  const [trainings, setTrainings] = useState<TrainingEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [weightRange, setWeightRange] = useState<Range>("all");
  const [kcalRange, setKcalRange]     = useState<Range>("month");
  const [targetWeight, setTargetWeight] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("targetWeight");
    if (saved) setTargetWeight(saved);

    Promise.all([
      fetch("/api/tracker/weight").then((r) => r.json()),
      fetch("/api/tracker/food").then((r) => r.json()),
      fetch("/api/tracker/training").then((r) => r.json()),
    ]).then(([w, f, t]) => {
      setWeights(w.data ?? []);
      setFood(f.data ?? []);
      setTrainings(t.data ?? []);
      setLoading(false);
    });
  }, []);

  function handleTargetWeight(val: string) {
    setTargetWeight(val);
    if (val) localStorage.setItem("targetWeight", val);
    else localStorage.removeItem("targetWeight");
  }

  const weightData = filterByRange(weights, weightRange).map((w) => ({
    ts: new Date(w.createdAt).getTime(),
    weight: w.weightKg,
  }));

  const kcalByDay = Object.entries(
    filterByRange(food, kcalRange).reduce<Record<string, number>>((acc, entry) => {
      const day = toIsoDay(entry.createdAt);
      acc[day] = (acc[day] ?? 0) + entry.kcal;
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, kcal]) => ({ date: displayDate(day), kcal }));

  const streak     = calcStreak(weights);
  const avgWeekly  = calcAvgKcal(food, 7);
  const avgMonthly = calcAvgKcal(food, 30);
  const heatmap    = buildHeatmap(trainings);
  const target     = parseFloat(targetWeight);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)] px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-1">
              Personal Tracker
            </p>
            <h1 className="text-2xl font-bold">Stats</h1>
          </div>
          <Link href="/tracker" className="text-sm text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg">
            ← Log entry
          </Link>
        </div>

        {loading ? (
          <p className="text-white/30 text-sm">Loading...</p>
        ) : (
          <div className="flex flex-col gap-16">

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Streak" value={`${streak} days`} sub="consecutive weight logs" />
              <StatCard label="Avg kcal / week" value={avgWeekly > 0 ? avgWeekly.toLocaleString() : "—"} sub="daily average, last 7 days" />
              <StatCard label="Avg kcal / month" value={avgMonthly > 0 ? avgMonthly.toLocaleString() : "—"} sub="daily average, last 30 days" />
            </div>

            {/* Weight chart */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase">
                  Weight (kg)
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => handleTargetWeight(e.target.value)}
                    placeholder="Goal kg"
                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 text-xs"
                  />
                  <RangeSelector value={weightRange} onChange={setWeightRange} />
                </div>
              </div>
              {weightData.length < 2 ? (
                <p className="text-white/30 text-sm">Not enough data for this range.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="ts"
                      scale="time"
                      type="number"
                      domain={["auto", "auto"]}
                      tickFormatter={(ts) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      axisLine={false} tickLine={false} interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      itemStyle={{ color: "#10b981" }}
                      labelFormatter={(ts) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    />
                    {!isNaN(target) && target > 0 && (
                      <ReferenceLine
                        y={target}
                        stroke="rgba(255,255,255,0.25)"
                        strokeDasharray="6 3"
                        label={{ value: `Goal: ${target} kg`, fill: "rgba(255,255,255,0.3)", fontSize: 10, position: "insideTopRight" }}
                      />
                    )}
                    <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Calorie chart */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase">
                  Calorie intake (kcal/day)
                </p>
                <RangeSelector value={kcalRange} onChange={setKcalRange} />
              </div>
              {kcalByDay.length === 0 ? (
                <p className="text-white/30 text-sm">No food entries for this range.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={kcalByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      itemStyle={{ color: "#10b981" }}
                    />
                    <Bar dataKey="kcal" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Training heatmap */}
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-6">
                Training log — last 6 months
              </p>
              {trainings.length === 0 ? (
                <p className="text-white/30 text-sm">No training entries yet.</p>
              ) : (
                <>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-1">
                      {heatmap.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                          {week.map((cell) => (
                            <div
                              key={cell.date}
                              title={cell.type ? `${cell.date} — ${cell.type}` : cell.date}
                              className="w-3 h-3 rounded-sm transition-opacity hover:opacity-80"
                              style={{
                                backgroundColor: cell.type
                                  ? TRAINING_COLORS[cell.type] ?? "#6b7280"
                                  : "rgba(255,255,255,0.05)",
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {Object.entries(TRAINING_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)]">
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/30 text-xs">{sub}</p>
    </div>
  );
}

function RangeSelector({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
            value === r.value ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
