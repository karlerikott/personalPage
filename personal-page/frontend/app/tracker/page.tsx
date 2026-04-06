"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeightEntry   { id: number; weightKg: number; createdAt: string; }
interface FoodEntry     { id: number; kcal: number; description: string; createdAt: string; }
interface TrainingEntry { id: number; type: string; description: string | null; createdAt: string; }
type Range = "week" | "month" | "year" | "all";

// ─── Constants ───────────────────────────────────────────────────────────────

const TRAINING_TYPES = ["PADEL", "GYM", "RUNNING", "BIKE", "SWIMMING"] as const;
const TRAINING_COLORS: Record<string, string> = {
  PADEL: "#10b981", GYM: "#3b82f6", RUNNING: "#f97316",
  BIKE: "#eab308", SWIMMING: "#06b6d4",
};
const RANGES: { label: string; value: Range }[] = [
  { label: "Week", value: "week" }, { label: "Month", value: "month" },
  { label: "Year", value: "year" }, { label: "All", value: "all" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toIsoDay(iso: string) { return iso.slice(0, 10); }

function displayDate(isoDay: string) {
  const [y, m, d] = isoDay.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

function filterByRange<T extends { createdAt: string }>(items: T[], range: Range): T[] {
  if (range === "all") return items;
  const days = range === "week" ? 7 : range === "month" ? 30 : 365;
  const cutoff = new Date(Date.now() - days * 86400000);
  return items.filter((i) => new Date(i.createdAt) >= cutoff);
}

function calcStreak(weights: WeightEntry[]): number {
  if (!weights.length) return 0;
  const days = new Set(weights.map((w) => toIsoDay(w.createdAt)));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 86400000);
  let cursor = days.has(fmt(today)) ? new Date(today) : new Date(yesterday);
  if (!days.has(fmt(cursor))) return 0;
  let streak = 0;
  while (days.has(fmt(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function calcAvgKcal(food: FoodEntry[], days: number): number {
  const cutoff = new Date(Date.now() - days * 86400000);
  const filtered = food.filter((f) => new Date(f.createdAt) >= cutoff);
  const byDay = filtered.reduce<Record<string, number>>((acc, f) => {
    const d = toIsoDay(f.createdAt); acc[d] = (acc[d] ?? 0) + f.kcal; return acc;
  }, {});
  const n = Object.keys(byDay).length;
  return n === 0 ? 0 : Math.round(Object.values(byDay).reduce((s, v) => s + v, 0) / n);
}

interface CalendarCell { date: string; day: number; types: string[]; isCurrentMonth: boolean; isFuture: boolean; }

function buildCalendar(trainings: TrainingEntry[], viewDate: Date) {
  const byDay = new Map<string, string[]>();
  trainings.forEach((t) => {
    const day = toIsoDay(t.createdAt);
    const ex = byDay.get(day) ?? [];
    if (!ex.includes(t.type)) ex.push(t.type);
    byDay.set(day, ex);
  });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const last  = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const sd = first.getDay();
  const gridStart = new Date(first); gridStart.setDate(first.getDate() - (sd === 0 ? 6 : sd - 1));
  const ed = last.getDay();
  const gridEnd = new Date(last); gridEnd.setDate(last.getDate() + (ed === 0 ? 0 : 7 - ed));
  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const week: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const isCurrentMonth = cursor.getMonth() === viewDate.getMonth() && cursor.getFullYear() === viewDate.getFullYear();
      const isFuture = cursor > today;
      week.push({ date: iso, day: cursor.getDate(), types: isCurrentMonth && !isFuture ? (byDay.get(iso) ?? []) : [], isCurrentMonth, isFuture });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return { weeks, monthLabel: first.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) };
}

// ─── Nav sections ────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "weight",   label: "Weight" },
  { id: "calories", label: "Calories" },
  { id: "training", label: "Training" },
] as const;

type SectionId = typeof NAV_SECTIONS[number]["id"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Tracker() {
  // Data
  const [weights, setWeights]     = useState<WeightEntry[]>([]);
  const [food, setFood]           = useState<FoodEntry[]>([]);
  const [trainings, setTrainings] = useState<TrainingEntry[]>([]);
  const [loading, setLoading]     = useState(true);

  // Active nav section
  const [activeSection, setActiveSection] = useState<SectionId>("weight");
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({ weight: null, calories: null, training: null });

  // Chart controls
  const [weightRange, setWeightRange] = useState<Range>("all");
  const [kcalRange, setKcalRange]     = useState<Range>("month");
  const [targetWeight, setTargetWeight] = useState<string>("92");
  const [calendarOffset, setCalendarOffset] = useState(0);

  // Weight form
  const [weightInput, setWeightInput]   = useState("");
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightMsg, setWeightMsg]       = useState("");

  // Food form
  const [kcalInput, setKcalInput]       = useState("");
  const [foodDesc, setFoodDesc]         = useState("");
  const [foodSaving, setFoodSaving]     = useState(false);
  const [foodMsg, setFoodMsg]           = useState("");
  const [mfpSyncing, setMfpSyncing]     = useState(false);

  // Training form
  const [trainingType, setTrainingType] = useState<string>("GYM");
  const [trainingDesc, setTrainingDesc] = useState("");
  const [trainingSaving, setTrainingSaving] = useState(false);
  const [trainingMsg, setTrainingMsg]   = useState("");
  const [stravaSyncing, setStravaSyncing] = useState(false);
  const [stravaMsg, setStravaMsg]       = useState("");

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("targetWeight");
    if (saved) setTargetWeight(saved);
    refresh();
  }, []);

  // ── Active section via IntersectionObserver ────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the section with the greatest intersection ratio that is actually visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id as SectionId);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  async function refresh(which: "all" | "weight" | "food" | "training" = "all") {
    if (which === "all") setLoading(true);
    const fetches = {
      weight:   () => fetch("/api/tracker/weight").then((r) => r.json()).then((d) => setWeights(d.data ?? [])),
      food:     () => fetch("/api/tracker/food").then((r) => r.json()).then((d) => setFood(d.data ?? [])),
      training: () => fetch("/api/tracker/training").then((r) => r.json()).then((d) => setTrainings(d.data ?? [])),
    };
    if (which === "all") {
      await Promise.all(Object.values(fetches).map((f) => f()));
      setLoading(false);
    } else {
      await fetches[which]();
    }
  }

  // ── Submit handlers ────────────────────────────────────────────────────────
  async function saveWeight(e: React.FormEvent) {
    e.preventDefault();
    setWeightSaving(true); setWeightMsg("");
    const res = await fetch("/api/tracker/weight", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: Number(weightInput) }),
    });
    if (res.ok) { setWeightInput(""); setWeightMsg("Saved!"); await refresh("weight"); }
    else { const j = await res.json(); setWeightMsg(j.error ?? "Failed."); }
    setWeightSaving(false);
    setTimeout(() => setWeightMsg(""), 3000);
  }

  async function saveFood(e: React.FormEvent) {
    e.preventDefault();
    setFoodSaving(true); setFoodMsg("");
    const res = await fetch("/api/tracker/food", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kcal: Number(kcalInput), description: foodDesc }),
    });
    if (res.ok) { setKcalInput(""); setFoodDesc(""); setFoodMsg("Saved!"); await refresh("food"); }
    else { const j = await res.json(); setFoodMsg(j.error ?? "Failed."); }
    setFoodSaving(false);
    setTimeout(() => setFoodMsg(""), 3000);
  }

  async function saveTraining(e: React.FormEvent) {
    e.preventDefault();
    setTrainingSaving(true); setTrainingMsg("");
    const res = await fetch("/api/tracker/training", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: trainingType, description: trainingDesc || null }),
    });
    if (res.ok) { setTrainingDesc(""); setTrainingMsg("Saved!"); await refresh("training"); }
    else { const j = await res.json(); setTrainingMsg(j.error ?? "Failed."); }
    setTrainingSaving(false);
    setTimeout(() => setTrainingMsg(""), 3000);
  }

  async function syncStrava() {
    setStravaSyncing(true); setStravaMsg("");
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const j = await res.json();
      if (res.ok) {
        const n = j.data?.imported ?? 0;
        setStravaMsg(n > 0 ? `${n} imported.` : "Up to date.");
        if (n > 0) await refresh("training");
      } else { setStravaMsg(j.error ?? "Failed."); }
    } catch { setStravaMsg("Network error."); }
    setStravaSyncing(false);
  }

  async function syncMfp() {
    setMfpSyncing(true); setFoodMsg("");
    try {
      const res = await fetch("/api/mfp/sync?days=30", { method: "POST" });
      const j = await res.json();
      if (res.ok) {
        const n = j.data?.imported ?? 0;
        setFoodMsg(n > 0 ? `MFP: ${n} day${n === 1 ? "" : "s"} imported.` : "MFP: up to date.");
        if (n > 0) await refresh("food");
      } else { setFoodMsg(j.error ?? "MFP sync failed."); }
    } catch { setFoodMsg("Network error."); }
    setMfpSyncing(false);
    setTimeout(() => setFoodMsg(""), 4000);
  }

  function handleTargetWeight(val: string) {
    setTargetWeight(val);
    if (val) localStorage.setItem("targetWeight", val);
    else localStorage.removeItem("targetWeight");
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const weightData = filterByRange(weights, weightRange).map((w) => ({
    ts: new Date(w.createdAt).getTime(), weight: w.weightKg,
  }));

  const kcalByDay = Object.entries(
    filterByRange(food, kcalRange).reduce<Record<string, number>>((acc, e) => {
      const d = toIsoDay(e.createdAt); acc[d] = (acc[d] ?? 0) + e.kcal; return acc;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b)).map(([day, kcal]) => ({ date: displayDate(day), kcal }));

  const streak     = calcStreak(weights);
  const avgWeekly  = calcAvgKcal(food, 7);
  const avgMonthly = calcAvgKcal(food, 30);
  const today      = new Date();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const kcal = food.filter((f) => toIsoDay(f.createdAt) === iso).reduce((s, f) => s + f.kcal, 0);
    return { iso, label: d.toLocaleDateString("en-GB", { weekday: "short" }), day: d.getDate(), kcal };
  });
  const weekTotal = weekDays.reduce((s, d) => s + d.kcal, 0);
  const weekMax   = Math.max(...weekDays.map((d) => d.kcal), 1);

  const viewDate  = new Date(today.getFullYear(), today.getMonth() + calendarOffset, 1);
  const calendar  = buildCalendar(trainings, viewDate);
  const target    = parseFloat(targetWeight);

  const monthCounts = trainings.reduce<Record<string, number>>((acc, t) => {
    const d = new Date(t.createdAt);
    if (d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth())
      acc[t.type] = (acc[t.type] ?? 0) + 1;
    return acc;
  }, {});
  const totalMonth = Object.values(monthCounts).reduce((s, v) => s + v, 0);

  function scrollToSection(id: SectionId) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)] pb-16">

      {/* ── Sticky navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/20 hover:text-white/60 transition-colors" aria-label="Back to home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <span className="font-[family-name:var(--font-geist-mono)] text-white/40 text-xs tracking-widest uppercase select-none">Tracker</span>
          </div>

          {/* Section links */}
          <nav className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
            {NAV_SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeSection === id
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/70"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-10">

        {/* Page title */}
        <div className="mb-10">
          <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-1">Personal Tracker</p>
          <h1 className="text-2xl font-bold">Overview</h1>
        </div>

        {loading ? <p className="text-white/30 text-sm">Loading…</p> : (
          <div className="flex flex-col gap-16">

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Streak"         value={`${streak} days`}                              sub="consecutive weight logs" />
              <StatCard label="Avg kcal / week"  value={avgWeekly  > 0 ? avgWeekly.toLocaleString()  : "—"} sub="daily avg, last 7 days" />
              <StatCard label="Avg kcal / month" value={avgMonthly > 0 ? avgMonthly.toLocaleString() : "—"} sub="daily avg, last 30 days" />
            </div>

            {/* ── Weight ───────────────────────────────────────────────────── */}
            <section id="weight" ref={(el) => { sectionRefs.current.weight = el; }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase">Weight (kg)</p>
                <div className="flex items-center gap-3">
                  <input type="number" step="0.1" value={targetWeight} onChange={(e) => handleTargetWeight(e.target.value)}
                    placeholder="Goal kg"
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 text-xs" />
                  <RangeSelector value={weightRange} onChange={setWeightRange} />
                </div>
              </div>

              {/* Log weight */}
              <form onSubmit={saveWeight} className="flex items-center gap-2 mb-5">
                <input type="number" step="0.1" min="10" value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 91.5 kg"
                  className="w-36 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm" required />
                <button type="submit" disabled={weightSaving}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-colors disabled:opacity-40">
                  {weightSaving ? "Saving…" : "Log weight"}
                </button>
                {weightMsg && <span className={`text-xs ${weightMsg === "Saved!" ? "text-emerald-400" : "text-red-400"}`}>{weightMsg}</span>}
              </form>

              {weightData.length < 2 ? <p className="text-white/30 text-sm">Not enough data for this range.</p> : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="ts" scale="time" type="number" domain={["auto", "auto"]} tick={false} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false}
                      domain={[(dataMin: number) => Math.floor(Math.min(dataMin, !isNaN(target) && target > 0 ? target : dataMin) - 1), "auto"]} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} itemStyle={{ color: "#10b981" }}
                      labelFormatter={(ts) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
                    {!isNaN(target) && target > 0 && (
                      <ReferenceLine y={target} stroke="rgba(255,255,255,0.25)" strokeDasharray="6 3"
                        label={{ value: `Goal: ${target} kg`, fill: "rgba(255,255,255,0.3)", fontSize: 10, position: "insideTopRight" }} />
                    )}
                    <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>

            {/* ── Calories ─────────────────────────────────────────────────── */}
            <section id="calories" ref={(el) => { sectionRefs.current.calories = el; }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase">Calorie intake (kcal/day)</p>
                <RangeSelector value={kcalRange} onChange={setKcalRange} />
              </div>

              {/* Log food */}
              <form onSubmit={saveFood} className="flex flex-wrap items-center gap-2 mb-5">
                <input type="number" min="1" value={kcalInput} onChange={(e) => setKcalInput(e.target.value)}
                  placeholder="kcal"
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm" required />
                <input type="text" value={foodDesc} onChange={(e) => setFoodDesc(e.target.value)}
                  placeholder="Description"
                  className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm" required />
                <button type="submit" disabled={foodSaving}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-colors disabled:opacity-40">
                  {foodSaving ? "Saving…" : "Log food"}
                </button>
                <button type="button" onClick={syncMfp} disabled={mfpSyncing}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors disabled:opacity-40">
                  <svg className={`w-3 h-3 ${mfpSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {mfpSyncing ? "Syncing…" : "MFP"}
                </button>
                {foodMsg && <span className={`text-xs w-full ${foodMsg.startsWith("MFP") ? "text-white/40" : foodMsg === "Saved!" ? "text-emerald-400" : "text-red-400"}`}>{foodMsg}</span>}
              </form>

              <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0">
                  {kcalByDay.length === 0 ? <p className="text-white/30 text-sm">No food entries for this range.</p> : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={kcalByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                          labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} itemStyle={{ color: "#10b981" }} />
                        <Bar dataKey="kcal" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="w-36 shrink-0 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                  <p className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs uppercase tracking-widest mb-1">This week</p>
                  {weekDays.map(({ iso, label, day, kcal }) => (
                    <div key={iso} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs font-[family-name:var(--font-geist-mono)]">{label} <span className="text-white/20">{day}</span></span>
                        <span className={`text-xs font-semibold ${kcal > 0 ? "text-emerald-400" : "text-white/15"}`}>{kcal > 0 ? kcal.toLocaleString() : "—"}</span>
                      </div>
                      {kcal > 0 && (
                        <div className="h-0.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500/50" style={{ width: `${Math.round((kcal / weekMax) * 100)}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-2 mt-1 flex items-center justify-between">
                    <span className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)]">Total</span>
                    <span className="text-sm font-bold text-white">{weekTotal > 0 ? weekTotal.toLocaleString() : "—"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Training ─────────────────────────────────────────────────── */}
            <section id="training" ref={(el) => { sectionRefs.current.training = el; }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase">Training log</p>
                  <button onClick={syncStrava} disabled={stravaSyncing}
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1 rounded-md transition-colors disabled:opacity-40">
                    <svg className={`w-3 h-3 ${stravaSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {stravaSyncing ? "Syncing…" : "Sync Strava"}
                  </button>
                  {stravaMsg && <span className="text-xs text-white/40">{stravaMsg}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCalendarOffset((o) => o - 1)} aria-label="Previous month"
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-colors">←</button>
                  <p className="text-white/40 text-sm font-medium w-36 text-center">{calendar.monthLabel}</p>
                  <button onClick={() => setCalendarOffset((o) => o + 1)} disabled={calendarOffset >= 0} aria-label="Next month"
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">→</button>
                </div>
              </div>

              {/* Log training */}
              <form onSubmit={saveTraining} className="flex flex-wrap items-center gap-2 mb-5">
                <div className="flex flex-wrap gap-1.5">
                  {TRAINING_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setTrainingType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors font-[family-name:var(--font-geist-mono)] ${trainingType === t ? "text-black" : "bg-white/5 border border-white/10 text-white/40 hover:text-white/70"}`}
                      style={trainingType === t ? { backgroundColor: TRAINING_COLORS[t], borderColor: TRAINING_COLORS[t] } : {}}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                <input type="text" value={trainingDesc} onChange={(e) => setTrainingDesc(e.target.value)}
                  placeholder="Note (optional)"
                  className="flex-1 min-w-[120px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm" />
                <button type="submit" disabled={trainingSaving}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-colors disabled:opacity-40">
                  {trainingSaving ? "Saving…" : "Log training"}
                </button>
                {trainingMsg && <span className={`text-xs ${trainingMsg === "Saved!" ? "text-emerald-400" : "text-red-400"}`}>{trainingMsg}</span>}
              </form>

              {trainings.length === 0 ? <p className="text-white/30 text-sm">No training entries yet.</p> : (
                <div className="flex gap-6 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="text-center text-xs text-white/20 font-[family-name:var(--font-geist-mono)] py-1">{d}</div>
                      ))}
                    </div>
                    {calendar.weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                        {week.map((cell) => {
                          const hasTraining = cell.types.length > 0;
                          return (
                            <div key={cell.date} title={hasTraining ? `${cell.date} — ${cell.types.join(", ")}` : cell.date}
                              className="rounded-lg p-1.5 flex flex-col gap-1 min-h-[52px] transition-opacity hover:opacity-80"
                              style={{
                                backgroundColor: cell.isCurrentMonth && !cell.isFuture ? "rgba(255,255,255,0.03)" : "transparent",
                                border: cell.isCurrentMonth && !cell.isFuture ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
                              }}>
                              <span className="text-xs font-medium select-none leading-none"
                                style={{ color: hasTraining ? "rgba(255,255,255,0.7)" : cell.isCurrentMonth && !cell.isFuture ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)" }}>
                                {cell.day}
                              </span>
                              {cell.types.map((type) => (
                                <div key={type} className="rounded px-1 py-0.5 text-[9px] font-semibold truncate leading-none font-[family-name:var(--font-geist-mono)]"
                                  style={{ backgroundColor: (TRAINING_COLORS[type] ?? "#6b7280") + "33", color: TRAINING_COLORS[type] ?? "#6b7280", border: `1px solid ${TRAINING_COLORS[type] ?? "#6b7280"}55` }}>
                                  {type.charAt(0) + type.slice(1).toLowerCase()}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="w-36 shrink-0 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                    <p className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs uppercase tracking-widest">{calendar.monthLabel.split(" ")[0]}</p>
                    {Object.entries(TRAINING_COLORS).map(([type, color]) => {
                      const count = monthCounts[type] ?? 0;
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color + "33", border: `1px solid ${color}66` }} />
                            <span className="text-white/40 text-xs font-[family-name:var(--font-geist-mono)]">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: count > 0 ? color : "rgba(255,255,255,0.15)" }}>{count}</span>
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
            </section>

          </div>
        )}

        {/* Spacer so the Training section can scroll into the IntersectionObserver active zone */}
        <div className="h-[50vh]" aria-hidden />
      </div>
    </main>
  );
}


// ─── Sub-components ───────────────────────────────────────────────────────────

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
        <button key={r.value} onClick={() => onChange(r.value)}
          className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${value === r.value ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>
          {r.label}
        </button>
      ))}
    </div>
  );
}
