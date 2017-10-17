import queryStringHelpers = require('querystring');
import urlHelpers = require('url');

import { omit, set } from './helpers';
import { getOrElseMaybe, mapMaybe, Maybe, normalizeMaybe } from './maybe';

export const getQueryStringFromParsedUrl = (parsedUrl: urlHelpers.Url): Maybe<string> =>
  normalizeMaybe(
    // We cast here to workaround Node typings which incorrectly specify any
    parsedUrl.query as null | string,
  );

export type Query = Record<string, string>;

export const parseQueryString = (queryParseOptions: queryStringHelpers.ParseOptions) => (
  str: string,
): Query =>
  // We cast here to workaround Node typings which incorrectly specify any
  queryStringHelpers.parse(str, undefined, undefined, queryParseOptions) as Query;

export const mapQueryForUrl = (
  fn: (query: Query) => Query,
  queryStringifyOptions: queryStringHelpers.StringifyOptions,
  queryParseOptions: queryStringHelpers.ParseOptions,
) => (url: string) => {
  const parsedUrl = urlHelpers.parse(url);

  const maybeQueryString = getQueryStringFromParsedUrl(parsedUrl);
  const query = getOrElseMaybe(
    () => ({}),
    mapMaybe(parseQueryString(queryParseOptions), maybeQueryString),
  );

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

export const omitQueryParamFromUrl = (
  param: string,
  queryStringifyOptions: queryStringHelpers.StringifyOptions,
  queryParseOptions: queryStringHelpers.ParseOptions,
) => (url: string): string =>
  mapQueryForUrl(query => omit(param, query), queryStringifyOptions, queryParseOptions)(url);

export const setQueryParamForUrl = (
  param: string,
  queryStringifyOptions: queryStringHelpers.StringifyOptions,
  queryParseOptions: queryStringHelpers.ParseOptions,
) => (value: string) => (url: string): string =>
  mapQueryForUrl(query => set(param, value, query), queryStringifyOptions, queryParseOptions)(url);
