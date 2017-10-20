import base64 = require('base-64');
import queryStringHelpers = require('querystring');
import urlHelpers = require('url');

import { emptyStringToUndefined, getIndex, getKey, getValues, identity } from './helpers';
import { mapMaybe, Maybe } from './maybe';
import {
  getQueryStringFromParsedUrl,
  omitQueryParamFromUrl,
  Query,
  QueryOptions,
  setQueryParamForUrl,
} from './url-query';

const TRACKING_PARAM = 'ixid';

const getTrackingQueryParam = (query: Query): Maybe<string> =>
  mapMaybe(
    queryValue => (typeof queryValue === 'string' ? queryValue : getIndex(0, queryValue)),
    getKey(TRACKING_PARAM, query),
  );

export const _findTrackingParamsInUrl = (url: string): Maybe<string> => {
  const parsedUrl = urlHelpers.parse(url);
  const maybeQueryString = getQueryStringFromParsedUrl(parsedUrl);
  const maybeQuery = mapMaybe(
    str => queryStringHelpers.parse(str, undefined, undefined, { decodeURIComponent: identity }),
    maybeQueryString,
  );
  return mapMaybe(getTrackingQueryParam, maybeQuery);
};

// 1. Opt-out of URI encoding of query param values. imgix requires Base64 encoding, and we handle
//    this prior to this function call.

const queryOptions: QueryOptions = {
  queryStringifyOptions: {
    // [1]
    encodeURIComponent: identity,
  },
  queryParseOptions: {
    // [1]
    decodeURIComponent: identity,
  },
};

const omitTrackingParamFromUrl = omitQueryParamFromUrl(TRACKING_PARAM, queryOptions);

const setTrackingParamForUrl = setQueryParamForUrl(TRACKING_PARAM, queryOptions);

const sanitize = (str: string | undefined) => {
  if (str === undefined) {
    return '';
  }

  return str
    .trim()
    .replace(/[-_\s]+/g, '-')
    .toLowerCase();
};

export const encodeTrackingOptions = (options: RequiredTrackingObjectParams) =>
  base64.encode(
    `${getValues(options)
      .map(sanitize)
      .join(';')};`,
  );

export type RequiredTrackingObjectParams = {
  app: Maybe<string>;
  page: Maybe<string>;
  label: Maybe<string>;
  property: Maybe<string>;
  userId: Maybe<string>;
};

const defaults: RequiredTrackingObjectParams = {
  app: undefined,
  page: undefined,
  label: undefined,
  property: undefined,
  userId: undefined,
};

export type InputTrackingObjectParams = Partial<RequiredTrackingObjectParams>;

type TrackingObject = {
  url: string;
} & InputTrackingObjectParams;

export const track = (baseUrl: string, options: InputTrackingObjectParams) => {
  const optionsWithDefaults: RequiredTrackingObjectParams = {
    ...defaults,
    ...options,
  };
  const newTrackingParams = encodeTrackingOptions(optionsWithDefaults);
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
  const userId = mapMaybe(emptyStringToUndefined, getIndex(4, values));

  return {
    url,
    app,
    page,
    label,
    property,
    userId,
  };
};
