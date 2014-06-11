var test = require('tap').test
  , spigot = require('stream-spigot')
  , concat = require('concat-stream')
  , objectify = require('../')

function concatEquals(t, opts, to) {
  if (to === undefined) {
    to = opts
    opts = {}
  }

  return concat(opts, function(values) {
    t.deepEquals(values, to)
    t.end()
  })
}

function bufToObj(buf, enc, cb) {
  this.push({ value: buf.toString() })
  cb()
}

function strToObj(str, enc, cb) {
  this.push({ value: str })
  cb()
}

var data = [ 'a', 's', 'd', 'f' ]
var objectifiedData = data.map(function(value) {
  return { value: value }
})

test('objectify', function(t) {
  var stream = objectify(bufToObj)

  spigot(data)
    .pipe(stream)
    .pipe(concatEquals(t, { objectMode: true }, objectifiedData))
})

test('objectify, options', function(t) {
  var stream = objectify({ decodeStrings: false }, strToObj)

  spigot({ encoding: 'utf8' }, data)
    .pipe(stream)
    .pipe(concatEquals(t, { objectMode: true }, objectifiedData))
})

test('ctor', function(t) {
  var Stream = objectify.ctor(bufToObj)

  spigot(data)
    .pipe(new Stream())
    .pipe(concatEquals(t, { objectMode: true }, objectifiedData))
})

test('ctor, options', function(t) {
  var Stream = objectify.ctor({ decodeStrings: false }, strToObj)

  spigot({ encoding: 'utf8' }, data)
    .pipe(new Stream())
    .pipe(concatEquals(t, { objectMode: true }, objectifiedData))
})

test('objectify, objectHighWaterMark', function(t) {
  var chunks = 0
  var stream = objectify({ objectHighWaterMark: 1 }, function(chunk, enc, cb) {
    chunks++
    this.push({ value: chunk.toString() })
    cb()
  })

  var moar = stream.write('a')
  t.equal(moar, true)
  moar = stream.write('s')
  t.equal(moar, true)

  // only one object should have been created, after that the readable buffer is full
  t.equal(chunks, 1)
  t.end()
})

function objTransform(obj, enc, cb) {
  this.push(obj.value)
  cb()
}

var bufferData = data.reduce(function(prev, cur) {
  return Buffer.concat([ prev, new Buffer(cur) ])
}, new Buffer(0))
var strData = data.join('')

test('deobjectify', function(t) {
  var stream = objectify.deobj(objTransform)

  spigot({ objectMode: true }, objectifiedData)
    .pipe(stream)
    .pipe(concatEquals(t, bufferData))
})

test('deobjectify, options', function(t) {
  var stream = objectify.deobj({ encoding: 'utf8' }, objTransform)

  spigot({ objectMode: true }, objectifiedData)
    .pipe(stream)
    .pipe(concatEquals(t, { decodeStrings: false }, strData))
})

test('deobjCtor', function(t) {
  var Stream = objectify.deobjCtor(objTransform)

  spigot({ objectMode: true }, objectifiedData)
    .pipe(new Stream())
    .pipe(concatEquals(t, bufferData))
})

test('deobjCtor, options', function(t) {
  var Stream = objectify.deobjCtor({ encoding: 'utf8' }, objTransform)

  spigot({ objectMode: true }, objectifiedData)
    .pipe(new Stream())
    .pipe(concatEquals(t, { decodeStrings: false }, strData))
})

test('deobjectify, objectHighWaterMark', function(t) {
  var chunks = 0
  var stream = objectify.deobj({ objectHighWaterMark: 2, highWaterMark: 1 },
      function(obj, enc, cb) {
    chunks++
    this.push(obj.value)
    cb()
  })

  // Chunks will be processed until the readable buffer is full, the writable
  // will be marked full once the readable is full and it has then buffered to
  // full. We use 3 writes here because the objectHighWaterMark=1 state leads to
  // a weird off-by-one edge case where the writable stream thinks its full even
  // though it hasn't buffered anything.
  var moar = stream.write({ value: 'a' })
  t.equal(moar, true)
  moar = stream.write({ value: 's' })
  t.equal(moar, true)
  moar = stream.write({ value: 'd' })
  t.equal(moar, false)

  t.equal(chunks, 1)
  t.end()
})
