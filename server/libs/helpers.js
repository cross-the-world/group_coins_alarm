'use strict';

const debug             = require('debug')('app:Helpers');

const path              = require('path');
const crypto            = require("crypto");


module.exports.getAcceptLanguage = (req) => {
    return req.query['lang'] || req.headers['Accept-Language'] || req.headers['accept-language'];
};

module.exports.parseError = (errors) => {
    const constructorObj = errors.constructor;
    const type = typeof errors;
    // object
    if (type == 'object' && (errors.join == undefined)) {
        return { message: (constructorObj instanceof Function) ? errors.toString() : errors };
    }
    // array
    if (type == 'object' && !(errors.join == undefined)) {
        return errors.map(e => {
            return {key: e.dataPath, message: e.message};
        });
    }
    return { message: (type == 'function') ? errors.toString() : JSON.stringify(errors) };
};

module.exports.errHandler = (e, req, res) => {
    const m = (e && ((e.error && e.error.message) || e.message)) || 'UNKNOWN';
    const s = e && e.statusCode;
    debug('%s: %s\n%j', s, m, e);
    return {
        "status": s || 500,
        "output": {
            success: false,
            message: m
        }
    };
};

module.exports.getFromSha256 = (val) => {
    debug(val);
    return crypto.createHash('sha256').update(val).digest('base64');
};



const logDir = 'logs';

module.exports.logDir = () => {
    return path.join(__dirname, '..', logDir);
};

module.exports.logPath = (fn) => {
    return path.join(__dirname, '..', logDir, fn);
}

module.exports.datePattern = () => 'YYYY-MM-DD';