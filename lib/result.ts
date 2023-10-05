
/**
 * Utility function for producing an `Ok` variant of a `Result`
 * @param t The value to wrap in the `Ok`
 * @returns a new `Ok` value wrapping the given `t`
 */
export function ok<T, E>(t: T): Result<T, E> {
  return new Ok(t);
}

/**
 * Utility function for producing an `Err` variant of a `Result`
 * @param e The value to wrap in the `Err`
 * @returns a new `Err` value wrapping the given `e`
 */
export function err<T, E>(e: E): Result<T, E> {
  return new Err(e);
}

/**
 * Utility function to create a Result from a value or from null or undefined.
 * This is useful to convert between an optional value and Result.
 * @param x The optional value to convert into a Result
 * @returns `new Ok(x)` if `x` is not `null` or `undefined`
 * otherwise `new Err(null)`
 */
export function fromOption<T>(x: T | null | undefined): Result<T, null> {
  if (x === null || x === undefined) {
    return err(null);
  }
  return ok(x);
}

/**
 * The Ok variant of the `Result` interface. This represents the
 * succesful result of an operation that could fail. `Ok` wraps
 * the given underlying value.
 */
class Ok<T, E> implements Result<T, E> {
  wrapped: T;

  constructor(data: T) {
    this.wrapped = data;
  }

  isErr(): boolean {
    return false;
  }

  isOk(): boolean {
    return true;
  }

  map<U>(f: (x: T) => U): Result<U, E> {
    const u = f(this.wrapped);
    return new Ok(u);
  }

  map_err<F>(_f: (x: E) => F): Result<T, F> {
      return this as unknown as Result<T, F>;
  }

  and_then<U>(f: (x: T) => Result<U, E>): Result<U, E> {
    const uR = f(this.wrapped);
    return uR;
  }

  async and_then_async<U>(f: (x: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    return await f(this.wrapped);
  }

  optional(): T | null {
      return this.unwrap();
  }

  union(): T | E {
      return this.wrapped;
  }

  unwrap(): T {
    return this.wrapped;
  }

  unwrap_err(): E {
    throw new Error(`Result contained Ok(${this.wrapped}), not an error`);
  }

  unwrap_or(_d: T): T {
    return this.wrapped;
  }

  contained(): Ok<T, E> | Err<T, E> {
    return this;
  }
}

/**
 * The Err variant of the `Result` interface. This represents the
 * failed result of an operation that could fail. `Err` wraps
 * the given underlying value.
 */
class Err<T, E> implements Result<T, E> {
  wrapped: E;

  constructor(err: E) {
    this.wrapped = err;
  }

  isErr(): boolean {
    return true;
  }

  isOk(): boolean {
    return false;
  }

