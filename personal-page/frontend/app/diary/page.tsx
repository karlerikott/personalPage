"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  { id: "situation",  label: "Situation",  color: "text-violet-400" },
  { id: "diagnosis",  label: "What's happening", color: "text-blue-400" },
  { id: "shifts",     label: "Mindset shifts", color: "text-emerald-400" },
  { id: "thoughts",   label: "Intrusive thoughts", color: "text-amber-400" },
  { id: "reminders",  label: "Daily reminders", color: "text-rose-400" },
  { id: "ruby",       label: "Talking to Ruby", color: "text-cyan-400" },
  { id: "timeline",   label: "Healing timeline", color: "text-indigo-400" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/5 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <p className={`font-[family-name:var(--font-geist-mono)] text-xs tracking-widest uppercase mb-4 ${color}`}>
      {children}
    </p>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
      <p className="text-white/70 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Callout({ children, color = "violet" }: { children: React.ReactNode; color?: string }) {
  const border = color === "violet" ? "border-violet-500/20 bg-violet-500/5" :
                 color === "emerald" ? "border-emerald-500/20 bg-emerald-500/5" :
                 color === "amber"   ? "border-amber-500/20 bg-amber-500/5" :
                 color === "rose"    ? "border-rose-500/20 bg-rose-500/5" :
                 "border-white/10 bg-white/5";
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm leading-relaxed text-white/80 ${border}`}>
      {children}
    </div>
  );
}

function Reminder({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex gap-3 items-start py-2 border-b border-white/5 last:border-0">
      <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-400/60" />
      </div>
      <div>
        <p className="text-white/80 text-sm">{text}</p>
        {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Phase({ num, title, time, items }: { num: number; title: string; time: string; items: string[] }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-1">
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-[family-name:var(--font-geist-mono)] text-white/40 shrink-0">
          {num}
        </div>
        <div className="w-px flex-1 bg-white/5" />
      </div>
      <div className="pb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-white/80 text-sm font-semibold">{title}</p>
          <span className="font-[family-name:var(--font-geist-mono)] text-white/25 text-xs">{time}</span>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          {items.map((item, i) => <Insight key={i} text={item} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiaryPage() {
  const [date] = useState(() =>
    new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-geist-sans)] px-4 pb-24 pt-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs tracking-widest uppercase mb-2">{date}</p>
          <h1 className="text-3xl font-bold mb-2">Getting past retroactive jealousy</h1>
          <p className="text-white/40 text-sm">A reference for when things feel hard. Come back to this.</p>
        </div>

        <div className="flex flex-col gap-12">

          {/* ── Situation ──────────────────────────────────────────────────── */}
          <section id={SECTIONS[0].id}>
            <SectionLabel color={SECTIONS[0].color}>Situation</SectionLabel>
            <Card>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                You and Ruby have been getting very close since February. A few days ago she confessed she hooked up with someone in Thailand in December — before you were together. The confession triggered anger, then deep sadness, intrusive mental images, and a desire to avoid parties to escape jealousy triggers.
              </p>
              <Callout color="violet">
                <strong className="text-white/90">The important thing to remember:</strong> You were not betrayed. She did nothing wrong. She did something honest — she told you voluntarily and said she wants to work through it together. Your brain reacted as if a betrayal happened, but the situation is not a betrayal. That mismatch is the whole problem.
              </Callout>
            </Card>
          </section>

          {/* ── What's happening ───────────────────────────────────────────── */}
          <section id={SECTIONS[1].id}>
            <SectionLabel color={SECTIONS[1].color}>What&apos;s actually happening</SectionLabel>
            <div className="flex flex-col gap-3">
              <Card>
                <p className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-3">The real diagnosis</p>
                <div className="flex flex-col gap-3">
                  <Insight text="This is retroactive jealousy — grief for an imagined past, not a real loss." />
                  <Insight text="Your brain turned a trust-building moment (her honesty) into a threat signal." />
                  <Insight text="You said yourself: if she never told you, everything would feel safe. That means this is an internal anxiety loop, not a relationship trust issue." />
                  <Insight text="This pattern existed before Ruby — the jealousy over your friend flirting with your last girlfriend was the same mechanism." />
                </div>
              </Card>
              <Card>
                <p className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-3">Why it hits you specifically</p>
                <div className="flex flex-col gap-3">
                  <Insight text="You are high-achieving and competitive. Your whole identity is built around competence, performance, and being your best. That system works perfectly everywhere except relationships." />
                  <Insight text="You subconsciously believe: worth = desirability. So when your brain imagines another man, it hears 'another man was chosen → maybe he had more value' — and suddenly this stops being about Ruby and becomes a status threat to your identity." />
                  <Insight text="In sports, career, and academics you can work harder and win. Relationships don't follow this model. Your brain hates this lack of control, so it tries to turn love into a competition — and the 'Thailand guy' becomes an imaginary leaderboard." />
                </div>
              </Card>
              <Callout color="emerald">
                <strong className="text-white/90">The core fear, said plainly:</strong> &quot;If I am not the best, I am replaceable.&quot; That belief serves you in competitive contexts. It is toxic in relationships. Because in love, people don&apos;t stay because you are the best option — they stay because they are emotionally bonded. Different systems entirely.
              </Callout>
            </div>
          </section>

          {/* ── Mindset shifts ─────────────────────────────────────────────── */}
          <section id={SECTIONS[2].id}>
            <SectionLabel color={SECTIONS[2].color}>Mindset shifts to internalize</SectionLabel>
            <div className="flex flex-col gap-3">

              <Card>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-white/80 text-sm font-semibold">Love is not a competition</p>
                  <span className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs shrink-0">01</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">Attraction is not a leaderboard. People pick partners based on timing, emotional safety, compatibility, shared experiences, and attachment built over time — not on ranking strongest, best in bed, or highest score. You cannot win this comparison because it is the wrong competition.</p>
              </Card>

              <Card>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-white/80 text-sm font-semibold">Special ≠ no past</p>
                  <span className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs shrink-0">02</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                    <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-1">Old belief</p>
                    <p className="text-white/60 text-sm">Special = no competition ever existed</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400/70 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-1">New belief</p>
                    <p className="text-white/80 text-sm">Special = chosen despite competition existing</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-white/80 text-sm font-semibold">Security comes from self-trust, not partner guarantees</p>
                  <span className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs shrink-0">03</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-3">You are trying to feel secure by achieving certainty. But in attachment, the need for certainty creates the anxiety. Certainty does not exist. And you already know you would survive and rebuild — you did it a year ago after a 3-year relationship ended, and you came out a better version of yourself.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                    <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-1">Wrong goal</p>
                    <p className="text-white/60 text-sm">Feel certain she will always choose me</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400/70 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-1">Real goal</p>
                    <p className="text-white/80 text-sm">Feel safe even without certainty</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-white/80 text-sm font-semibold">You and Ruby mirrored each other</p>
                  <span className="font-[family-name:var(--font-geist-mono)] text-white/20 text-xs shrink-0">04</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">You both had an unclear early stage and hurt each other unintentionally due to timeline mismatch. You talked to her friend for a few weeks, which damaged her. She hooked up with someone while abroad, which damaged you. Your brain treats your situation as understandable and hers as threatening. That is not hypocrisy — it is human self-protection. But noticing the symmetry is important: this is not about morality. It is about status and security.</p>
              </Card>

            </div>
          </section>

          {/* ── Intrusive thoughts ─────────────────────────────────────────── */}
          <section id={SECTIONS[3].id}>
            <SectionLabel color={SECTIONS[3].color}>How to handle intrusive thoughts</SectionLabel>
            <div className="flex flex-col gap-3">

              <Callout color="amber">
                <strong className="text-white/90">Do NOT ask for details.</strong> Your instinct says: if I know everything, my brain will stop guessing and I&apos;ll feel relief. But it works the opposite way. Details give your brain HD imagery to obsess over. You cannot unknow details once learned. The urge to know more is an anxiety compulsion — it feels like solving, but it feeds the obsession.
              </Callout>

              <Card>
                <p className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-3">What intrusive thoughts actually are</p>
                <div className="flex flex-col gap-2">
                  <Insight text="They are not jealousy. They are not intuition. They are intrusive thoughts — the same category as replaying embarrassing moments or worst-case scenarios before sleep." />
                  <Insight text="Your brain latched onto a romantic/sexual threat because that area matters to you. The content feels meaningful, but the mechanism is generic anxiety." />
                  <Insight text="The brain thinks it is helping you prepare for danger. But it is actually training itself to obsess. The more you try to solve them, the stronger they become." />
                </div>
              </Card>

              <Card>
                <p className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-3">The technique: non-engagement</p>
                <p className="text-white/50 text-sm mb-4">The goal is NOT to stop the thoughts. The goal is to stop engaging with them. Every time you analyze, argue with, or try to replace a thought, you tell your brain: &quot;Important — keep sending this.&quot;</p>
                <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                  <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-1">When the image appears</p>
                  <div className="flex gap-3 items-center">
                    <span className="font-[family-name:var(--font-geist-mono)] text-violet-400 text-xs shrink-0">1.</span>
                    <p className="text-white/70 text-sm">Label it mentally: <em>&quot;Intrusive jealousy thought.&quot;</em></p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="font-[family-name:var(--font-geist-mono)] text-violet-400 text-xs shrink-0">2.</span>
                    <p className="text-white/70 text-sm">Do nothing else. No arguing, no replacing, no analyzing, no reassuring.</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="font-[family-name:var(--font-geist-mono)] text-violet-400 text-xs shrink-0">3.</span>
                    <p className="text-white/70 text-sm">Return attention to what you were doing.</p>
                  </div>
                </div>
                <p className="text-white/30 text-xs mt-3">This is cognitive defusion + response prevention — the gold standard for intrusive thought loops.</p>
              </Card>

              <Card>
                <p className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-3">Replace the question</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                    <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-1">Old question</p>
                    <p className="text-white/60 text-sm italic">&quot;Am I better than him?&quot;</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400/70 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-1">New question</p>
                    <p className="text-white/80 text-sm italic">&quot;Are we emotionally connected and choosing each other now?&quot;</p>
                  </div>
                </div>
              </Card>

              <Callout color="amber">
                Stop avoiding parties. Avoidance teaches your brain: &quot;Yes, this is dangerous.&quot; Each time you avoid a trigger, the anxiety gets a little bigger. Return gradually. Let the discomfort be there. Your nervous system needs to learn that parties are safe — and it only learns that by going.
              </Callout>

            </div>
          </section>

          {/* ── Daily reminders ────────────────────────────────────────────── */}
          <section id={SECTIONS[4].id}>
            <SectionLabel color={SECTIONS[4].color}>Daily reminders</SectionLabel>
            <Card>
              <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-4">Read these when anxiety spikes</p>
              <div className="flex flex-col">
                <Reminder
                  text="She chooses me now, with full knowledge of her past."
                  sub="That is the only metric that matters."
                />
                <Reminder
                  text="My brain is seeking certainty that does not exist."
                  sub="The anxiety is the search for certainty, not a danger signal."
                />
                <Reminder
                  text="Thoughts are not threats. They are mental events."
                  sub="Thought ≠ truth. Thought ≠ danger."
                />
                <Reminder
                  text="Avoidance makes anxiety grow. Engagement shrinks it."
                  sub="Go to the party. Stay until the discomfort drops."
                />
                <Reminder
                  text="Reassurance helps short-term. Self-trust fixes it permanently."
                  sub="Don't make her responsible for regulating your nervous system."
                />
                <Reminder
                  text="I survived the end of a 3-year relationship and came out better."
                  sub="I trust myself to handle whatever happens."
                />
                <Reminder
                  text="I am learning emotional risk tolerance. This is the work."
                  sub="Not a character flaw — a skill being built."
                />
              </div>
            </Card>
          </section>

          {/* ── Talking to Ruby ────────────────────────────────────────────── */}
          <section id={SECTIONS[5].id}>
            <SectionLabel color={SECTIONS[5].color}>Talking to Ruby</SectionLabel>
            <div className="flex flex-col gap-3">

              <Callout color="violet">
                <strong className="text-white/90">The key framing:</strong> You are not bringing her a problem she caused. You are bringing her a pattern you discovered in yourself that got triggered. This single distinction changes the entire tone of the conversation.
              </Callout>

              <Card>
                <p className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-3">How to structure the conversation</p>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-cyan-400 text-xs shrink-0 pt-0.5">1</span>
                    <div>
                      <p className="text-white/80 text-sm font-semibold mb-1">Start with appreciation</p>
                      <p className="text-white/50 text-sm">Tell her that her telling you actually made you trust her more. This is crucial — you don&apos;t want honesty to become punished.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-cyan-400 text-xs shrink-0 pt-0.5">2</span>
                    <div>
                      <p className="text-white/80 text-sm font-semibold mb-1">Take full ownership</p>
                      <p className="text-white/50 text-sm italic">&quot;This reaction is about me, not about you doing something wrong. You didn&apos;t do anything wrong. It triggered an insecurity pattern in me that I want to work on.&quot;</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-cyan-400 text-xs shrink-0 pt-0.5">3</span>
                    <div>
                      <p className="text-white/80 text-sm font-semibold mb-1">Explain the intrusive thoughts simply</p>
                      <p className="text-white/50 text-sm italic">&quot;I&apos;ve been having intrusive thoughts and comparisons pop up. I know they don&apos;t reflect reality, but they still create anxiety. I&apos;m actively working on not feeding them.&quot;</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-cyan-400 text-xs shrink-0 pt-0.5">4</span>
                    <div>
                      <p className="text-white/80 text-sm font-semibold mb-1">Tell her what helps — as a request, not a demand</p>
                      <p className="text-white/50 text-sm italic">&quot;It helps me when you express that you want to be with me. Not as a responsibility — just so you know it means a lot.&quot;</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-cyan-400 text-xs shrink-0 pt-0.5">5</span>
                    <div>
                      <p className="text-white/80 text-sm font-semibold mb-1">Invite teamwork, close with connection</p>
                      <p className="text-white/50 text-sm italic">&quot;I don&apos;t expect you to fix this. I just want us to feel like we&apos;re on the same team while I work through it.&quot;</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <p className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-3">What not to do</p>
                <div className="flex flex-col gap-2">
                  <Insight text="Do not ask for sexual or romantic details — they will make the mental movies worse, not better." />
                  <Insight text="Do not ask comparison questions about him." />
                  <Insight text="Do not ask for promises about the future." />
                  <Insight text="Do not seek repeated reassurance — it relieves the symptom but never fixes the mechanism." />
                </div>
              </Card>

            </div>
          </section>

          {/* ── Healing timeline ───────────────────────────────────────────── */}
          <section id={SECTIONS[6].id}>
            <SectionLabel color={SECTIONS[6].color}>What healing looks like</SectionLabel>
            <Card className="mb-3">
              <p className="text-white/50 text-sm leading-relaxed mb-4">Think of this like recovering from a sprained ankle. You understand the injury, but it still hurts while healing. Your brain is rewiring a threat response — that takes repetition, not insight alone.</p>
              <p className="text-white/30 text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-widest mb-4">Important: frequency ≠ failure. Progress = engaging less with each thought, not having fewer thoughts.</p>
              <div className="flex flex-col">
                <Phase
                  num={1}
                  title="The Spike"
                  time="weeks 1–3"
                  items={[
                    "Intrusive thoughts still appear. Some days feel fine, then a wave hits.",
                    "You'll think 'why is this still happening?' — that's normal. Your brain is testing the old pathway.",
                    "Progress here means: old pattern = 20 mins of spiraling → new pattern = 2 mins of discomfort → move on.",
                  ]}
                />
                <Phase
                  num={2}
                  title="The Random Triggers"
                  time="weeks 3–8"
                  items={[
                    "You'll feel mostly normal, then something random hits and your brain says 'WAIT we forgot to worry about this!'",
                    "This is the extinction burst — the brain sends the thought harder one last time to check if it still works.",
                    "This is actually a sign the rewiring is working. Same response every time: label → disengage → continue.",
                  ]}
                />
                <Phase
                  num={3}
                  title="The Fading"
                  time="months 2–4"
                  items={[
                    "You'll suddenly notice you haven't thought about this in days.",
                    "When it does appear, it feels emotionally flat — like remembering an old embarrassing moment.",
                    "No emotional punch. The loop has lost reinforcement.",
                  ]}
                />
              </div>
            </Card>
            <Callout color="emerald">
              <strong className="text-white/90">Signs you are moving in the right direction:</strong> You stop wanting details. The mental movie loses emotional intensity. You stop avoiding parties. You stop measuring yourself against imaginary rivals. You feel present with her again.
            </Callout>
          </section>

          {/* Footer note */}
          <div className="border-t border-white/5 pt-8">
            <p className="text-white/20 text-sm leading-relaxed text-center font-[family-name:var(--font-geist-mono)]">
              This situation is not a relationship problem.<br />
              It is a growth chapter in your emotional life.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
