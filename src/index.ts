import base64 = require('base-64');
import queryStringHelpers = require('querystring');
import urlHelpers = require('url');

const emptyStringToUndefined = (str: string): string | undefined => (str === '' ? undefined : str);
const getIndex = <X>(index: number, xs: X[]): X | undefined => xs[index];
const getKey = <X>(index: string, xs: { [key: string]: X }): X | undefined => xs[index];

type Maybe<T> = undefined | T;

const isMaybeDefined = <T>(maybeT: Maybe<T>): maybeT is T => maybeT !== undefined;

const mapMaybe = <T, B>(f: (t: T) => B, maybeT: Maybe<T>): Maybe<B> =>
  isMaybeDefined(maybeT) ? f(maybeT) : maybeT;

const getOrElseMaybe = <T>(f: () => T, maybeT: Maybe<T>): T =>
  isMaybeDefined(maybeT) ? maybeT : f();

const normalizeMaybe = <T>(nullMaybe: T | null) => (nullMaybe === null ? undefined : nullMaybe);

const TRACKING_PARAM = 'ixid';

const getQueryStringFromUrl = (str: string): Maybe<string> =>
  normalizeMaybe(
    // We cast here to workaround Node typings which incorrectly specify any
    urlHelpers.parse(str).query as null | string,
  );
const parseQueryString = (str: string): Record<string, string> =>
  // We cast here to workaround Node typings which incorrectly specify any
  queryStringHelpers.parse(str) as Record<string, string>;

export const _findTrackingParamsInUrl = (url: string): string => {
  const maybeQueryString = getQueryStringFromUrl(url);
  const maybeQuery = mapMaybe(parseQueryString, maybeQueryString);
  return getOrElseMaybe(
    () => '',
    mapMaybe(query => getKey(TRACKING_PARAM, query), maybeQuery),
  );
};

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
  app: string;
  page: string;
  label: string;
  property: string;
};

const buildTrackingObject = ({ url, app, page, label, property }: Partial<TrackingObject>) =>
  ({
    url,
    app,
    page,
    label,
    property,
  });

export const track = (baseUrl: string, options: Partial<TrackingObject> = {}) => {
  const { app, page, label, property } = options;

  const newTrackingParams = encodeTrackingOptions(
    app,
    page,
    label,
    property,
  );
  const existingTrackParams = _findTrackingParamsInUrl(baseUrl);

  if (existingTrackParams !== '') {
    return baseUrl.replace(existingTrackParams, newTrackingParams);
  } else {
    const hasParams = baseUrl.split('?').length >= 2;
    const joinOperator = hasParams ? '&' : '?';

    return baseUrl + joinOperator + `${TRACKING_PARAM}=${newTrackingParams}`;
  }
};

export const decode = (originalUrl: string) => {
  const trackingParams = _findTrackingParamsInUrl(originalUrl);

  if (trackingParams === '') {
    return buildTrackingObject({ url: originalUrl });
  }

  const encodedValues = trackingParams;
  const decodedValues = base64.decode(encodedValues);
  const values = decodedValues.split(';');

  const app = getIndex(0, values);
  const page = mapMaybe(emptyStringToUndefined, getIndex(1, values));
  const label = mapMaybe(emptyStringToUndefined, getIndex(2, values));
  const property = mapMaybe(emptyStringToUndefined, getIndex(3, values));

  return buildTrackingObject({
    url: originalUrl.replace(new RegExp(`.${TRACKING_PARAM}=${trackingParams}`), ''),
    app,
    page,
    label,
    property,
  });
};
