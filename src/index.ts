import base64 = require('base-64');

const TRACKING_PARAM = 'ixid';

const trackingExpression = /(ixid=.*(?=&))|(ixid=.*)/i;
export const _findTrackingParamsInUrl = (url: string) => {
  const matches = url.match(trackingExpression);

  if (matches !== null) {
    return matches[0];
  } else {
    return '';
  }
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

  const newTrackingParams = `${TRACKING_PARAM}=${encodeTrackingOptions(
    app,
    page,
    label,
    property,
  )}`;
  const existingTrackParams = _findTrackingParamsInUrl(baseUrl);

  if (existingTrackParams !== '') {
    return baseUrl.replace(existingTrackParams, newTrackingParams);
  } else {
    const hasParams = baseUrl.split('?').length >= 2;
    const joinOperator = hasParams ? '&' : '?';

    return baseUrl + joinOperator + newTrackingParams;
  }
};

const emptyStringToUndefined = (str: string): string | undefined => str === '' ? undefined : str;

export const decode = (originalUrl: string) => {
  const trackingParams = _findTrackingParamsInUrl(originalUrl);

  if (trackingParams === '') {
    return buildTrackingObject({ url: originalUrl });
  }

  const encodedValues = trackingParams.split(`${TRACKING_PARAM}=`)[1];
  const decodedValues = base64.decode(encodedValues);
  const values = decodedValues.split(';');

  const app = values[0];
  const page = emptyStringToUndefined(values[1]);
  const label = emptyStringToUndefined(values[2]);
  const property = emptyStringToUndefined(values[3]);

  return buildTrackingObject({
    url: originalUrl.replace(new RegExp(`.${trackingParams}`), ''),
    app,
    page,
    label,
    property,
  });
};
