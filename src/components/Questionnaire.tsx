"use client";

import { useEffect, useRef, useState } from "react";
import { QUESTIONS, type QuizAnswers } from "@/lib/portfolio/questions";
import type { RecommendResult } from "@/lib/portfolio/types";
import { ResultView } from "./ResultView";

type Status = "answering" | "loading" | "error";

const GENERIC_ERROR = "Couldn't build your portfolio. Please pick an option to try again.";

export function Questionnaire() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [status, setStatus] = useState<Status>("answering");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const question = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);
  const currentAnswer = answers[question.id];

  // Move focus to the new question so screen-reader users hear the context change.
  useEffect(() => {
    if (!result && status === "answering") headingRef.current?.focus();
  }, [step, result, status]);

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
        throw new Error(json.error ?? GENERIC_ERROR);
      }
      setResult(json.data as RecommendResult);
      setStatus("answering");
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : GENERIC_ERROR);
      setStatus("error");
    }
  }

  function choose(value: string) {
    const next: Partial<QuizAnswers> = { ...answers, [question.id]: value };
    setAnswers(next);
    setStatus("answering");
    setErrorMessage(null);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    void submit(next as QuizAnswers);
  }

  function goBack() {
    setStatus("answering");
    setErrorMessage(null);
    setStep((current) => Math.max(0, current - 1));
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setErrorMessage(null);
    setStatus("answering");
  }

  if (result) {
    return (
      <ResultView
        recommendation={result.recommendation}
        market={result.market}
        onRestart={restart}
      />
    );
  }

  if (status === "loading") {
    return (
      <div role="status" className="surface grid place-items-center p-16 text-muted">
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
        <h2
          ref={headingRef}
          tabIndex={-1}
          id="question-heading"
          className="mt-3 text-2xl font-semibold tracking-tight outline-none md:text-3xl"
        >
          {question.title}
        </h2>

        <div role="group" aria-labelledby="question-heading" className="mt-7 grid gap-3">
          {question.options.map((option) => {
            const isSelected = currentAnswer === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => choose(option.value)}
                className={`group flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald hover:bg-emerald-tint/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald ${
                  isSelected ? "border-emerald bg-emerald-tint/40" : "border-line bg-paper/50"
                }`}
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
            );
          })}
        </div>

        {status === "error" ? (
          <p role="alert" className="mt-6 text-sm text-[var(--danger)]">
            {errorMessage ?? GENERIC_ERROR}
          </p>
        ) : null}

        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="mt-6 text-sm text-muted underline-offset-4 hover:underline"
          >
            &larr; Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
