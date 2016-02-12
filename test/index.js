'use strict';

const chai = require('chai');
const expect = chai.expect;
const co = require('co');

chai.config.includeStack = true;

const SQLiteStore = require('../');


function sleep(ms) {
  return function(cb) {
    setTimeout(cb, ms);
  };
}


describe('session storage', function() {
  this.timeout(5000);

  it('should support regular session operations', done => {
    co(function*() {
      let store = new SQLiteStore(':memory:', {
        verbose: true
      });

      yield store.cleanup();

      let sid = Math.random().toString(36).slice(2);
      let data = {
        user: 'John Smith',
        age: 23
      };

      yield store.set(sid, data);
      let session = yield store.get(sid);
      expect(session).to.deep.equal(data);

      data.age++;

      yield store.set(sid, data);
      session = yield store.get(sid);
      expect(session).to.deep.equal(data);

      yield store.destroy(sid);
      session = yield store.get(sid);
      expect(session).to.be.undefined;

      session = yield store.get('non-exist');
      expect(session).to.be.undefined;

      yield store.teardown();
    }).then(done).catch(console.log);
  });

  it('should remove expired cookies', done => {
    co(function*() {
      let store = new SQLiteStore(':memory:');

      let sid = 'test-sid';
      let data = {
        cookie: {
          expires: new Date(1970, 1, 1),
          cookie1: 'test'
        },
        key: 'value'
      };
      yield store.set(sid, data);

      let session = yield store.get(sid);
      expect(session).to.be.undefined;

      data = {
        cookie: {
          expires: new Date().getTime() + 1000,
          cookie1: 'test',
        },
        key: 'value'
      }

      yield store.set(sid, data, 1);
      session = yield store.get(sid);
      expect(session).to.deep.equal(data);

      // expire
      yield sleep(1000);

      session = yield store.get(sid);
      expect(session).to.be.undefined;

      yield store.teardown();
    }).then(done).catch(console.log);
  });

  it('should reject invalid filename', done => {
    let store = new SQLiteStore('/path/not/exist');
    done();
  });

});
