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

type Range = "week" | "month" | "year" | "all";

function toIsoDay(iso: string) {
  return iso.slice(0, 10); // "YYYY-MM-DD" — used as grouping key, includes year
}

function displayDate(isoDay: string) {
  const [year, month, day] = isoDay.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

function filterByRange<T extends { createdAt: string }>(items: T[], range: Range): T[] {
  if (range === "all") return items;
  const now = new Date();
  const days = range === "week" ? 7 : range === "month" ? 30 : 365;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return items.filter((i) => new Date(i.createdAt) >= cutoff);
}

const RANGES: { label: string; value: Range }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

export default function TrackerStats() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [food, setFood] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weightRange, setWeightRange] = useState<Range>("all");
  const [kcalRange, setKcalRange] = useState<Range>("month");

  useEffect(() => {
    Promise.all([
      fetch("/api/tracker/weight").then((r) => r.json()),
      fetch("/api/tracker/food").then((r) => r.json()),
    ]).then(([w, f]) => {
      setWeights(w.data ?? []);
      setFood(f.data ?? []);
      setLoading(false);
    });
  }, []);

  const weightData = filterByRange(weights, weightRange).map((w) => ({
    date: displayDate(toIsoDay(w.createdAt)),
    weight: w.weightKg,
  }));

  const kcalByDay = Object.entries(
    filterByRange(food, kcalRange).reduce<Record<string, number>>((acc, entry) => {
      const day = toIsoDay(entry.createdAt); // YYYY-MM-DD — year-aware grouping
      acc[day] = (acc[day] ?? 0) + entry.kcal;
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, kcal]) => ({ date: displayDate(day), kcal }));

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
          <Link
            href="/tracker"
            className="text-sm text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg"
          >
            ← Log entry
          </Link>
        </div>

        {loading ? (
          <p className="text-white/30 text-sm">Loading...</p>
        ) : (
          <div className="flex flex-col gap-16">

            {/* Weight chart */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase">
                  Weight (kg)
                </p>
                <RangeSelector value={weightRange} onChange={setWeightRange} />
              </div>
              {weightData.length < 2 ? (
                <p className="text-white/30 text-sm">Not enough data for this range.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      itemStyle={{ color: "#10b981" }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Calorie chart */}
            <div>
              <div className="flex items-center justify-between mb-6">
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

          </div>
        )}
      </div>
    </main>
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
