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

const track = (baseUrl, options = {}) => {
	const { app, page, label, property } = options;

	const base64EncodedOptions = base64.encode(`${app};${page};${label};${property};`)
	const newTrackingParams = `${TRACKING_PARAM}=${base64EncodedOptions}`;
	const existingTrackParams = findTrackingParamsInUrl(baseUrl);

	if (existingTrackParams) {
		return baseUrl.replace(existingTrackParams, newTrackingParams);
	} else {
		const hasParams = baseUrl.split('?').length >= 2;
		const joinOperator = hasParams ? '&' : '?';

		return baseUrl + joinOperator + newTrackingParams;
	}
};

// TODO: write a decode function
const decode = (url) => {
	const encodedValues = url.split(`${TRACKING_PARAM}=`);
	const decodedValues = base64.decode(encodedValues);

	return decodedValues;
};

module.exports = {
	_findTrackingParamsInUrl: findTrackingParamsInUrl,
	track,
	decode
};
