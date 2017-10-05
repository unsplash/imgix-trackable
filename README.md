# imgix-trackable [![Build Status](https://travis-ci.org/unsplash/imgix-trackable.svg?branch=master)](https://travis-ci.org/unsplash/imgix-trackable)

Easily track the source and use of an image via its via the `ixid` param.

## Install

```
$ npm install imgix-trackable
```

## Usage

```js
const imgixTrackable = require('imgix-trackable');

imgixTrackable('https://images.unsplash.com/photo-123', {
  app: 'my-app',
  page: 'search',
  label: 'dog',
  property: '1'
});
//=> 'https://images.unsplash.com/photo-123?ixid=asdasd'
```


## API

### imgixTrackable(url, [options])

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

An additional identifier, like the position on the page. (optional)

## License

MIT © [Unsplash](http://github.com/unsplash)
