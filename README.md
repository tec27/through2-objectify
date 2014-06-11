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
`var objectify = require('through2-objectify')`

`objectify([options,] transformFn [, flushFn])`

Create a through2 transform stream that converts buffers (or strings) to objects.

`objectify.ctor([options,] transformFn [, flushFn])`

Returns a constructor function for a custom stream that converts buffers (or strings) to objects. Useful if you want to have multiple streams with the same transform/flush functions, or if you want to inherit from the stream type.

`objectify.deobj([options,] transformFn [, flushFn])`

Create a through2 transform stream that converts objects to buffers (or strings).

`objectify.deobjCtor([options,] transformFn [, flushFn])`

Returns a constructor function for a custom stream that converts objects to buffers (or strings).

### options
Any options valid for Transform streams can be passed, as well as the following objectify-specific options:

`objectHighWaterMark`

Sets the highWaterMark specifically for the object side of the stream
(i.e. Readable on objectify, Writable on deobjectify). This allows you to control highWaterMarks separately
and not buffer e.g. 16k objects when you want to buffer 16k bytes.

Defaults to **16**.

### transformFn
`function(chunk, enc, cb)`

Called for each buffer/string/object that needs to be transformed. See streams and through2 documentation for further details.

### flushFn
`function(cb)`

Called just before emitting the `end` signal, but after all data has been transformed. See streams and through2 documentation for further details.

## See also
* [through2](https://github.com/rvagg/through2)
* [Node streams](http://nodejs.org/api/stream.html)

## Installation
`npm install through2-objectify`

## Running tests
`npm test`

## License
MIT
