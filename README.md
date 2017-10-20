# imgix-trackable [![Build Status](https://travis-ci.org/unsplash/imgix-trackable.svg?branch=master)](https://travis-ci.org/unsplash/imgix-trackable)

Easily track the source and use of an image via its `ixid` param.

## Rules

These URLs are encoded and decoded using a few rules:

1. all parameters are lowercase and dasherized, i.e. `unsplash`, `unsplash-source`, `unsplash-instant`, etc.
2. if a tracking parameter is not needed, it is replaced with an empty string. i.e. if given `{ app: 'my-app', page: null, label: 'dog', property: '1' }`, the decoded tracking would be: `my-app;;dog;1;`
3. an `app` value must always be given

## Install

```
$ npm install imgix-trackable
```

## API

### track(url, [options])

Add or override the tracking parameters on an imgix URL.

```js
const imgixTrackable = require('imgix-trackable');

imgixTrackable.track('https://images.unsplash.com/photo-123', {
  app: 'my-app',
  page: 'search',
  label: 'dog',
  property: '1'
});
//=> 'https://images.unsplash.com/photo-123?ixid={base64EncodedOptions}'
```

#### url

Type: `string`

The base URL. If an `ixid` parameter already exists, it will be overrided by whatever options you supply to `imgixTrackable`.

#### options

##### app

Type: `string`<br>
Default: `null`

The app name to track. (optional)

##### page

Type: `string`<br>
Default: `null`

The type of page the image is used on. (optional)

##### label

Type: `string`<br>
Default: `null`

A more specific identifier for the page. (optional)

##### property

Type: `string`<br>
Default: `null`

##### userId

Type: `string`<br>
Default: `null`

The user ID.

### decode(url)

Take an imgix URL that may have tracking on it, and return the tracking parameters. This is the inverse operation of `track`.

```js
const imgixTrackable = require('imgix-trackable');

imgixTrackable.decode('https://images.unsplash.com/photo-123?ixid=');
//=>
// {
//   url: 'https://images.unsplash.com/photo-123',
//   app: 'my-app',
//   page: 'search',
//   label: 'dog',
//   property: '1'
//  }
```

Returns a `trackableObject`, with the tracking properties split from the URL. Note: the `url` will still contain other properties, like the `w`, `h`, etc.

## License

MIT © [Unsplash](http://github.com/unsplash)