  map<U>(_f: (x: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  map_err<F>(f: (x: E) => F): Result<T, F> {
      const e = f(this.wrapped);
      return new Err(e);
  }

  and_then<U>(_f: (x: T) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  async and_then_async<U>(_f: (x: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    return this as unknown as Result<U, E>;
  }

  optional(): T | null {
      return null;
  }

  union(): T | E {
    return this.wrapped;
  }

  unwrap(): T {
    throw Error(`Unwrapped an error: Err(${this.wrapped})`);
  }

  unwrap_or(d: T): T {
    return d;
  }

  unwrap_err(): E {
    return this.wrapped;
  }

  contained(): Err<T, E> | Ok<T, E> {
    return this;
  }
}

/**
 * Result is an interface to represent the output of an operation
 * that could fail. Concrete types that implement result are Ok and
 * Err.
 *
 * Methods on Result are intended to make it easy to carry
 * operations through a series of Results. For example, say an operation
 * that may fail with a string error message normally will return
 * a number: Result<number, string>. Once you have this result you'd
 * like to add 5:
 * ```
 * const x: Result<number, string> = operationThatCanFail();
 * x.map((n) => n + 5);
 * ```
 * If `x` was Ok { wrapped: 5 }, then the `map` call would return
 * Ok { wrapped: 10 }. If `x` was Err { wrapped: "This is an error" }
 * then that error is cascaded through the map and we just get the error
 * still.
 *
 * This allows us to chain operations together on results.
 *
 * Use isErr and isOk to determine what kind of Result you have.
 *
 * Use `map` and `and_then` to continue operating on an Ok value while
 * propogating the error forward. Use `map_err` to change the error type,
 * perhaps to a default error value.
 *
 * Use the `unwrap` methods to get at the underlying data, but with the
 * danger that unwrapping an error will throw, and vice versa for `unwrap_err`.
 * Use `unwrap_or` to provide a default Ok value if the underlying Result is an Err.
 *
 * Lastly `optional` will throw away the error as null and give you back
 * the Ok as `T | null`. `union` will convert the Result<T, E> into
 * the union type equivalent, `T | E`.
 *
 * Example: in attribution.ts we have to fetch the lab object from
 * the given string ID using FetchRequest. Assuming FetchRequest gave
 * back a `Result<DataProviderObject, ErrorObject>` (inside a `Promise`)
 * then we could get the lab object perhaps something like this:
 *
 * ```
 * const labId: string | undefined = "/path/to/lab";
 * const lab = (
 *  await fromOption(labId).and_then_async(async (x) => {
 *    return (await request.getObject(x)).map_err((_x) => null);
 *  })
 * ).optional()
 * ```
 *
 * In this example `fromOption` takes a `T | undefined | null` and
 * converts it into a `Result<T, null>`. We do this first because
 * now we can use the Result API to make other operations that may
 * fail pretty easily. The `getObject` call returns a
 * `Result<DataProviderObject, ErrorObject>` and is async so next we apply
 * `and_then_async` to actually fetch using the ID (if it's defined) and then
 * mapping the error back to `null` using `map_err` so ultimately our function
 * passed in to `and_then_async` as the signature `(x: T) => Promise<Result<DataProvidorObject>, null>`.
 * Since this is `await`ed, after `and_then_async` we have Result<DataProviderObject, null> but
 * we want it like an optional union type. To do this, just convert
 * using `optional` finally giving us the desired `DataProviderObject | null`
 */
export interface Result<T, E> {

  /**
   * Converts the `Result<T, E>` type into the union type
   * of `Ok<T, E> | Err<T, E>`.
   * @returns `this` but retyped
   */
  contained(): Ok<T, E> | Err<T, E>;

  /**
   * @returns `true` if the underlying Result is an `Err` variant
   * otherwise `false`
   */
  isErr(): boolean;

  /**
   * @returns `true` if the underlying Result is an `Ok` variant
   * otherwise `false`
   */
  isOk(): boolean;

  /**
   * If the `Result<T, E>` is an `Ok` then `map` will call the given
   * function `f` using the underlying wrapped value of type `T` as
   * the parameter to `f`, which is then wrapped in an `Ok` and returned.
   *
   * If the `Result<T, E>` is an `Err` the `map` will just forward the
   * underlying `Err`, not calling the passed in `f`.
   * @param f A function that will be called using the underlying `T` of an
   * `Ok`
   * @returns a `Result<U, E>` where `U` is the return type of `f`. Returns an `Ok`
   * containing a `U` if this `Result` is `Ok`, otherwise returns the `Err`,
   * not calling `f`.
   */
  map<U>(f: (x: T) => U): Result<U, E>;
  /**
   * Like `map` except the provided `f` acts on the `Err` variant, bringing
   * the error from `E` to `F`. If the `Result` is an `Ok` then it's forwarded without
   * calling f. If `Result` is an `Err` then `f` is called on the underlying `E` returning
   * the `new Err()` containing the `F`.
   * @param f A function that will be called using the underlying `E` of an
   * `Err`
   * @returns a `Result<T, F>` where `F` is the return type of `F`.
   * If this Result is an `Ok` it's just returned and `f` is not called.
   */
  map_err<F>(f: (x: E) => F): Result<T, F>;

  /**
   * Like `map` except `f` itself can fail. This can be used to
   * chain operations that can fail. Crucially the error type `E`
   * must match the error type of the return of `f`.
   *
   * If the this result is `Ok`, `f` is applied on the underlying `T` and
   * the subsequent result is returned. Otherwise if this result is
   * an `Err` this is returned.
   * @param f function to apply to the `T` if this result is an `Ok` which
   * may fail with a `Result<U, E>`.
   * @returns `Result` of the application of `f` or this `Err` if this result
   * is an `Err`
   */
  and_then<U>(f: (x: T) => Result<U, E>): Result<U, E>;

  /**
   * Like `and_then` except `f` is an async function and `and_then_async` is
   * also `async`.
   */
  and_then_async<U>(f: (x: T) => Promise<Result<U, E>>): Promise<Result<U, E>>

  /**
   * Erases the `Result` type signature and returns the underlying `T`
   * if this result is `Ok` and just returns null if this is an `Err`,
   * forgetting the `Err` and underlying error type altogether.
   */
  optional(): T | null;

  /**
   * Erases the `Result` type signature and returns the underlying `T`
   * if this result is `Ok` and returns the underlying `E`
   * if this result is an `Err. Essentially converts the type
   * to a union type of `T` with `E` losing the Result types.
   */
  union(): T | E;

  /**
   * Returns the underlying wrapped `T` if this result is an `Ok`.
   * Otherwise if this result is an `Err`, `unwrap` will throw an
   * Error
   */
  unwrap(): T;

  /**
   * Returns the underlying wrapped `E` if this result is an `Err`.
   * Otherwise if this result is an `Ok`, `unwrap_err` will throw an
   * Error
   */
  unwrap_err(): E;

  /**
   * Returns the underlying wrapped `T` if this result is an `Ok`.
   * Otherwise if this result is an `Err`, the provided default
   * value will be returned
   */
  unwrap_or(d: T): T;
}
