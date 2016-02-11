'use strict';

const sqlite3 = require('sqlite3');

const TABLE_NAME = '__session_store';
const SQL_CREATE_TABLE = `CREATE TABLE IF NOT EXISTS "${TABLE_NAME}" (
                    id TEXT PRIMARY KEY NOT NULL,
                    expires INTEGER NOT NULL,
                    data TEXT);`;

const SQL_GET = `SELECT * FROM "${TABLE_NAME}" WHERE ID = ?`;
const SQL_SET = `INSERT OR REPLACE INTO "${TABLE_NAME}" (id, expires, data) VALUES (?, ?, ?)`;
const SQL_DELETE = `DELETE FROM "${TABLE_NAME}" WHERE id = ?`;
const SQL_EXPIRE = `DELETE FROM "${TABLE_NAME}" WHERE expires < ?`;


let expireDate = function(session, ttl) {
  if (session && session.cookie && session.cookie.expires)
    return session.cookie.expires instanceof Date ?
      session.cookie.expires :
      new Date(session.cookie.expires);

  else
    return new Date(new Date().getTime() + ttl || 60 * 60 * 1000);
};

class SQliteStore {
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
      this.__pending.forEach(task =>
        this.__db.get(task.sql, task.param, task.callback));
    });

    setInterval(this.refresh.bind(this), 15 * 60 * 1000);
  }

  /**
   * load session by sid
   * @param  {String} sid    session id
   * @return {Promise} async task
   */
  get(sid) {
    return new Promise((resolve, reject) => {

    });
  }

  /**
   * session start
   * @param {String} sid     session id
   * @param {Object} session session data
   * @param {Number} ttl     time to live, in millseconds
   */
  set(sid, session, ttl) {
    let data = JSON.stringify(session);

    return new Promise((resolve, reject) => {

    })
  }

  /**
   * destroy session
   * @return {Promise} async task
   */
  destroy() {
    return new Promise((resolve, reject) => {

    })
  }
}

module.exports = SQliteStore;
