'use strict';

const debug     = require('debug')('app:RouteFrontend');
const logger    = require('../libs/winston')(__filename);

const fileOperation     = require('../libs/file_operations');
const path              = require('path');
const helpers           = require( '../libs/helpers' );
const sqlite            = require('../db');
const config    = require( '../configs' );


class Frontend {

    receive( req, res ) {
        const key = `${req.ip}-${req.headers['user-agent']}`;
        if (!key) {
            return res.status(500).json({
                success: false,
                message: "agent and (or) ip unknown"
            });
        }

        const audioKey = req.headers['x-current-key'] || '';

        const cf = config(req);

        let dbInstance;
        let response = {
            "message": "no audio found",
            "success": true,
            "audio": null
        };
        const hashKey = helpers.getFromSha256(key);
        sqlite.open(cf.sql.dir, sqlite.read_write())
            .then(db => {
                dbInstance = db;
                return sqlite.get(db,
                        `select distinct a.* from (select * from AudioSignal where created_on = (select MAX(created_on) from AudioSignal)) a left join AudioPlayed b on a.ID = b.ID where b.by_whom is null or b.by_whom <> ?` + (audioKey ? ` and a.ID <> ?` : ``),
                        (audioKey ? [hashKey, audioKey] : [hashKey]));
            })
            .then(({db, r}) => {
                if (r) {
                    response.message = "audio found " + r.from_where;
                    response.audio = {
                        "key": r.ID,
                        "name": r.audio_name,
                        "path": path.join(__dirname, '../tmp', r.audio_name),
                        "content": r.audio
                    }
                    return sqlite.insert(db, `insert into AudioPlayed (id, by_whom) VALUES (?,?)`, [r['ID'], hashKey]);
                }
                res.status(200).json(response);
                return null;
            })
            .then(db => {
                if (!db)
                    return {};
                return fileOperation.writeFile(response.audio.path, Buffer.from(new Uint8Array(response.audio.content)));
            })
            .then(({path, data}) => {
                if (!path) {
                    return null;
                }
                res.header('x-audio-key', response.audio.key);
                res.header('x-audio-name', response.audio.name);
                res.header('x-message', response.message);
                return res.download(path, err => fileOperation.unlink(path) );
            })
            .catch((err) => {
                logger.parseError(err, req, res);
                response = helpers.errHandler(err, req, res);
                return res.status(response.status).json(response.output);
            })
            .finally(() => {
                return sqlite.close(dbInstance);
            });
    }

}

module.exports = new Frontend();
