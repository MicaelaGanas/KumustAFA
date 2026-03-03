"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

type Step = {
  index: number;
  from: string;
  symbol: string;
  to: string;
};

type SimulationResult = {
  accepted: boolean;
  finalState: string;
  failedAt?: number;
  failedFrom?: string;
  failedSymbol?: string;
  steps: Step[];
};

const START_STATE = "q0";
const FINAL_STATES = new Set(["q5", "q9", "q13", "q20", "q25"]);

const TRANSITIONS: Record<string, Record<string, string>> = {
  q0: { h: "q1", g: "q10", m: "q14", t: "q21" },
  q1: { e: "q2" },
  q2: { l: "q3" },
  q3: { l: "q4" },
  q4: { o: "q5" },
  q5: { " ": "q6" },
  q6: { y: "q7", m: "q14" },
  q7: { o: "q8" },
  q8: { u: "q9" },
  q10: { o: "q11" },
  q11: { o: "q12" },
  q12: { d: "q13" },
  q13: { " ": "q6" },
  q14: { o: "q15" },
  q15: { r: "q16" },
  q16: { n: "q17" },
  q17: { i: "q18" },
  q18: { n: "q19" },
  q19: { g: "q20" },
  q21: { h: "q22" },
  q22: { a: "q23" },
  q23: { n: "q24" },
  q24: { k: "q25" },
  q25: { y: "q7" },
};

const TAGALOG_TRANSLATIONS: Record<string, string> = {
  hello: "kumusta",
  good: "mabuti",
  morning: "umaga",
  thank: "salamat",
  "hello you": "kumusta ikaw",
  "good morning": "magandang umaga",
  thankyou: "salamat sa iyo",
};

const DFA_LANGUAGE_EXAMPLES = [
  "hello",
  "good",
  "morning",
  "thank",
  "hello you",
  "good morning",
  "thankyou",
  "hello morning",
  "good you",
];

const QUICK_TESTS = ["hello", "good morning", "thankyou", "hello you", "good you", "hellp"];

