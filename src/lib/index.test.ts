import { ezync } from "./index";

test("simple promise", async () => {
  const result = ezync(1);

  expect(result.then).not.toBeUndefined();
  await expect(result).resolves.toEqual([1]);
});

test("passing function", async () => {
  const resolve = () => 1;
  const result = await ezync(resolve);
  expect(result).toEqual([1]);
});

test("passing promise", async () => {
  const result = await ezync(Promise.resolve(1));
  expect(result).toEqual([1]);
});

test("handle error", async () => {
  const error = {};
  const result = await ezync(Promise.reject(error));
  expect(result).toEqual([undefined, error]);
});

test("chaining", async () => {
  const result = await ezync(1).chain((value) => (value * 2).toString());
  expect(result).toEqual(["2"]);
});

test("cancel", async () => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const callback = jest.fn();
  const result = ezync(delay(10)).chain(callback);
  result.cancel();
  await delay(15);
  expect(callback).toBeCalledTimes(0);
});
