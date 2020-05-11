'use strict';

const debug     = require('debug')('app:Route');
const logger    = require('../libs/winston')(__filename);

const config            = require( '../configs' );
const path              = require('path');


class Routes {

    getMainStyle(req, res) {
        const cf = config(req);
        debug('Style key', req.params.key);
        const sendDefault = (err) => {
            logger.parseError(err, req, res);
		const theme = path.join(__dirname, '../..', cf['frontend'][req.params.key], 'styles-' + cf.tenant + '.css');
            return res.sendFile(theme);
        };
        sendDefault({message: 'theme not found from proxy server'});
    }

}

module.exports = new Routes();
