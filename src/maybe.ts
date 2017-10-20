export type Maybe<T> = undefined | T;

export const isMaybeDefined = <T>(maybeT: Maybe<T>): maybeT is T => maybeT !== undefined;

export const mapMaybe = <T, B>(f: (t: T) => B, maybeT: Maybe<T>): Maybe<B> =>
  isMaybeDefined(maybeT) ? f(maybeT) : maybeT;

export const getOrElseMaybe = <T>(f: () => T, maybeT: Maybe<T>): T =>
  isMaybeDefined(maybeT) ? maybeT : f();

export const normalizeMaybe = <T>(nullMaybe: T | null) =>
  nullMaybe === null ? undefined : nullMaybe;
