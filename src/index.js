const base64 = require('base-64');

const TRACKING_PARAM = 'ixid';

const trackingExpression = /(ixid=.*(?=&))|(ixid=.*)/i;
const findTrackingParamsInUrl = (url) => {
	const matches = url.match(trackingExpression);

	if (matches) {
		return matches[0];
	} else {
		return '';
	}
};

const dasherize = (str) => {
	if (!str) { return ''; }

	return str.trim()
    .replace(/[-_\s]+/g, '-')
    .toLowerCase();
};

const encodeTrackingOptions = (...args) => {
	return base64.encode(args.map(dasherize).join(';') + ';');
};

const buildTrackingObject = ({ url, app, page, label, property }) => {
	return {
		url,
		app,
		page,
		label,
		property
	}
};

const track = (baseUrl, options = {}) => {
	const { app, page, label, property } = options;

	const newTrackingParams = `${TRACKING_PARAM}=${encodeTrackingOptions(app, page, label, property)}`;
	const existingTrackParams = findTrackingParamsInUrl(baseUrl);

	if (existingTrackParams) {
		return baseUrl.replace(existingTrackParams, newTrackingParams);
	} else {
		const hasParams = baseUrl.split('?').length >= 2;
		const joinOperator = hasParams ? '&' : '?';

		return baseUrl + joinOperator + newTrackingParams;
	}
};

const decode = (originalUrl) => {
	const trackingParams = findTrackingParamsInUrl(originalUrl);

	if (!trackingParams) {
		return buildTrackingObject({ url: originalUrl });
	}

	const encodedValues = trackingParams.split(`${TRACKING_PARAM}=`)[1];
	const decodedValues = base64.decode(encodedValues);
	const values = decodedValues.split(';');

	const app = values[0];
	const page = values[1] || undefined;
	const label = values[2] || undefined;
	const property = values[3] || undefined;

	return buildTrackingObject({
		url: originalUrl.replace(new RegExp(`.${trackingParams}`), ''),
		app,
		page,
		label,
		property
	});
};

module.exports = {
	_findTrackingParamsInUrl: findTrackingParamsInUrl,
	track,
	decode
};
