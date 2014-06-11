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

// TODO(tec27): objectHighWaterMark tests

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

