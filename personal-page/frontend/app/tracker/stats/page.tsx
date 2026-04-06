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

interface CalendarCell {
  date: string;
  day: number;
  types: string[];
  isCurrentMonth: boolean;
  isFuture: boolean;
}

function buildCalendar(trainings: TrainingEntry[], viewDate: Date) {
  const byDay = new Map<string, string[]>();
  trainings.forEach((t) => {
    const day = toIsoDay(t.createdAt);
    const existing = byDay.get(day) ?? [];
    if (!existing.includes(t.type)) existing.push(t.type);
    byDay.set(day, existing);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const lastOfMonth  = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

  // Align grid start to Monday
  const startDow = firstOfMonth.getDay();
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - (startDow === 0 ? 6 : startDow - 1));

  // Align grid end to Sunday
  const endDow = lastOfMonth.getDay();
  const gridEnd = new Date(lastOfMonth);
  gridEnd.setDate(lastOfMonth.getDate() + (endDow === 0 ? 0 : 7 - endDow));

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const week: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const isCurrentMonth =
        cursor.getMonth() === viewDate.getMonth() &&
        cursor.getFullYear() === viewDate.getFullYear();
      const isFuture = cursor > today;
      week.push({
        date: iso,
        day: cursor.getDate(),
        types: isCurrentMonth && !isFuture ? (byDay.get(iso) ?? []) : [],
        isCurrentMonth,
        isFuture,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return {
    weeks,
    monthLabel: firstOfMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
  };
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
  const [targetWeight, setTargetWeight] = useState<string>("92");
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("targetWeight");
    if (saved) setTargetWeight(saved); // override default only if user has set it

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

  async function syncStrava() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        const n = json.data?.imported ?? 0;
        setSyncMsg(n > 0 ? `${n} new activit${n === 1 ? "y" : "ies"} imported.` : "Already up to date.");
        if (n > 0) {
          // refresh trainings
          const t = await fetch("/api/tracker/training").then((r) => r.json());
          setTrainings(t.data ?? []);
        }
      } else {
        setSyncMsg(json.error ?? "Sync failed.");
      }
    } catch {
      setSyncMsg("Network error.");
    }
    setSyncing(false);
  }

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
  const today      = new Date();
  const viewDate   = new Date(today.getFullYear(), today.getMonth() + calendarOffset, 1);
  const calendar   = buildCalendar(trainings, viewDate);
  const target     = parseFloat(targetWeight);

  // Count sessions per type for the viewed month
  const monthCounts = trainings.reduce<Record<string, number>>((acc, t) => {
    const d = new Date(t.createdAt);
    if (d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth()) {
      acc[t.type] = (acc[t.type] ?? 0) + 1;
    }
    return acc;
  }, {});
  const totalMonth = Object.values(monthCounts).reduce((s, v) => s + v, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)] px-4 pb-12 pt-8">
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
                      tick={false}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      axisLine={false} tickLine={false}
                      domain={[
                        (dataMin: number) => Math.floor(Math.min(dataMin, !isNaN(target) && target > 0 ? target : dataMin) - 1),
                        "auto",
                      ]}
                    />
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

            {/* Training calendar */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase">
                    Training log
                  </p>
                  <button
                    onClick={syncStrava}
                    disabled={syncing}
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {syncing ? "Syncing…" : "Sync Strava"}
                  </button>
                  {syncMsg && (
                    <span className="text-xs text-white/40">{syncMsg}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalendarOffset((o) => o - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Previous month"
                  >
                    ←
                  </button>
                  <p className="text-white/40 text-sm font-medium w-36 text-center">{calendar.monthLabel}</p>
                  <button
                    onClick={() => setCalendarOffset((o) => o + 1)}
                    disabled={calendarOffset >= 0}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Next month"
                  >
                    →
                  </button>
                </div>
              </div>
              {trainings.length === 0 ? (
                <p className="text-white/30 text-sm">No training entries yet.</p>
              ) : (
                <div className="flex gap-6 items-start">
                  {/* Calendar */}
                  <div className="flex-1 min-w-0">
                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="text-center text-xs text-white/20 font-[family-name:var(--font-geist-mono)] py-1">
                          {d}
                        </div>
                      ))}
                    </div>
                    {/* Weeks */}
                    {calendar.weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                        {week.map((cell) => {
                          const primary = cell.types[0] ?? null;
                          const multi   = cell.types.length > 1;
                          const tooltip = cell.types.length > 0
                            ? `${cell.date} — ${cell.types.join(", ")}`
                            : cell.date;
                          return (
                            <div
                              key={cell.date}
                              title={tooltip}
                              className="relative aspect-square rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                              style={{
                                backgroundColor: primary
                                  ? (TRAINING_COLORS[primary] ?? "#6b7280") + "33"
                                  : cell.isCurrentMonth && !cell.isFuture
                                  ? "rgba(255,255,255,0.03)"
                                  : "transparent",
                                border: primary
                                  ? `1px solid ${TRAINING_COLORS[primary] ?? "#6b7280"}66`
                                  : cell.isCurrentMonth && !cell.isFuture
                                  ? "1px solid rgba(255,255,255,0.05)"
                                  : "1px solid transparent",
                              }}
                            >
                              <span
                                className="text-xs font-medium select-none"
                                style={{
                                  color: primary
                                    ? TRAINING_COLORS[primary]
                                    : cell.isCurrentMonth && !cell.isFuture
                                    ? "rgba(255,255,255,0.4)"
                                    : "rgba(255,255,255,0.1)",
                                }}
                              >
                                {cell.day}
                              </span>
                              {multi && (
                                <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="w-36 shrink-0 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                    <p className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs uppercase tracking-widest">
                      {calendar.monthLabel.split(" ")[0]}
                    </p>
                    {Object.entries(TRAINING_COLORS).map(([type, color]) => {
                      const count = monthCounts[type] ?? 0;
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color + "33", border: `1px solid ${color}66` }} />
                            <span className="text-white/40 text-xs font-[family-name:var(--font-geist-mono)]">
                              {type.charAt(0) + type.slice(1).toLowerCase()}
                            </span>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: count > 0 ? color : "rgba(255,255,255,0.15)" }}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                      <span className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)]">Total</span>
                      <span className="text-sm font-bold text-white">{totalMonth}</span>
                    </div>
                  </div>
                </div>
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
