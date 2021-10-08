'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const SQLiteStore = require('../');

chai.use(chaiAsPromised);
chai.config.includeStack = true;

const expect = chai.expect;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('session storage', function () {
  it('should support regular session operations', async () => {
    const store = new SQLiteStore(':memory:', {
      verbose: true
    });

    await store.flush();

    let sid = Math.random().toString(36).slice(2);
    let data = {
      user: 'John Smith',
      age: 23
    };

    await store.set(sid, data);
    let session = await store.get(sid);
    expect(session).to.deep.equal(data);

    data.age++;

    await store.set(sid, data);
    session = await store.get(sid);
    expect(session).to.deep.equal(data);

    await store.destroy(sid);
    session = await store.get(sid);
    expect(session).to.be.undefined;

    session = await store.get('non-exist');
    expect(session).to.be.undefined;

    await store.shutdown();
  });

  it('should clear expired cookies', async () => {
    let store = new SQLiteStore(':memory:');

    let sid = 'test-sid';
    let data = {
      cookie: {
        expires: new Date(1970, 1, 1),
        cookie1: 'test'
      },
      key: 'value'
    };
    await store.set(sid, data);
    let session = await store.get(sid);
    expect(session).to.be.undefined;

    const timeout = 100;

    data = {
      cookie: {
        expires: new Date().getTime() + timeout,
        cookie1: 'test',
      },
      key: 'value'
    }

    await store.set(sid, data, 1);
    session = await store.get(sid);
    expect(session).to.deep.equal(data);

    // expire
    await sleep(timeout);

    session = await store.get(sid);
    expect(session).to.be.undefined;

    await store.shutdown();
  });

});
