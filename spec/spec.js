const base64 = require('base-64');

describe("imgix-trackable", function() {
  const track = require('../lib').track;
  const decode = require('../lib').decode;
  const findTrackingParamsInUrl = require('../lib')._findTrackingParamsInUrl;

  describe("#findTrackingParamsInUrl", () => {
    it("", () => {
      const url = "https://images.unsplash.com/photo-123?w=200&ixid=asdkasdkahsdhasd==&dog=true";

      expect(findTrackingParamsInUrl(url)).toEqual("ixid=asdkasdkahsdhasd==");
    });

    it("", () => {
      const url = "https://images.unsplash.com/photo-123?w=200&ixid=asdkasdkahsdhasd==";

      expect(findTrackingParamsInUrl(url)).toEqual("ixid=asdkasdkahsdhasd==");
    });

    it("", () => {
      const url = "https://images.unsplash.com/photo-123?ixid=asdkasdkahsdhasd==&w=200";

      expect(findTrackingParamsInUrl(url)).toEqual("ixid=asdkasdkahsdhasd==");
    });

    it("", () => {
      const url = "https://images.unsplash.com/photo-123?ixid=asdkasdkahsdhasd==";

      expect(findTrackingParamsInUrl(url)).toEqual("ixid=asdkasdkahsdhasd==");
    });

    it("", () => {
      const url = "https://images.unsplash.com/photo-123?w=200";

      expect(findTrackingParamsInUrl(url)).toEqual("");
    });

    it("", () => {
      const url = "https://images.unsplash.com/photo-123?w=200&ixid=&dog=true";

      expect(findTrackingParamsInUrl(url)).toEqual("ixid=");
    });
  });

  describe("#track", () => {
    it("encodes the tracking options in base 64", () => {
      const baseUrl = 'https://images.unsplash.com/photo-123';
      const appName = 'my-app';
      const appPage = 'search';
      const appLabel = 'dog';
      const appProperty = '5';

      const trackedUrl = track(baseUrl, {
        app: appName,
        page: appPage,
        label: appLabel,
        property: appProperty
      });

      const encodedValues = trackedUrl.split('ixid=')[1];
      const decodedValues = base64.decode(encodedValues);

      expect(decodedValues).toEqual(`${appName};${appPage};${appLabel};${appProperty};`);
    });

    describe("when the URL has no params", () => {
      it("should add the ixid param", function() {
        const baseUrl = 'https://images.unsplash.com/photo-123';
        const trackedUrl = track(baseUrl, { app: 'my-app' });

        expect(trackedUrl).toContain('?ixid=');
      });
    });

    describe("when the URL has params", () => {
      it("should add the ixid param", function() {
        const baseUrl = 'https://images.unsplash.com/photo-123?w=200';
        const trackedUrl = track(baseUrl, { app: 'my-app' });

        expect(trackedUrl.split('?').length).toEqual(2);
        expect(trackedUrl).toContain('ixid=');
      });
    });

    describe("when the URL already has a tracklable param", () => {
      it("should override the ixid param", function() {
        const baseUrl = 'https://images.unsplash.com/photo-123?w=200&ixid=456';
        const trackedUrl = track(baseUrl, { app: 'my-app' });

        expect(trackedUrl).toContain('ixid=');
        expect(trackedUrl).not.toContain('456');
      });
    });
  });
});
