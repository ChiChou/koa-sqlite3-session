# koa-sqlite3-session

[![Build Status](https://travis-ci.org/ChiChou/koa-sqlite3-session.svg?branch=master)](https://travis-ci.org/ChiChou/koa-sqlite3-session) [![Coverage Status](https://coveralls.io/repos/github/ChiChou/koa-sqlite3-session/badge.svg?branch=master)](https://coveralls.io/github/ChiChou/koa-sqlite3-session?branch=master) [![npm version](https://badge.fury.io/js/koa-sqlite3-session.svg)](https://badge.fury.io/js/koa-sqlite3-session) [![License](https://img.shields.io/npm/l/koa-sqlite3-session.svg?style=flat-square)](https://github.com/chichou/koa-sqlite3-session/blob/master/LICENSE)

## Usage

`koa-sqlite3-session` works with [koa-generic-session](https://github.com/koajs/generic-session) (a generic session middleware for koa).

```javascript
const SQLite3Store = require('koa-sqlite3-session');

app.use(session({
  store: new SQLite3Store('filename.db', {
    // Options specified here
  })
}));

```

## Example

see [example](example)

## Options

* `verbose`: Enables [node-sqlite3's verbose mode](https://github.com/mapbox/node-sqlite3/wiki/API#sqlite3verbose)
* `ttl`: Default cookie expire time
* `interval`: Interval for flushing expired sessions
 
## API

### module(filename, [options])

Initialize the SQLite3 connection with the given path and optionally provided options (see above). `filename` param can be `:memory:` to use in-memory database. The variable session below references this. Should always use as a constructor.

### session.get(sid)

Promise that gets a session by id. Returns parsed JSON if exists, otherwise `null`.

### session.set(sid, sess, ttl)

Promise that sets a JSON session by id.

### session.end(sid)

Promise that ends a session by id.

### session.shutdown()

Promise that closes database connection.

### session.flush()

Promise that removes all expired session data.

## License

(The MIT License)

Copyright (c) 2016 CodeColorist and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.