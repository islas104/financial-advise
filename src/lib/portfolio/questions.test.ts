import { describe, it, expect } from "vitest";
import { QUESTIONS } from "./questions";

describe("question config", () => {
  it("defines exactly three questions", () => {
    expect(QUESTIONS).toHaveLength(3);
  });

  it("gives every question a title and at least two options", () => {
    for (const question of QUESTIONS) {
      expect(question.title.length).toBeGreaterThan(0);
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      for (const option of question.options) {
        expect(option.value).toBeTruthy();
        expect(option.label).toBeTruthy();
      }
    }
  });

  it("maps each question to a distinct answer field", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
