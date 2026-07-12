/**
 * lib/result/index.ts
 *
 * Server-only Ok/Err Result type.
 *
 * Rules this file enforces for the whole codebase:
 * - Services never throw business errors. They return Ok<T> or Err<E>.
 * - DAL may throw (DB exceptions). Services catch those and convert them
 *   to Err via `tryCatch` / `tryCatchSync` below — the only place a
 *   try/catch for business flow should exist.
 * - Actions never inspect `.value`/`.error` directly without narrowing
 *   via `result.ok` first (the discriminated union forces this in TS).
 *
 * Importing "server-only" makes this a build-time error if anything in
 * app/**\/*.tsx (a Client Component) or any file importing this ends up
 * in the client bundle. Result/Err objects can carry things you never
 * want serialized to the browser (internal error codes, stack traces via
 * `cause`), so keeping this server-only is intentional, not incidental.
 */

import "server-only";

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

export function Ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function Err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

// ---------------------------------------------------------------------------
// Transformations
// ---------------------------------------------------------------------------

/** Transform the success value. No-op on Err. */
export function map<T, E, U>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  return result.ok ? Ok(fn(result.value)) : result;
}

/** Transform the error value. No-op on Ok. */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  return result.ok ? result : Err(fn(result.error));
}

/**
 * Chain a Result-returning function. Use this to compose Service steps
 * without nested if-checks, e.g.:
 *
 *   const result = andThen(await validateCustomer(input), (customer) =>
 *     andThen(await validateProducts(input.items), (items) =>
 *       createInvoice(customer, items)));
 */
export async function andThen<T, E, U>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E> | Promise<Result<U, E>>,
): Promise<Result<U, E>> {
  return result.ok ? fn(result.value) : result;
}

// ---------------------------------------------------------------------------
// Unwrapping
// ---------------------------------------------------------------------------

/** Get the value, or a fallback if Err. Never throws. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

/**
 * Exhaustive handling — forces the caller to handle both branches.
 * Prefer this in Actions over manually checking `result.ok`.
 */
export function match<T, E, R>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => R; err: (error: E) => R },
): R {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}

// ---------------------------------------------------------------------------
// Combining multiple Results
// ---------------------------------------------------------------------------

/**
 * Combine an array of Results into one. Fails fast on the first Err —
 * useful when validating a batch of line items where any single failure
 * should abort the whole operation.
 */
export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.ok) return result;
    values.push(result.value);
  }
  return Ok(values);
}

// ---------------------------------------------------------------------------
// Bridging thrown exceptions (DAL layer) into Result (Service layer)
// ---------------------------------------------------------------------------

/**
 * Wrap a throwing async function (typically a DAL call) and convert any
 * thrown exception into an Err. This is the ONE sanctioned try/catch for
 * business flow — everywhere else, functions should already return Result.
 *
 * Usage inside a Service:
 *
 *   const invoice = await tryCatch(
 *     () => InvoiceDAL.create(tx, data),
 *     (cause) => ({ code: "DB_ERROR" as const, cause }),
 *   );
 *   if (!invoice.ok) return invoice;
 */
export async function tryCatch<T, E>(
  fn: () => Promise<T>,
  onError: (cause: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return Ok(value);
  } catch (cause) {
    return Err(onError(cause));
  }
}

/** Sync variant of `tryCatch`, for non-async DAL/utility calls. */
export function tryCatchSync<T, E>(
  fn: () => T,
  onError: (cause: unknown) => E,
): Result<T, E> {
  try {
    return Ok(fn());
  } catch (cause) {
    return Err(onError(cause));
  }
}
