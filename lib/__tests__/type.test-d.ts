import { nanoquery } from "../main";

const noop = () => null;

describe("types", () => {
  test(`specific fetcher overrides common fetcher's type`, () => {
    const emptyPromise = () => new Promise<null>(noop);

    const [createFetcher] = nanoquery({
      fetcher: emptyPromise,
    });
    type Res = { data: string };
    const $manual = createFetcher([""], {
      fetcher: () => new Promise<Res>(noop),
    });
    const { data } = $manual.get();
    expectTypeOf(data).toEqualTypeOf<Res | undefined>();

    createFetcher<Res>([""], {
      // @ts-expect-error: is limited by Res
      fetcher: emptyPromise,
    });
  });

  test("setting error type", () => {
    const [createFetcher] = nanoquery();

    type Err = { msg: string };
    const $manual = createFetcher<null, Err>([""], {
      fetcher: async () => null,
    });
    const { error } = $manual.get();
    expectTypeOf(error).toEqualTypeOf<Err | undefined>();
  });

  test("mutator", () => {
    const [, createMutator] = nanoquery();

    type Data = { msg: string };
    type Result = { res: number };
    type Error = { text: string };
    const $mutate = createMutator<Data, Result, Error>(
      async ({ data, getCacheUpdater }) => {
        expectTypeOf(data).toEqualTypeOf<Data>();
        const [mutateCache, prevState] = getCacheUpdater("some-key");
        expectTypeOf(prevState).toEqualTypeOf<unknown>();
        expectTypeOf(mutateCache).parameter(0).toEqualTypeOf<unknown>();

        return { res: 200 };
      }
    );
    const { mutate, error, data } = $mutate.get();

    expectTypeOf(mutate({ msg: "" })).resolves.toEqualTypeOf<Result>();
    expectTypeOf(error).toEqualTypeOf<Error | undefined>();
    expectTypeOf(data).toEqualTypeOf<Result | undefined>();
  });

  test("mutator accepts void data", () => {
    const [, createMutator] = nanoquery();

    const $mutate = createMutator(async ({ data }) => {
      expectTypeOf(data).toEqualTypeOf<void>();
      return { res: 200 };
    });
    const { mutate } = $mutate.get();

    expectTypeOf(mutate()).resolves.toEqualTypeOf<{ res: number }>();
  });
});