function runDfa(input: string): SimulationResult {
  const normalized = input.toLowerCase();
  const steps: Step[] = [];
  let currentState = START_STATE;

  for (let index = 0; index < normalized.length; index += 1) {
    const symbol = normalized[index];
    const nextState = TRANSITIONS[currentState]?.[symbol];

    if (!nextState) {
      return {
        accepted: false,
        finalState: currentState,
        failedAt: index,
        failedFrom: currentState,
        failedSymbol: symbol,
        steps,
      };
    }

    steps.push({
      index,
      from: currentState,
      symbol: symbol === " " ? "␠" : symbol,
      to: nextState,
    });

    currentState = nextState;
  }

  return {
    accepted: FINAL_STATES.has(currentState),
    finalState: currentState,
    steps,
  };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [submittedInput, setSubmittedInput] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  const translation = useMemo(() => {
    if (!result?.accepted) return null;
    return TAGALOG_TRANSLATIONS[submittedInput.toLowerCase()] ?? "No mapped Tagalog output";
  }, [result, submittedInput]);

  const onSimulate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = input.trim().replace(/\s+/g, " ");
    setSubmittedInput(normalized);
    setResult(runDfa(normalized));
  };

  const runQuickTest = (value: string) => {
    setInput(value);
    setSubmittedInput(value);
    setResult(runDfa(value));
  };

  const PHRASE_GRADIENTS = [
    "from-blue-700 to-blue-950",
    "from-red-600 to-red-900",
    "from-amber-500 to-amber-800",
    "from-blue-900 to-indigo-950",
    "from-rose-600 to-red-800",
    "from-sky-500 to-blue-700",
    "from-red-700 to-rose-900",
    "from-teal-600 to-blue-800",
    "from-amber-600 to-orange-700",
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 sm:px-12 lg:px-20">
        <div className="flex items-center gap-2.5">
          <Image src="/philippine-flag.svg" alt="Philippine flag" width={28} height={19} className="rounded-sm" />
          <span className="text-base font-extrabold tracking-tight text-zinc-900">KumustAFA</span>
        </div>
        <span className="hidden text-xs font-medium uppercase tracking-widest text-zinc-400 sm:block">
          English → Tagalog
        </span>
      </nav>

      {/* ── HERO ── */}
      <section className="grid lg:grid-cols-2" style={{ minHeight: "calc(100vh - 57px)" }}>
        {/* Left: input side */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 xl:px-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
            Filipino Greeting Intelligence
          </p>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.06] tracking-tight text-zinc-900 sm:text-6xl xl:text-7xl">
            The whole<br />
            <span className="text-blue-700">Filipino</span><br />
            greeting in<br />
            one app
          </h1>
          <p className="mt-5 max-w-xs text-base leading-7 text-zinc-500">
            Type any English greeting below — KumustAFA validates and translates it to Tagalog instantly.
          </p>

          {/* Input + button */}
          <form id="simulator" onSubmit={onSimulate} className="mt-8 flex w-full max-w-sm items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="hello, good morning…"
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Translate
            </button>
          </form>

          {/* Quick test pills */}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-zinc-400">Try these</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {QUICK_TESTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => runQuickTest(t)}
                className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                {t}
              </button>
            ))}
          </div>

          {/* Mobile-only result (shown below form on small screens) */}
          <div className="mt-6 lg:hidden">
            {!result ? (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-8 text-center">
                <p className="text-sm text-zinc-400">Your translation will appear here</p>
              </div>
            ) : result.accepted ? (
              <div className="rounded-2xl border-2 border-green-200 bg-green-50 px-6 py-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-green-600">Accepted ✓</p>
                <p className="mt-2 text-3xl font-black text-zinc-900">{submittedInput}</p>
                <p className="mt-1 text-4xl font-black text-green-700">{translation}</p>
                <p className="mt-3 text-xs text-zinc-400">Final state: {result.finalState}</p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-red-500">Not Recognized ✗</p>
                <p className="mt-2 text-3xl font-black text-zinc-900">{submittedInput}</p>
                <p className="mt-3 text-xs text-zinc-400">
                  Failed at index {result.failedAt ?? 0} — symbol &quot;{result.failedSymbol === " " ? "space" : result.failedSymbol}&quot; from state {result.failedFrom}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: result panel (desktop) */}
        <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
          {/* Photo always in background */}
          <Image
            src="/filipino-hero.jpg"
            alt="Banaue Rice Terraces, Philippines"
            fill
            priority
            className="object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-blue-950/60" />

          {/* Result card on top */}
          <div className="relative z-10 w-[340px]">
            {!result ? (
              <div className="rounded-3xl border border-white/20 bg-white/10 px-8 py-12 text-center backdrop-blur-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                  <span className="text-2xl">🇵🇭</span>
                </div>
                <p className="text-base font-semibold text-white/80">Type a greeting</p>
                <p className="mt-1 text-sm text-white/50">Your translation will appear right here</p>
              </div>
            ) : result.accepted ? (
              <div className="rounded-3xl border border-white/20 bg-white/10 px-8 py-10 text-center backdrop-blur-md">
                <span className="inline-block rounded-full bg-green-400/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-green-300">
                  Accepted ✓
                </span>
                <p className="mt-5 text-lg font-semibold text-white/60">{submittedInput}</p>
                <p className="mt-1 text-6xl font-black text-white">{translation}</p>
                <div className="mt-6 rounded-xl bg-white/10 px-4 py-2">
                  <p className="text-xs text-white/50">Final state: <span className="font-mono font-bold text-white/80">{result.finalState}</span></p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/20 bg-white/10 px-8 py-10 text-center backdrop-blur-md">
                <span className="inline-block rounded-full bg-red-400/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-red-300">
                  Not Recognized ✗
                </span>
                <p className="mt-5 text-4xl font-black text-white">{submittedInput}</p>
                <p className="mt-4 text-sm leading-6 text-white/60">
                  Failed at index <span className="font-bold text-white">{result.failedAt ?? 0}</span> — symbol &quot;<span className="font-mono font-bold text-red-300">{result.failedSymbol === " " ? "space" : result.failedSymbol}</span>&quot; from state <span className="font-mono font-bold text-white">{result.failedFrom}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PHRASES NOT TO MISS ── */}
      <section className="border-t border-zinc-100 px-6 py-16 sm:px-12 lg:px-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">Phrases Not to Miss</p>
          <p className="mt-2 text-sm text-zinc-500">Discover all greetings recognized by KumustAFA</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {DFA_LANGUAGE_EXAMPLES.map((phrase, i) => (
            <button
              key={phrase}
              type="button"
              onClick={() => runQuickTest(phrase)}
              className={`group relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${PHRASE_GRADIENTS[i % PHRASE_GRADIENTS.length]}`}
            >
              <p className="text-sm font-bold text-white">{phrase}</p>
              {TAGALOG_TRANSLATIONS[phrase] && (
                <p className="mt-0.5 text-xs text-white/70">{TAGALOG_TRANSLATIONS[phrase]}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-16 sm:px-12 lg:px-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">How It Works</p>
          <p className="mt-2 text-sm text-zinc-500">Three steps, zero guessing</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
          {[
            {
              num: "01",
              title: "Type a Greeting",
              body: 'Enter any English phrase like "hello", "good morning", or "thankyou".',
              color: "text-blue-700",
            },
            {
              num: "02",
              title: "DFA Validates It",
              body: "Each character is processed character-by-character through deterministic state transitions.",
              color: "text-red-600",
            },
            {
              num: "03",
              title: "Get the Translation",
              body: "Accepted inputs are instantly mapped to Tagalog. Rejected inputs show exactly where they failed.",
              color: "text-amber-600",
            },
          ].map(({ num, title, body, color }) => (
            <div key={num} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <p className={`text-2xl font-black ${color}`}>{num}</p>
              <p className="mt-3 text-sm font-bold text-zinc-900">{title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIMULATION DETAILS ── */}
      <section className="border-t border-zinc-100 px-6 py-16 sm:px-12 lg:px-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">Simulation Details</p>
          <p className="mt-2 text-sm text-zinc-500">Full DFA analysis for your last input</p>
        </div>

        {!result ? (
          <p className="mt-8 text-center text-sm text-zinc-400">Run a phrase above to see the analysis here.</p>
        ) : (
          <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-sm">
            {[
              { label: "Input", value: submittedInput || "(empty)", accent: "border-blue-200 bg-blue-50" },
              { label: "Final State", value: result.finalState, accent: "border-zinc-200 bg-zinc-50" },
              {
                label: "Status",
                value: result.accepted ? "Accepted ✓" : "Rejected ✗",
                accent: result.accepted ? "border-green-200 bg-green-50 text-green-700 font-bold" : "border-red-200 bg-red-50 text-red-600 font-bold",
              },
              ...(result.accepted
                ? [{ label: "Tagalog", value: translation ?? "—", accent: "border-blue-200 bg-blue-50 font-bold" }]
                : [
                    {
                      label: "Failed at",
                      value: `index ${result.failedAt ?? 0} — symbol "${result.failedSymbol === " " ? "space" : result.failedSymbol}" from ${result.failedFrom}`,
                      accent: "border-red-200 bg-red-50",
                    },
                  ]),
            ].map(({ label, value, accent }) => (
              <div key={label} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${accent}`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
                <span className="font-medium text-zinc-900">{value}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── TRANSITION TRACE ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-16 sm:px-12 lg:px-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">Transition Trace</p>
          <p className="mt-2 text-sm text-zinc-500">Step-by-step state movement</p>
        </div>

        {!result?.steps.length ? (
          <p className="mt-8 text-center text-sm text-zinc-400">No transitions yet — try a phrase.</p>
        ) : (
          <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {["Step", "From", "Symbol", "To"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.steps.map((step, i) => (
                  <tr
                    key={`${step.index}-${step.from}-${step.to}`}
                    className={`border-b border-zinc-50 transition-colors hover:bg-blue-50/40 ${i % 2 === 0 ? "" : "bg-zinc-50/60"}`}
                  >
                    <td className="px-5 py-3 font-mono text-zinc-500">{step.index + 1}</td>
                    <td className="px-5 py-3 font-mono font-semibold text-blue-700">{step.from}</td>
                    <td className="px-5 py-3 font-mono font-bold text-zinc-900">{step.symbol}</td>
                    <td className="px-5 py-3 font-mono font-semibold text-red-600">{step.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-100 px-6 py-10 sm:px-12 lg:px-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Image src="/philippine-flag.svg" alt="Philippine flag" width={22} height={15} className="rounded-sm" />
            <span className="text-sm font-extrabold tracking-tight text-zinc-900">KumustAFA</span>
          </div>
          <p className="text-xs text-zinc-400">© 2026 KumustAFA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
