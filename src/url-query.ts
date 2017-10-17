import queryStringHelpers = require('querystring');
import urlHelpers = require('url');

import { omit, set } from './helpers';
import { getOrElseMaybe, mapMaybe, Maybe, normalizeMaybe } from './maybe';

export const getQueryStringFromParsedUrl = (parsedUrl: urlHelpers.Url): Maybe<string> =>
  normalizeMaybe(
    // We cast here to workaround Node typings which incorrectly specify any
    // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/20650
    parsedUrl.query as null | string,
  );

export type Query = Record<string, string>;

export type QueryOptions = {
  queryStringifyOptions: queryStringHelpers.StringifyOptions;
  queryParseOptions: queryStringHelpers.ParseOptions;
};

export const parseQueryString = (queryParseOptions: queryStringHelpers.ParseOptions) => (
  str: string,
): Query =>
  // We cast here to workaround Node typings which incorrectly specify any
  // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/20651
  queryStringHelpers.parse(str, undefined, undefined, queryParseOptions) as Query;

export const mapQueryForUrl = (fn: (query: Query) => Query, queryOptions: QueryOptions) => (
  url: string,
) => {
  const { queryParseOptions, queryStringifyOptions } = queryOptions;

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

export const omitQueryParamFromUrl = (param: string, queryOptions: QueryOptions) => (
  url: string,
): string => mapQueryForUrl(query => omit(param, query), queryOptions)(url);

export const setQueryParamForUrl = (param: string, queryOptions: QueryOptions) => (
  value: string,
) => (url: string): string => mapQueryForUrl(query => set(param, value, query), queryOptions)(url);
