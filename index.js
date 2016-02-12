'use strict';

const sqlite3 = require('sqlite3');
const debug = require('debug')('koa-sqlite3-session');

const TABLE_NAME = '__session_store';
const SQL_CREATE_TABLE = `CREATE TABLE IF NOT EXISTS "${TABLE_NAME}" (
                    id TEXT PRIMARY KEY NOT NULL,
                    expires INTEGER NOT NULL,
                    data TEXT);`;

const SQL_GET = `SELECT * FROM "${TABLE_NAME}" WHERE id = ?`;
const SQL_SET = `INSERT OR REPLACE INTO "${TABLE_NAME}" (id, expires, data) VALUES (?, ?, ?)`;
const SQL_DELETE = `DELETE FROM "${TABLE_NAME}" WHERE id = ?`;
const SQL_EXPIRE = `DELETE FROM "${TABLE_NAME}" WHERE expires < ?`;


/**
 * expire
 * @param  {Session} session koa session
 * @param  {Number}  ttl     time-to-live in seconds
 * @return {Date}            date to expire
 */
function expireDate(session, ttl) {
  let expire;
  if (session && session.cookie && session.cookie.expires) {
    ttl = 0;
    let date = session.cookie.expires;
    if (!(date instanceof Date)) {
      expire = new Date(session.cookie.expires);
    }
  } else {
    expire = new Date();

    // half an hour by default
    if (isNaN(ttl))
      ttl = 30 * 60;
  }
  return Math.ceil(expire.getTime() / 1000 + ttl);
};


class SQLiteStore {
  /**
   * initialize a new SQLiteStore instance
   * @param  {String} filename sqlite database filename, could be ':memory:'
   * @param  {Object} opt      options
   * @return {Null}
   */
  constructor(filename, opt) {
    let sqlite = (opt && opt.verbose) ? sqlite3 : sqlite3.verbose();

    this.__pending = [];
    this.__ready = false;
    this.__db = new sqlite.Database(filename, err => {
      if (err) throw err;

      this.__ready = true;
      this.__db.run(SQL_CREATE_TABLE, [], err => {
        this.__pending.forEach(task =>
          this.__db.get(task.sql, task.params, task.callback));
      });
    });

    setInterval(this.cleanup.bind(this), 15 * 60 * 1000);
  }

  /**
   * load session by sid
   * @param  {String}  sid   session id
   * @return {Promise} async task
   */
  get(sid) {
    let now = Math.ceil(new Date().getTime() / 1000);

    return new Promise((resolve, reject) => {
      this.__query(SQL_GET, [sid]).then(result => {
        if (!result)
          return resolve(result);

        if (result.expires > now)
          return resolve(JSON.parse(result.data));
      
        this.destroy(sid);
        resolve();
      });
    });

  }

  /**
   * session start
   * @param {String} sid     session id
   * @param {Object} session session data
   * @param {Number} ttl     time-to-live in seconds
   */
  set(sid, session, ttl) {
    let data = JSON.stringify(session);
    let expires = expireDate(session, ttl).getTime();
    return this.__query(SQL_SET, [sid, expires, data]);
  }

  /**
   * destroy session
   * @return {Promise} async task
   */
  destroy(sid) {
    return this.__query(SQL_DELETE, [sid]);
  }

  /**
   * clean up exired sessions
   * @return {Promise} 
   */
  cleanup() {
    let now = new Date().valueOf();
    return this.__query(SQL_EXPIRE, [now]);
  }

  /**
   * run query
   * @return {Promise} query task
   */
  __query(sql, params) {
    const self = this;
    return new Promise((resolve, reject) => {
      const done = (err, row) => (err ? reject : resolve)(row);

      if (self.__ready)
        self.__db.get(sql, params, done);
      else
        self.__pending.push({
          sql: sql,
          params: params,
          callback: done
        });

    });
  }
}

module.exports = SQLiteStore;
