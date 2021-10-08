'use strict';

const sqlite3 = require('sqlite3');

const TABLE_NAME = '__session_store';
const SQL_CREATE_TABLE = `CREATE TABLE IF NOT EXISTS "${TABLE_NAME}" (
                    id TEXT PRIMARY KEY NOT NULL,
                    expires INTEGER NOT NULL,
                    data TEXT);`;

const SQL_GET = `SELECT * FROM "${TABLE_NAME}" WHERE id = ?`;
const SQL_SET = `INSERT OR REPLACE INTO "${TABLE_NAME}" (id, expires, data) VALUES (?, ?, ?)`;
const SQL_DELETE = `DELETE FROM "${TABLE_NAME}" WHERE id = ?`;
const SQL_EXPIRE = `DELETE FROM "${TABLE_NAME}" WHERE expires < ?`;

const DEFAULT_TTL = 30 * 60;
const DEFAULT_INTERVAL = 15 * 60 * 1000;


class SQLiteStore {
  /**
   * initialize a new SQLiteStore instance
   * @param  {String} filename sqlite database filename, could be ':memory:'
   * @param  {Object} opt      options
   * @return {Null}
   */
  constructor(filename, opt) {
    this.opt = opt || {};

    let sqlite = this.opt.verbose ? sqlite3 : sqlite3.verbose();

    this.__db = new sqlite.Database(filename);
    this.__db.serialize(() =>
      this.__db.exec(SQL_CREATE_TABLE));

    // method aliases
    this.end = this.destroy;
    this.cleanup = this.flush;

    // flush interval
    setInterval(this.flush.bind(this), this.opt.interval || DEFAULT_INTERVAL);
  }

  /**
   * load session by sid
   * @param  {String}  sid   session id
   * @return {Promise} async task
   */
  get(sid) {
    let now = new Date().getTime();

    return this.__query(SQL_GET, [sid]).then(result => {
      if (result && result.expires > now)
        return JSON.parse(result.data);

      this.destroy(sid);
      return;
    });
  }

  /**
   * session start
   * @param {String} sid     session id
   * @param {Object} session session data
   * @param {Number} ttl     time-to-live in millseconds
   */
  set(sid, session, ttl) {
    let data = JSON.stringify(session);
    let expire;
    if (session && session.cookie && session.cookie.expires) {
      ttl = 0;
      expire = session.cookie.expires
      if (!(expire instanceof Date))
        expire = new Date(session.cookie.expires);

    } else {
      expire = new Date();
      if (isNaN(ttl))
        ttl = this.opt.ttl || DEFAULT_TTL;
    }

    let expireTime = expire.getTime() + ttl;
    return this.__query(SQL_SET, [sid, expireTime, data]);
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
  flush() {
    let now = Math.floor(new Date().getTime());
    return this.__query(SQL_EXPIRE, [now]);
  }

  /**
   * shutdown sqlite3
   * @return {Promise<Null>}
   */
  shutdown() {
    return new Promise((resolve, reject) =>
      this.__db.close(err => err ? reject(err) : resolve())
    );
  }

  /**
   * run query
   * @return {Promise} query task
   */
  __query(sql, params) {
    return new Promise((resolve, reject) => {
      let callback = (err, row) => err ? reject(err) : resolve(row);
      this.__db.serialize(() => this.__db.get(sql, params, callback));
    });
  }
}

module.exports = SQLiteStore;
