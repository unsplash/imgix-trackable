import base64 = require('base-64');

import { _findTrackingParamsInUrl as findTrackingParamsInUrl, decode, track } from '../src';

describe('imgix-trackable', function() {
  describe('#findTrackingParamsInUrl', () => {
    it('', () => {
      const url = 'https://images.unsplash.com/photo-123?w=200&ixid=asdkasdkahsdhasd==&dog=true';

      expect(findTrackingParamsInUrl(url)).toEqual('asdkasdkahsdhasd==');
    });

    it('', () => {
      const url = 'https://images.unsplash.com/photo-123?w=200&ixid=asdkasdkahsdhasd==';

      expect(findTrackingParamsInUrl(url)).toEqual('asdkasdkahsdhasd==');
    });

    it('', () => {
      const url = 'https://images.unsplash.com/photo-123?ixid=asdkasdkahsdhasd==&w=200';

      expect(findTrackingParamsInUrl(url)).toEqual('asdkasdkahsdhasd==');
    });

    it('', () => {
      const url = 'https://images.unsplash.com/photo-123?ixid=asdkasdkahsdhasd==';

      expect(findTrackingParamsInUrl(url)).toEqual('asdkasdkahsdhasd==');
    });

    it('', () => {
      const url = 'https://images.unsplash.com/photo-123?w=200';

      expect(findTrackingParamsInUrl(url)).toEqual(undefined);
    });

    it('', () => {
      const url = 'https://images.unsplash.com/photo-123?w=200&ixid=&dog=true';

      expect(findTrackingParamsInUrl(url)).toEqual('');
    });
  });

  describe('#track', () => {
    it('encodes the tracking options in base 64', () => {
      const baseUrl = 'https://images.unsplash.com/photo-123';
      const app = 'my-app';
      const page = 'search';
      const label = 'dog';
      const property = '5';

      const trackedUrl = track(baseUrl, {
        app,
        page,
        label,
        property,
      });

      const encodedValues = trackedUrl.split('ixid=')[1];
      const decodedValues = base64.decode(encodedValues);

      expect(decodedValues).toEqual(`my-app;search;dog;5;`);
    });

    it('dasherizes the tracking options', () => {
      const baseUrl = 'https://images.unsplash.com/photo-123';
      const app = 'my app';
      const page = 'search';
      const label = 'new york';
      const property = '5';

      const trackedUrl = track(baseUrl, {
        app,
        page,
        label,
        property,
      });

      const encodedValues = trackedUrl.split('ixid=')[1];
      const decodedValues = base64.decode(encodedValues);

      expect(decodedValues).toEqual(`my-app;search;new-york;5;`);
    });

    it('lowercases the tracking options', () => {
      const baseUrl = 'https://images.unsplash.com/photo-123';
      const app = 'MY App';
      const page = 'search';
      const label = 'Dog';
      const property = '5';

      const trackedUrl = track(baseUrl, {
        app,
        page,
        label,
        property,
      });

      const encodedValues = trackedUrl.split('ixid=')[1];
      const decodedValues = base64.decode(encodedValues);

      expect(decodedValues).toEqual(`my-app;search;dog;5;`);
    });

    describe('when the URL has no params', () => {
      it('should add the ixid param', function() {
        const baseUrl = 'https://images.unsplash.com/photo-123';
        const trackedUrl = track(baseUrl, { app: 'my-app' });

        expect(trackedUrl).toContain('?ixid=');
      });
    });

    describe('when the URL has params', () => {
      it('should add the ixid param', function() {
        const baseUrl = 'https://images.unsplash.com/photo-123?w=200';
        const trackedUrl = track(baseUrl, { app: 'my-app' });

        expect(trackedUrl.split('?').length).toEqual(2);
        expect(trackedUrl).toContain('ixid=');
      });
    });

    describe('when the URL already has a tracklable param', () => {
      it('should override the ixid param', function() {
        const baseUrl = 'https://images.unsplash.com/photo-123?w=200&ixid=456';
        const trackedUrl = track(baseUrl, { app: 'my-app' });

        expect(trackedUrl).toContain('ixid=');
        expect(trackedUrl).not.toContain('456');
      });
    });
  });

  describe('#decode', () => {
    it('splits the URL back into its tracking components', () => {
      // URL: 'https://images.unsplash.com/photo-123?w=200&ixid=...
      // Options:
      const app = 'my-app';
      const page = '';
      const label = '';
      const property = '';
      const encoded = base64.encode(`${app};${page};${label};${property};`);
      const url = `https://images.unsplash.com/photo-123?w=200&ixid=${encoded}`;

      const tracklableObject = decode(url);

      expect(tracklableObject.url).toEqual('https://images.unsplash.com/photo-123?w=200');
      expect(tracklableObject.app).toEqual('my-app');
      expect(tracklableObject.page).toEqual(undefined);
      expect(tracklableObject.label).toEqual(undefined);
      expect(tracklableObject.property).toEqual(undefined);
    });

    it('splits the URL back into its tracking components', () => {
      // URL: https://images.unsplash.com/photo-123?w=200?ixid=...
      // Options:
      const app = 'my-app';
      const page = 'search';
      const label = 'dog';
      const property = '5';
      const encoded = base64.encode(`${app};${page};${label};${property};`);
      const url = `https://images.unsplash.com/photo-123?w=200&ixid=${encoded}`;

      const tracklableObject = decode(url);

      expect(tracklableObject.url).toEqual('https://images.unsplash.com/photo-123?w=200');
      expect(tracklableObject.app).toEqual('my-app');
      expect(tracklableObject.page).toEqual('search');
      expect(tracklableObject.label).toEqual('dog');
      expect(tracklableObject.property).toEqual('5');
    });

    it('splits the URL back into its tracking components', () => {
      // URL: https://images.unsplash.com/photo-123?w=200&ixid=...&h=300
      // Options:
      const app = 'my-app';
      const page = '';
      const label = '';
      const property = '';
      const encoded = base64.encode(`${app};${page};${label};${property};`);
      const url = `https://images.unsplash.com/photo-123?w=200&ixid=${encoded}&h=300`;

      const tracklableObject = decode(url);

      expect(tracklableObject.url).toEqual('https://images.unsplash.com/photo-123?w=200&h=300');
      expect(tracklableObject.app).toEqual('my-app');
      expect(tracklableObject.page).toEqual(undefined);
      expect(tracklableObject.label).toEqual(undefined);
      expect(tracklableObject.property).toEqual(undefined);
    });

    it('given a URL without a tracking param, it splits the URL back into its tracking components', () => {
      const url = 'https://images.unsplash.com/photo-123?w=200&h=300';

      const tracklableObject = decode(url);

      expect(tracklableObject.url).toEqual('https://images.unsplash.com/photo-123?w=200&h=300');
      expect(tracklableObject.app).toEqual(undefined);
      expect(tracklableObject.page).toEqual(undefined);
      expect(tracklableObject.label).toEqual(undefined);
      expect(tracklableObject.property).toEqual(undefined);
    });
  });
});
