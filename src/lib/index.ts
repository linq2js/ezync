export type PromiseValueInfer<T> = T extends Promise<infer V> ? V : T;

export interface CancelablePromise<T> extends Promise<T> {
  cancel(): void;
}

export interface AsyncResult<T> extends CancelablePromise<[T, any]> {
  chain<V1>(f1: (value: T) => V1): AsyncResult<V1>;
  chain<V1, V2>(f1: (value: T) => V1, f2: (value: V1) => V2): AsyncResult<V2>;
  chain<V1, V2, V3>(
    f1: (value: T) => V1,
    f2: (value: V1) => V2,
    f3: (value: V2) => V3
  ): AsyncResult<V3>;
  chain<V1, V2, V3, V4>(
    f1: (value: T) => V1,
    f2: (value: V1) => V2,
    f3: (value: V2) => V3,
    f4: (value: V3) => V4
  ): AsyncResult<V4>;
  chain<V1, V2, V3, V4, V5>(
    f1: (value: T) => V1,
    f2: (value: V1) => V2,
    f3: (value: V2) => V3,
    f4: (value: V3) => V4,
    f5: (value: V4) => V5
  ): AsyncResult<V5>;
  chain<V>(...funcs: ((args: any[]) => any)[]): AsyncResult<V>;
}

export function ezync<T>(
  value: T,
  cancel?: () => void
): T extends (...args: any[]) => any
  ? AsyncResult<PromiseValueInfer<ReturnType<T>>>
  : AsyncResult<PromiseValueInfer<T>> {
  if (typeof value === "function") {
    value = value();
  }

  let cancelled = false;
  let done = false;

  const v = value as any;

  if (!cancel && v && typeof v.cancel === "function") {
    cancel = v.cancel;
  }

  const promise = new Promise<any>((resolve) => {
    if (v && typeof v.then === "function") {
      return v.then(
        (result: any) => {
          if (cancelled) return;
          done = true;
          resolve([result]);
        },
        (error: any) => {
          if (cancelled) return;
          done = true;
          resolve([, error]);
        }
      );
    }
    done = true;
    if (value instanceof Error) {
      return resolve([, value]);
    }
    return resolve([value]);
  });

  const cancelWrapper = () => {
    if (cancelled || done) return;
    cancelled = true;
    cancel?.();
  };

  return Object.assign(promise, {
    cancel: cancelWrapper,
    chain: (...funcs: ((value: any) => any)[]) =>
      ezync(
        funcs.reduce((p, f) => p.then(f), promise),
        cancelWrapper
      ),
  });
}
