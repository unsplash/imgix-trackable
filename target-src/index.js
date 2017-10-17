"use strict";
exports.__esModule = true;
var base64 = require("base-64");
var TRACKING_PARAM = 'ixid';
var trackingExpression = /(ixid=.*(?=&))|(ixid=.*)/i;
exports._findTrackingParamsInUrl = function (url) {
    var matches = url.match(trackingExpression);
    if (matches) {
        return matches[0];
    }
    else {
        return '';
    }
};
var sanitize = function (str) {
    if (!str) {
        return '';
    }
    return str
        .trim()
        .replace(/[-_\s]+/g, '-')
        .toLowerCase();
};
var encodeTrackingOptions = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return base64.encode(args.map(sanitize).join(';') + ';');
};
var buildTrackingObject = function (_a) {
    var url = _a.url, app = _a.app, page = _a.page, label = _a.label, property = _a.property;
    return {
        url: url,
        app: app,
        page: page,
        label: label,
        property: property
    };
};
exports.track = function (baseUrl, options) {
    if (options === void 0) { options = {}; }
    var app = options.app, page = options.page, label = options.label, property = options.property;
    var newTrackingParams = TRACKING_PARAM + "=" + encodeTrackingOptions(app, page, label, property);
    var existingTrackParams = exports._findTrackingParamsInUrl(baseUrl);
    if (existingTrackParams) {
        return baseUrl.replace(existingTrackParams, newTrackingParams);
    }
    else {
        var hasParams = baseUrl.split('?').length >= 2;
        var joinOperator = hasParams ? '&' : '?';
        return baseUrl + joinOperator + newTrackingParams;
    }
};
exports.decode = function (originalUrl) {
    var trackingParams = exports._findTrackingParamsInUrl(originalUrl);
    if (!trackingParams) {
        return buildTrackingObject({ url: originalUrl });
    }
    var encodedValues = trackingParams.split(TRACKING_PARAM + "=")[1];
    var decodedValues = base64.decode(encodedValues);
    var values = decodedValues.split(';');
    var app = values[0];
    var page = values[1] || undefined;
    var label = values[2] || undefined;
    var property = values[3] || undefined;
    return buildTrackingObject({
        url: originalUrl.replace(new RegExp("." + trackingParams), ''),
        app: app,
        page: page,
        label: label,
        property: property
    });
};
