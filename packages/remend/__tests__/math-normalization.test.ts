import { describe, expect, it } from "vitest";
import remend from "../src";

describe("Math delimiter normalization", () => {
  it("should convert inline math \\( ... \\) to $$ ... $$ by default", () => {
    const input = "This is inline math: \\(x = \\frac{1}{2}\\)";
    const expected = "This is inline math: $$x = \\frac{1}{2}$$";
    expect(remend(input)).toBe(expected);
  });

  it("should NOT convert inline math \\( ... \\) to $$ ... $$ when explicitly disabled", () => {
    const input = "This is inline math: \\(x = \\frac{1}{2}\\)";
    expect(remend(input, { normalizeMath: false })).toBe(input);
  });

  it("should convert block math \\[ ... \\] to $$ ... $$ by default", () => {
    const input = "Block math:\n\\[\n\\int_{0}^{\\infty} e^{-x^2} dx\n\\]";
    const expected = "Block math:\n$$\n\\int_{0}^{\\infty} e^{-x^2} dx\n$$";
    expect(remend(input)).toBe(expected);
  });

  it("should handle mixed delimiters by default", () => {
    const input = "Inline \\(x\\) and block \\[y\\]";
    const expected = "Inline $$x$$ and block $$y$$";
    expect(remend(input)).toBe(expected);
  });

  it("should handle incomplete delimiters if possible (optional behavior check) by default", () => {
    // If we have `\(` at the end, it becomes `$$`, which is an incomplete block.
    // remend then completes it to `$$$$`.
    expect(remend("Start \\(")).toBe("Start $$$$");
  });
});
