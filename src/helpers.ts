export const emptyStringToUndefined = (str: string): string | undefined => (str === '' ? undefined : str);

// TS doesn't return the correct type for array and object index signatures. It returns `T` instead
// of `T | undefined`. These helpers give us the correct type.
// https://github.com/Microsoft/TypeScript/issues/13778
export const getIndex = <X>(index: number, xs: X[]): X | undefined => xs[index];
export const getKey = <X>(index: string, xs: { [key: string]: X }): X | undefined => xs[index];

export const omit = <T>(key: string, obj: Record<string, T>): Record<string, T> => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};

export const set = <T>(key: string, value: T, obj: Record<string, T>): Record<string, T> => {
  const copy = { ...obj };
  copy[key] = value;
  return copy;
};

export const identity = <T>(t: T) => t;

export const getValues = <V>(obj: Record<string, V>): V[] =>
  Object.keys(obj).reduce((acc, key) => {
    const maybeValue = getKey(key, obj);
    const value = maybeValue!;
    return [...acc, value];
  }, []);
