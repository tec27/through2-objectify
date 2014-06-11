#through2-objectify
A through2 for transforming a buffer (or string) stream to an objectMode one (or vice-versa).

[![Build Status](https://img.shields.io/travis/tec27/through2-objectify.png?style=flat)](https://travis-ci.org/tec27/through2-objectify)
[![NPM](https://img.shields.io/npm/v/through2-objectify.svg?style=flat)](https://www.npmjs.org/package/through2-objectify)

[![NPM](https://nodei.co/npm/through2-objectify.png)](https://www.npmjs.org/package/through2-objectify)

## Usage
```javascript
var objectify = require('through2-objectify')
  , concat = require('concat-stream')
  , net = require('net')

var srv = net.createServer(function(c) {
  c.end('abc')
}).listen(1337)

net.connect(1337).pipe(objectify(function(chunk, enc, cb) {
  var s = chunk.toString()
  for (var i = 0; i < s.length; i++) {
    this.push({ c: s[i] })
  }
  cb()
})).pipe(concat(function(values) {
  console.dir(values)
  /* Output:
    [
      { c: 'a' },
      { c: 'b' },
      { c: 'c' }
    ]
  */

  srv.close()
})
```

## API

## Installation
`npm install through2-objectify`

## Running tests
`npm test`

## License
MIT
