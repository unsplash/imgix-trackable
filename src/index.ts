import base64 = require('base-64');
import urlHelpers = require('url');

import { emptyStringToUndefined, getIndex, getKey, identity } from './helpers';
import { mapMaybe, Maybe } from './maybe';
import {
  getQueryStringFromParsedUrl,
  omitQueryParamFromUrl,
  parseQueryString,
  Query,
  QueryOptions,
  setQueryParamForUrl,
} from './url-query';

//
// End generic helpers
//

const TRACKING_PARAM = 'ixid';

const getTrackingQueryParam = (query: Query) => getKey(TRACKING_PARAM, query);

export const _findTrackingParamsInUrl = (url: string): Maybe<string> => {
  const parsedUrl = urlHelpers.parse(url);
  const maybeQueryString = getQueryStringFromParsedUrl(parsedUrl);
  const maybeQuery = mapMaybe(parseQueryString({ decodeURIComponent: identity }), maybeQueryString);
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
