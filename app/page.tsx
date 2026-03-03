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
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-white text-zinc-900 antialiased">

      {/* ── NAV ── */}
      <nav className="flex min-w-0 items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3 sm:px-6 sm:py-4 md:px-12 lg:px-20">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
          <Image src="/philippine-flag.svg" alt="Philippine flag" width={28} height={19} className="shrink-0 rounded-sm" />
          <span className="truncate text-sm font-extrabold tracking-tight text-zinc-900 sm:text-base">KumustAFA</span>
        </div>
        <span className="hidden shrink-0 text-[10px] font-medium uppercase tracking-widest text-zinc-400 sm:block sm:text-xs">
          English → Tagalog
        </span>
      </nav>

      {/* ── HERO ── */}
      <section className="grid min-h-0 lg:grid-cols-2 lg:min-h-[calc(100vh-57px)]">
        {/* Left: input side */}
        <div className="flex min-w-0 flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:px-16 lg:py-16 xl:px-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
            Filipino Greeting Intelligence
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.1] lg:text-6xl xl:text-7xl xl:leading-[1.06]">
            The whole<br />
            <span className="text-blue-700">Filipino</span><br />
            greeting in<br />
            one app
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500 sm:mt-5 sm:text-base sm:leading-7">
            Type any English greeting below — KumustAFA validates and translates it to Tagalog instantly.
          </p>

          {/* Input + button */}
          <form id="simulator" onSubmit={onSimulate} className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="hello, good morning…"
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
            />
            <button
              type="submit"
              className="w-full shrink-0 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
            >
              Translate
            </button>
          </form>

          {/* Quick test pills */}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:mt-5">Try these</p>
          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-2.5 sm:gap-2">
            {QUICK_TESTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => runQuickTest(t)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 sm:px-4"
              >
                {t}
              </button>
            ))}
          </div>

          {/* Mobile-only result (shown below form on small screens) */}
          <div className="mt-6 lg:hidden">
            {!result ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-6 py-8 text-center shadow-sm">
                <p className="text-sm text-zinc-400">Your translation will appear here</p>
              </div>
            ) : result.accepted ? (
              <div className="rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50 px-5 py-6 text-center shadow-lg shadow-green-900/5 sm:px-6 sm:py-8">
                <p className="text-xs font-bold uppercase tracking-widest text-green-600">Accepted ✓</p>
                <p className="mt-2 min-w-0 truncate text-base font-black text-zinc-900 sm:text-lg" title={submittedInput}>{submittedInput}</p>
                <p className="translation-display mt-2 min-w-0 font-black text-green-700">{translation}</p>
                <p className="mt-3 text-xs text-zinc-500">Final state: {result.finalState}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-rose-50 px-6 py-8 text-center shadow-lg shadow-red-900/5">
                <p className="text-xs font-bold uppercase tracking-widest text-red-500">Not Recognized ✗</p>
                <p className="mt-2 break-words text-xl font-black text-zinc-900 sm:text-2xl">{submittedInput}</p>
                <p className="mt-3 break-words text-xs leading-relaxed text-zinc-500">
                  Failed at index {result.failedAt ?? 0} — symbol &quot;{result.failedSymbol === " " ? "space" : result.failedSymbol}&quot; from state {result.failedFrom}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: result panel (desktop) */}
        <div className="relative hidden overflow-x-hidden overflow-y-auto lg:flex lg:items-center lg:justify-center lg:py-8">
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
          <div className="relative z-10 w-full max-w-[360px] px-4">
            {!result ? (
              <div className="rounded-3xl border border-white/25 bg-white/10 px-8 py-12 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <span className="text-2xl">🇵🇭</span>
                </div>
                <p className="text-base font-semibold text-white/90">Type a greeting</p>
                <p className="mt-1 text-sm text-white/60">Your translation will appear right here</p>
              </div>
            ) : result.accepted ? (
              <div className="flex min-h-0 flex-col rounded-3xl border border-white/25 bg-white/10 px-6 py-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-8 sm:py-10">
                <span className="shrink-0 inline-block rounded-full bg-green-400/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-200">
                  Accepted ✓
                </span>
                <p className="mt-4 min-w-0 truncate text-base font-semibold text-white/70 sm:text-lg" title={submittedInput}>{submittedInput}</p>
                <p className="translation-display mt-2 min-w-0 font-black text-white">{translation}</p>
                <div className="mt-5 shrink-0 rounded-xl bg-white/10 px-4 py-2.5 sm:mt-6">
                  <p className="text-xs text-white/50">Final state: <span className="font-mono font-bold text-white/80">{result.finalState}</span></p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-col rounded-3xl border border-white/25 bg-white/10 px-6 py-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-8 sm:py-10">
                <span className="shrink-0 inline-block rounded-full bg-red-400/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-200">
                  Not Recognized ✗
                </span>
                <p className="mt-4 min-w-0 break-words text-xl font-black text-white sm:text-2xl">{submittedInput}</p>
                <p className="mt-3 min-w-0 break-words text-sm leading-relaxed text-white/70">
                  Failed at index <span className="font-bold text-white">{result.failedAt ?? 0}</span> — symbol &quot;<span className="font-mono font-bold text-red-300">{result.failedSymbol === " " ? "space" : result.failedSymbol}</span>&quot; from state <span className="font-mono font-bold text-white">{result.failedFrom}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PHRASES NOT TO MISS ── */}
      <section className="border-t border-zinc-100 px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]">Phrases Not to Miss</p>
          <p className="mt-1.5 text-xs text-zinc-500 sm:mt-2 sm:text-sm">Discover all greetings recognized by KumustAFA</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {DFA_LANGUAGE_EXAMPLES.map((phrase, i) => (
            <button
              key={phrase}
              type="button"
              onClick={() => runQuickTest(phrase)}
              className={`group relative flex min-h-[6rem] min-w-0 flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br p-3 text-left shadow-lg shadow-black/5 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-black/10 sm:min-h-[7.5rem] sm:rounded-2xl sm:p-5 sm:hover:-translate-y-1.5 ${PHRASE_GRADIENTS[i % PHRASE_GRADIENTS.length]}`}
            >
              <p className="line-clamp-2 text-xs font-bold leading-snug text-white sm:text-sm">{phrase}</p>
              {TAGALOG_TRANSLATIONS[phrase] && (
                <p className="mt-1 line-clamp-1 text-[10px] font-medium text-white/80 sm:mt-1.5 sm:text-xs">{TAGALOG_TRANSLATIONS[phrase]}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]">How It Works</p>
          <p className="mt-1.5 text-xs text-zinc-500 sm:mt-2 sm:text-sm">Three steps, zero guessing</p>
        </div>
        <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-3">
          {[
            {
              num: "01",
              title: "Type a Greeting",
              body: 'Enter any English phrase like "hello", "good morning", or "thankyou".',
              color: "bg-blue-500/10 text-blue-700",
            },
            {
              num: "02",
              title: "DFA Validates It",
              body: "Each character is processed character-by-character through deterministic state transitions.",
              color: "bg-red-500/10 text-red-600",
            },
            {
              num: "03",
              title: "Get the Translation",
              body: "Accepted inputs are instantly mapped to Tagalog. Rejected inputs show exactly where they failed.",
              color: "bg-amber-500/10 text-amber-600",
            },
          ].map(({ num, title, body, color }) => (
            <div key={num} className="min-w-0 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-lg shadow-zinc-200/50 ring-1 ring-zinc-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-zinc-200 sm:rounded-2xl sm:p-6">
              <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-black sm:h-10 sm:w-10 sm:rounded-xl sm:text-lg ${color}`}>{num}</span>
              <p className="mt-3 text-sm font-bold text-zinc-900 sm:mt-4">{title}</p>
              <p className="mt-1.5 text-xs leading-5.5 text-zinc-500 sm:mt-2 sm:text-sm sm:leading-6">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIMULATION DETAILS ── */}
      <section className="border-t border-zinc-100 px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]">Simulation Details</p>
          <p className="mt-1.5 text-xs text-zinc-500 sm:mt-2 sm:text-sm">Full DFA analysis for your last input</p>
        </div>

        {!result ? (
          <p className="mt-6 text-center text-xs text-zinc-400 sm:mt-8 sm:text-sm">Run a phrase above to see the analysis here.</p>
        ) : (
          <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-sm sm:mt-8 sm:gap-4">
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
              <div key={label} className={`flex min-w-0 flex-col gap-1 rounded-xl border px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 ${accent}`}>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:text-xs">{label}</span>
                <span className="min-w-0 break-words font-medium text-zinc-900 sm:text-right">{value}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── TRANSITION TRACE ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-4 py-10 sm:px-6 sm:py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]">Transition Trace</p>
          <p className="mt-1.5 text-xs text-zinc-500 sm:mt-2 sm:text-sm">Step-by-step state movement</p>
        </div>

        {!result?.steps.length ? (
          <p className="mt-6 text-center text-xs text-zinc-400 sm:mt-8 sm:text-sm">No transitions yet — try a phrase.</p>
        ) : (
          <div className="mx-auto mt-6 max-w-2xl sm:mt-8">
            <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-200/50 ring-1 ring-zinc-100 sm:rounded-2xl">
              <table className="w-full min-w-[280px] border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {["Step", "From", "Symbol", "To"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:px-5 sm:py-3 sm:text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((step, i) => (
                    <tr
                      key={`${step.index}-${step.from}-${step.to}`}
                      className={`border-b border-zinc-50 transition-colors hover:bg-blue-50/40 last:border-b-0 ${i % 2 === 0 ? "" : "bg-zinc-50/60"}`}
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-zinc-500 sm:px-5 sm:py-3">{step.index + 1}</td>
                      <td className="min-w-0 break-words px-3 py-2 font-mono font-semibold text-blue-700 sm:px-5 sm:py-3">{step.from}</td>
                      <td className="min-w-0 break-words px-3 py-2 font-mono font-bold text-zinc-900 sm:px-5 sm:py-3">{step.symbol}</td>
                      <td className="min-w-0 break-words px-3 py-2 font-mono font-semibold text-red-600 sm:px-5 sm:py-3">{step.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-100 px-4 py-8 sm:px-6 sm:py-10 md:px-12 lg:px-20">
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
