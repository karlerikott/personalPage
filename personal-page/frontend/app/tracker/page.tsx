"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "food" | "training" | "weight";

const TRAINING_TYPES = ["PADEL", "GYM", "RUNNING", "BIKE", "SWIMMING"] as const;

export default function Tracker() {
  const [tab, setTab] = useState<Tab>("food");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Food form
  const [kcal, setKcal] = useState("");
  const [foodDesc, setFoodDesc] = useState("");

  // Training form
  const [trainingType, setTrainingType] = useState<string>(TRAINING_TYPES[0]);
  const [trainingDesc, setTrainingDesc] = useState("");

  // Weight form
  const [weight, setWeight] = useState("");

  function resetFeedback() {
    setSuccess("");
    setError("");
  }

  async function submitFood(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    resetFeedback();
    const res = await fetch("/api/tracker/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kcal: Number(kcal), description: foodDesc }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Food entry saved.");
      setKcal("");
      setFoodDesc("");
    } else {
      setError("Failed to save entry.");
    }
  }

  async function submitTraining(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    resetFeedback();
    const res = await fetch("/api/tracker/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: trainingType, description: trainingDesc || null }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Training entry saved.");
      setTrainingDesc("");
    } else {
      setError("Failed to save entry.");
    }
  }

  async function submitWeight(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    resetFeedback();
    const res = await fetch("/api/tracker/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: Number(weight) }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Weight entry saved.");
      setWeight("");
    } else {
      setError("Failed to save entry.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)] px-4 pb-12 pt-8">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-white/30 text-xs tracking-widest uppercase mb-1">
              Personal Tracker
            </p>
            <h1 className="text-2xl font-bold">Log entry</h1>
          </div>
          <Link
            href="/tracker/stats"
            className="text-sm text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg"
          >
            Stats →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-8">
          {(["food", "training", "weight"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); resetFeedback(); }}
              className={`flex-1 py-2 text-sm rounded-md transition-colors capitalize font-medium ${
                tab === t
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Food form */}
        {tab === "food" && (
          <form onSubmit={submitFood} className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-[family-name:var(--font-geist-mono)] block mb-2">
                Calories (kcal)
              </label>
              <input
                type="number"
                min="1"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                placeholder="e.g. 650"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-[family-name:var(--font-geist-mono)] block mb-2">
                Description
              </label>
              <input
                type="text"
                value={foodDesc}
                onChange={(e) => setFoodDesc(e.target.value)}
                placeholder="e.g. Chicken rice bowl"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm"
                required
              />
            </div>
            <SubmitButton loading={loading} />
          </form>
        )}

        {/* Training form */}
        {tab === "training" && (
          <form onSubmit={submitTraining} className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-[family-name:var(--font-geist-mono)] block mb-2">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAINING_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrainingType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      trainingType === t
                        ? "bg-emerald-500 text-black"
                        : "bg-white/5 border border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-[family-name:var(--font-geist-mono)] block mb-2">
                Description <span className="text-white/20 normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={trainingDesc}
                onChange={(e) => setTrainingDesc(e.target.value)}
                placeholder="e.g. 45 min session"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm"
              />
            </div>
            <SubmitButton loading={loading} />
          </form>
        )}

        {/* Weight form */}
        {tab === "weight" && (
          <form onSubmit={submitWeight} className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest font-[family-name:var(--font-geist-mono)] block mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 78.5"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 text-sm"
                required
              />
            </div>
            <SubmitButton loading={loading} />
          </form>
        )}

        {/* Feedback */}
        {success && <p className="mt-4 text-emerald-400 text-sm">{success}</p>}
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>
    </main>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors text-sm"
    >
      {loading ? "Saving..." : "Save entry"}
    </button>
  );
}
