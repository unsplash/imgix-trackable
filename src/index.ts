import base64 = require('base-64');
import queryStringHelpers = require('querystring');
import urlHelpers = require('url');

import { getOrElseMaybe, mapMaybe, Maybe, normalizeMaybe } from './maybe';

const emptyStringToUndefined = (str: string): string | undefined => (str === '' ? undefined : str);

// TS doesn't return the correct type for array and object index signatures. It returns `T` instead
// of `T | undefined`. These helpers give us the correct type.
const getIndex = <X>(index: number, xs: X[]): X | undefined => xs[index];
const getKey = <X>(index: string, xs: { [key: string]: X }): X | undefined => xs[index];

const TRACKING_PARAM = 'ixid';

const getQueryStringFromParsedUrl = (parsedUrl: urlHelpers.Url): Maybe<string> =>
  normalizeMaybe(
    // We cast here to workaround Node typings which incorrectly specify any
    parsedUrl.query as null | string,
  );
type Query = Record<string, string>;
const parseQueryString = (str: string): Query =>
  // We cast here to workaround Node typings which incorrectly specify any
  queryStringHelpers.parse(str) as Query;
const getTrackingQueryParam = (query: Query) => getKey(TRACKING_PARAM, query);

const omit = <T>(key: string, obj: Record<string, T>): Record<string, T> => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};

const set = <T>(key: string, value: T, obj: Record<string, T>): Record<string, T> => {
  const copy = { ...obj };
  copy[key] = value;
  return copy;
};

const mapQueryForUrl = (
  fn: (query: Query) => Query,
  queryStringifyOptions: queryStringHelpers.StringifyOptions,
) => (url: string) => {
  const parsedUrl = urlHelpers.parse(url);

  const maybeQueryString = getQueryStringFromParsedUrl(parsedUrl);
  const query = getOrElseMaybe(() => ({}), mapMaybe(parseQueryString, maybeQueryString));

  const newQuery: Query = fn(query);
  const newQueryString = queryStringHelpers.stringify(
    newQuery,
    undefined,
    undefined,
    queryStringifyOptions,
  );

  const newParsedUrl = { ...parsedUrl, search: newQueryString };
  const newUrl = urlHelpers.format(newParsedUrl);

  return newUrl;
};

const identity = <T>(t: T) => t;

const omitQueryParamFromUrl = (
  param: string,
  queryStringifyOptions: queryStringHelpers.StringifyOptions,
) => (url: string): string =>
  mapQueryForUrl(query => omit(param, query), queryStringifyOptions)(url);

const setQueryParamForUrl = (
  param: string,
  queryStringifyOptions: queryStringHelpers.StringifyOptions,
) => (value: string) => (url: string): string =>
  mapQueryForUrl(query => set(param, value, query), queryStringifyOptions)(url);

//
// End generic helpers
//

export const _findTrackingParamsInUrl = (url: string): Maybe<string> => {
  const parsedUrl = urlHelpers.parse(url);
  const maybeQueryString = getQueryStringFromParsedUrl(parsedUrl);
  const maybeQuery = mapMaybe(parseQueryString, maybeQueryString);
  return mapMaybe(getTrackingQueryParam, maybeQuery);
};

// 1. Opt-out of URI encoding of query param values. imgix requires Base64 encoding, and we handle
//    this prior to this function call.

const omitTrackingParamFromUrl = omitQueryParamFromUrl(TRACKING_PARAM, {
  // [1]
  encodeURIComponent: identity,
});

const setTrackingParamForUrl = setQueryParamForUrl(TRACKING_PARAM, {
  // [1]
  encodeURIComponent: identity,
});

const sanitize = (str: string | undefined) => {
  if (str === undefined) {
    return '';
  }

  return str
    .trim()
    .replace(/[-_\s]+/g, '-')
    .toLowerCase();
};

const encodeTrackingOptions = (...args: (string | undefined)[]) =>
  base64.encode(`${args.map(sanitize).join(';')};`);

type TrackingObject = {
  url: string;
  app?: string;
  page?: string;
  label?: string;
  property?: string;
};

export const track = (baseUrl: string, options: Partial<TrackingObject> = {}) => {
  const { app, page, label, property } = options;

  const newTrackingParams = encodeTrackingOptions(app, page, label, property);
  return setTrackingParamForUrl(newTrackingParams)(baseUrl);
};

export const decode = (originalUrl: string): TrackingObject => {
  const trackingParams = _findTrackingParamsInUrl(originalUrl);

  if (trackingParams === undefined) {
    return { url: originalUrl };
  }

  const encodedValues = trackingParams;
  const decodedValues = base64.decode(encodedValues);
  const values = decodedValues.split(';');

  const url = omitTrackingParamFromUrl(originalUrl);
  const app = getIndex(0, values);
  const page = mapMaybe(emptyStringToUndefined, getIndex(1, values));
  const label = mapMaybe(emptyStringToUndefined, getIndex(2, values));
  const property = mapMaybe(emptyStringToUndefined, getIndex(3, values));

  return {
    url,
    app,
    page,
    label,
    property,
  };
};
