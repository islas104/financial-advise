"use client";

import { useState } from "react";
import { QUESTIONS, type QuizAnswers } from "@/lib/portfolio/questions";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";
import { ResultView } from "./ResultView";

type Status = "answering" | "loading" | "error";

export function Questionnaire() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [status, setStatus] = useState<Status>("answering");
  const [result, setResult] = useState<PortfolioRecommendation | null>(null);

  const question = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  async function submit(finalAnswers: QuizAnswers) {
    setStatus("loading");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Something went wrong.");
      }
      setResult(json.data as PortfolioRecommendation);
      setStatus("answering");
    } catch {
      setStatus("error");
    }
  }

  function choose(value: string) {
    const next: Partial<QuizAnswers> = { ...answers, [question.id]: value };
    setAnswers(next);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    void submit(next as QuizAnswers);
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setStatus("answering");
  }

  if (result) {
    return <ResultView recommendation={result} onRestart={restart} />;
  }

  if (status === "loading") {
    return (
      <div className="surface grid place-items-center p-16 text-muted">
        <p className="animate-pulse">Building your portfolio…</p>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <div className="h-1 w-full bg-line">
        <div
          className="h-full bg-emerald transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-7 md:p-10">
        <p className="eyebrow">
          Step {step + 1} of {QUESTIONS.length}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{question.title}</h2>

        <div className="mt-7 grid gap-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              className="group flex items-center justify-between rounded-xl border border-line bg-paper/50 px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald hover:bg-emerald-tint/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald"
            >
              <span>
                <span className="block font-medium text-ink">{option.label}</span>
                <span className="block text-sm text-muted">{option.hint}</span>
              </span>
              <span
                aria-hidden
                className="text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-strong"
              >
                &rarr;
              </span>
            </button>
          ))}
        </div>

        {status === "error" ? (
          <p role="alert" className="mt-6 text-sm text-[var(--danger)]">
            Couldn&apos;t build your portfolio. Please pick an option to try again.
          </p>
        ) : null}

        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="mt-6 text-sm text-muted underline-offset-4 hover:underline"
          >
            &larr; Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
