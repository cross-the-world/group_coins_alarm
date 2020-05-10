'use strict';

const debug     = require('debug')('app:RouteBackend');
const logger    = require('../libs/winston')(__filename);

const fileOperation     = require('../libs/file_operations');
const path              = require('path');
const helpers           = require( '../libs/helpers' );
const sqlite            = require('../db');
const config            = require( '../configs' );


class Backend {

    send( req, res ) {
        const f = req.file;
        if (!f || !f.buffer) {
            return res.status( 500 ).json ( {
                success: false,
                message: "no file received"
            } );
        }

        const key = `${req.ip}-${req.headers['user-agent']}`;
        if (!key) {
            return res.status( 500 ).json ( {
                success: false,
                message: "agent and (or) ip unknown"
            } );
        }

        const cf = config(req);

        // Buffer.from(new Uint8Array()),
        let dbInstance;
        let response = {};
        sqlite.open(cf.sql.dir, sqlite.read_write())
            .then(db => {
                dbInstance = db;
                return sqlite.delete(db,
                    `delete from AudioSignal where created_on = (select MIN(created_on) from AudioSignal) and (select count(*) from AudioSignal) > ?`,
                    [sqlite.max_rows()]);
            })
            .then(db => sqlite.delete(db,
                    `delete from AudioPlayed where id not in (select id from AudioSignal)`,
                    []))
            .then(db => sqlite.insert(db,
                    `insert into AudioSignal (from_where, audio, audio_name) VALUES (?,?, ?)`,
                    [ helpers.getFromSha256(key), new Uint8Array(f.buffer), (f.originalname || 'unknown.mp3') ]))
            .then(db => {
                response = {
                    "status": 200,
                    "output": {
                        message: 'inserted audio successfully',
                        success: true
                    }
                };
                return sqlite.get(db, 'select * from AudioSignal order by id', [], r => debug('%o', r));
            })
            .catch((err) => {
                logger.parseError(err, req, res);
                response = helpers.errHandler(err, req, res);
                return response;
            })
            .finally(() => {
                sqlite.close(dbInstance);
                return res.status(response.status).json(response.output);
            });
    }

}


module.exports = new Backend();
