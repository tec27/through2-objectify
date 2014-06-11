var through = require('through2')
  , inherits = require('inherits')

function ctor(opts, transform, flush) {
  if (typeof opts == 'function') {
    flush = transform
    transform = opts
    opts = {}
  }

  var Base = through.ctor(opts, transform, flush)

  inherits(ObjectifyStream, Base)
  function ObjectifyStream() {
    if (!(this instanceof ObjectifyStream)) {
      return new ObjectifyStream()
    }
    Base.call(this)
    this._readableState.objectMode = true
    this._readableState.highWaterMark =
        (('objectHighWaterMark' in opts) ? opts.objectHighWaterMark : 16)
  }

  return ObjectifyStream
}

function create(opts, transform, flush) {
  return ctor(opts, transform, flush)()
}

function deobjCtor(opts, transform, flush) {
  if (typeof opts == 'function') {
    flush = transform
    transform = opts
    opts = {}
  }

  var Base = through.ctor(opts, transform, flush)

  inherits(DeobjectifyStream, Base)
  function DeobjectifyStream() {
    if (!(this instanceof DeobjectifyStream)) {
      return new DeobjectifyStream()
    }
    Base.call(this)
    this._writableState.objectMode = true
    this._writableState.highWaterMark =
        (('objectHighWaterMark' in opts) ? opts.objectHighWaterMark : 16)
  }

  return DeobjectifyStream
}

function createDeobj(opts, transform, flush) {
  return deobjCtor(opts, transform, flush)()
}

module.exports = create
module.exports.ctor = ctor
module.exports.deobj = createDeobj
module.exports.deobjCtor = deobjCtor
