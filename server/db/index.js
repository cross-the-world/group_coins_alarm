'use strict';

const logger                     = require('../libs/winston')(__filename);
const debug                      = require('debug')('app:Database');

const sqlite3                    = require('sqlite3').verbose();
const path                       = require('path');


class Sqlite {

    static DBNAME       = 'coinalarm';


    read_only() {
        return sqlite3.OPEN_READONLY;
    }

    read_write() {
        return sqlite3.OPEN_READWRITE;
    }

    max_rows() {
        return 1;
    }

    handleError(err, reject, message = "database ok", cb = () => {} ) {
        if (err) {
            logger.error("%o", err.message);
            return reject(err);
        }
        debug("%o", message);
        cb();
    }

    open(dir, mode = this.read_only()) {
        const self = this;
        return new Promise((resolve, reject) => {
	    //	logger.info(path.join(dir, Sqlite.DBNAME));
            let db = new sqlite3.Database(path.join(dir, Sqlite.DBNAME), mode, err => self.handleError(err, reject, 'database opened', () => resolve(db) ));
        });
    }

    close(db) {
        if (!db)
            return;
        const self = this;
        return new Promise((resolve, reject) => {
            db.close(err => self.handleError(err, reject, 'database closed', () => resolve(db) ));
        });
    }

    delete(db, query, params = []) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.run(query, params, err => self.handleError(err, reject, `Row(s) deleted`, () => resolve(db) ));
        });
    }

    all(db, query, params = []) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => self.handleError(err, reject, `${rows && rows.length} queried`, () => resolve({db: db, r: row})));
        });
    }

    get(db, query, params = []) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => self.handleError(err, reject, `${row && row['ID']} queried`, () => resolve({db: db, r: row})));
        });
    }

    each(db, query, params = []) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.each(query, params, (err, row) => self.handleError(err, reject, `${row && row.id} queried`, () => resolve({db: db, r: row})));
        });
    }

    insert(db, query, params = []) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.run(query, params, err => self.handleError(err, reject, `Row(s) inserted`, () => resolve(db) ));
        });
    }

    update(db, query, params = []) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.run(query, params, err => self.handleError(err, reject, `Row(s) updated`, () => resolve(db) ));
        });
    }

}


module.exports = new Sqlite();
