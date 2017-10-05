'use strict';

var base64 = require('base-64');

var TRACKING_PARAM = 'ixid';

var trackingExpression = /(ixid=.*(?=&))|(ixid=.*)/i;
var findTrackingParamsInUrl = function findTrackingParamsInUrl(url) {
	var matches = url.match(trackingExpression);

	if (matches) {
		return matches[0];
	} else {
		return '';
	}
};

var sanitize = function sanitize(str) {
	if (!str) {
		return '';
	}

	return str.trim().replace(/[-_\s]+/g, '-').toLowerCase();
};

var encodeTrackingOptions = function encodeTrackingOptions() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return base64.encode(args.map(sanitize).join(';') + ';');
};

var buildTrackingObject = function buildTrackingObject(_ref) {
	var url = _ref.url,
	    app = _ref.app,
	    page = _ref.page,
	    label = _ref.label,
	    property = _ref.property;

	return {
		url: url,
		app: app,
		page: page,
		label: label,
		property: property
	};
};

var track = function track(baseUrl) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var app = options.app,
	    page = options.page,
	    label = options.label,
	    property = options.property;


	var newTrackingParams = TRACKING_PARAM + '=' + encodeTrackingOptions(app, page, label, property);
	var existingTrackParams = findTrackingParamsInUrl(baseUrl);

	if (existingTrackParams) {
		return baseUrl.replace(existingTrackParams, newTrackingParams);
	} else {
		var hasParams = baseUrl.split('?').length >= 2;
		var joinOperator = hasParams ? '&' : '?';

		return baseUrl + joinOperator + newTrackingParams;
	}
};

var decode = function decode(originalUrl) {
	var trackingParams = findTrackingParamsInUrl(originalUrl);

	if (!trackingParams) {
		return buildTrackingObject({ url: originalUrl });
	}

	var encodedValues = trackingParams.split(TRACKING_PARAM + '=')[1];
	var decodedValues = base64.decode(encodedValues);
	var values = decodedValues.split(';');

	var app = values[0];
	var page = values[1] || undefined;
	var label = values[2] || undefined;
	var property = values[3] || undefined;

	return buildTrackingObject({
		url: originalUrl.replace(new RegExp('.' + trackingParams), ''),
		app: app,
		page: page,
		label: label,
		property: property
	});
};

module.exports = {
	_findTrackingParamsInUrl: findTrackingParamsInUrl,
	track: track,
	decode: decode
};