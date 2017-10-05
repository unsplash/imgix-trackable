const imgixTrackable = (baseUrl, options = {}) => {
	const { app, page, label, property } = options;
	return baseUrl + `?ixid=${app}`;
};

module.exports = imgixTrackable;
