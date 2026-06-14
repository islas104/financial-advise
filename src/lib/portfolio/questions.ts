import type { Goal, RiskComfort, TimeHorizon } from "./types";

// Declarative question definitions for the guided flow. Keeping these as data
// (not hardcoded JSX) lets the UI render them generically and keeps copy in one
// place.

export interface QuestionOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly hint: string;
}

export interface Question<T extends string> {
  readonly id: keyof QuizAnswers;
  readonly title: string;
  readonly options: readonly QuestionOption<T>[];
}

export interface QuizAnswers {
  readonly timeHorizon: TimeHorizon;
  readonly riskComfort: RiskComfort;
  readonly goal: Goal;
}

export const HORIZON_QUESTION: Question<TimeHorizon> = {
  id: "timeHorizon",
  title: "When are you likely to need this money?",
  options: [
    { value: "short", label: "Within 3 years", hint: "Keeping it safe matters most" },
    { value: "medium", label: "3 to 7 years", hint: "A mix of growth and stability" },
    { value: "long", label: "7+ years", hint: "Time to ride out the ups and downs" },
  ],
};

export const COMFORT_QUESTION: Question<RiskComfort> = {
  id: "riskComfort",
  title: "Your investments drop 20% in a month. You…",
  options: [
    { value: "cautious", label: "Sell to stop the bleeding", hint: "Lower tolerance for swings" },
    { value: "balanced", label: "Hold and wait it out", hint: "Comfortable with some swings" },
    { value: "adventurous", label: "Buy more while it's cheap", hint: "High tolerance for swings" },
  ],
};

export const GOAL_QUESTION: Question<Goal> = {
  id: "goal",
  title: "What's the main job for this money?",
  options: [
    { value: "preserve", label: "Protect what I have", hint: "Capital preservation" },
    { value: "balanced", label: "Steady, balanced growth", hint: "Middle ground" },
    { value: "growth", label: "Grow as much as possible", hint: "Maximise long-term growth" },
  ],
};

export const QUESTIONS = [HORIZON_QUESTION, COMFORT_QUESTION, GOAL_QUESTION] as const;
