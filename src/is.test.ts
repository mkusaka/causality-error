// is.test.ts
import { describe, it, expect } from "vitest";
import { is } from "./is";

class OuterError extends Error {}
class InnerError extends Error {}
class LeafError extends Error {}

describe("is", () => {
  it("matches when err === target (same instance)", () => {
    const err = new Error("same");
    expect(is(err, err)).toBe(true);
  });

  it("matches constructor anywhere in the cause chain", () => {
    const err = new OuterError("outer", {
      cause: new InnerError("inner", { cause: new LeafError("leaf") }),
    });

    expect(is(err, InnerError)).toBe(true); // middle
    expect(is(err, LeafError)).toBe(true); // deepest
    expect(is(err, SyntaxError)).toBe(false);
  });

  it("matches by predicate function", () => {
    const err = new Error("outer", {
      cause: Object.assign(new Error("leaf"), { code: "ENOENT" }),
    });

    const byCode = (e: unknown) => (e as any).code === "ENOENT";
    expect(is(err, byCode)).toBe(true);
  });

  it("searches inside AggregateError.errors array", () => {
    const aggregate = new AggregateError(
      [new TypeError("bad type"), new RangeError("bad range")],
      "agg",
    );
    const err = new Error("wrapper", { cause: aggregate });

    expect(is(err, RangeError)).toBe(true);
  });

  it("returns false when target is not found", () => {
    const err = new Error("plain");
    expect(is(err, ReferenceError)).toBe(false);
  });

  it("handles circular cause chains without infinite loop", () => {
    const a = new Error("a");
    const b = new Error("b", { cause: a });
    // create cycle: a -> b -> a
    (a as any).cause = b;

    expect(is(a, b)).toBe(true); // finds b in cycle
    expect(is(a, SyntaxError)).toBe(false);
  });
});
