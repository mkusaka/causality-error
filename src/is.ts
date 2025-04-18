/* ------------------------------------------------------------------ *
 * is.ts - Go-like errors.Is utility
 * ------------------------------------------------------------------ */

export type ErrorPredicate = (err: unknown) => boolean;
export type ErrorCtor = new (...args: any[]) => unknown;

/**
 * is(err, target) - Equivalent to Go's errors.Is(err, target)
 *
 * Ways to specify target:
 *  (1) Error instance    : `is(err, someError)`
 *  (2) Error constructor : `is(err, SyntaxError)`
 *  (3) Predicate function: `is(err, e => (e as any).code === 'ENOENT')`
 */
export function is(
  err: unknown,
  target: unknown | ErrorCtor | ErrorPredicate,
): boolean {
  const pred = createPredicate(target);
  const seen = new Set<unknown>(); // Prevent cycles
  const stack: unknown[] = [err];

  while (stack.length) {
    const cur = stack.pop();
    if (cur == null || seen.has(cur)) continue;
    seen.add(cur);

    if (pred(cur)) return true;

    // Error.cause
    if (isErrorLike(cur) && cur.cause !== undefined) {
      stack.push(cur.cause);
    }
    // AggregateError.errors[*]
    if (cur instanceof AggregateError) {
      stack.push(...cur.errors);
    }
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * Internal helpers
 * ------------------------------------------------------------------ */

/** Normalize target to a callback predicate */
function createPredicate(
  target: unknown | ErrorCtor | ErrorPredicate,
): ErrorPredicate {
  // Predicate function
  if (typeof target === "function" && !isErrorConstructor(target))
    return target as ErrorPredicate;

  // Error constructor
  if (typeof target === "function")
    return (err): boolean => err instanceof (target as ErrorCtor);

  // Error instance or any value
  return (err): boolean => err === target;
}

/** Check if a function is an Error constructor */
function isErrorConstructor(fn: unknown): fn is ErrorCtor {
  // Error constructors have prototypes derived from Error
  return (
    typeof fn === "function" && fn.prototype && fn.prototype instanceof Error
  );
}

/** Check if value is Error-like (Error with optional cause property) */
function isErrorLike(val: unknown): val is Error & { cause?: unknown } {
  return typeof val === "object" && val instanceof Error;
}
