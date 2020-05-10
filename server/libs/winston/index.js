'use strict';

const { createLogger, format, transports }         = require('winston');
const { combine, timestamp, label, prettyPrint, json, splat, simple, colorize, printf }   = format;
require('winston-daily-rotate-file');
const path                                         = require('path');
const fs                                           = require('fs');
const helpers                                      = require('../helpers');

const env = process.env.NODE_ENV || 'development';
const logDirPath = helpers.logDir();

// Create the log directory if it does not exist
if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
    zippedArchive: true,
    dirname: logDirPath,
    filename: `%DATE%-results.log`,
    datePattern: helpers.datePattern(),
    maxSize: '10m',
    maxFiles: '5d',
    prettyPrint: true,
    handleExceptions: true,
    json: true,
    format: format.combine(
        format.printf( info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}` )
    )
});

const loggerExt = caller => {
    const logger = createLogger({
        // change level if in dev environment versus production
        level: env === 'production' ? 'info' : 'debug',
        format: combine(
            label({ label: path.basename(caller) }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            json(),
            splat(),
            simple(),
            prettyPrint()
        ),
        transports: [
            new transports.Console({
                format: combine(
                    printf( info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}` )
                ),
                prettyPrint: true,
                handleExceptions: true,
                json: true,
                colorize: true
            }),
            dailyRotateFileTransport
        ],
        exitOnError: false
    });

    // create a stream object with a 'write' function that will be used by `morgan`.
    // This stream is based on node.js stream https://nodejs.org/api/stream.html.
    logger.stream = {
        write: function(message, encoding) {
            // use the 'info' log level so the output will be picked up by both transports
            logger.info(message);
        }
    };

    logger.combinedFormat = function(err, req, res) {
        // :remote-addr - ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
        return `${req.ip} - \"${req.method} ${req.originalUrl} HTTP/${req.httpVersion}\" ${ err.statusCode || 500 } - ${req.headers['user-agent']} ${ JSON.stringify( helpers.parseError(err) ) }`;
    };

    logger.parseError = (err, req, res) => {
        logger.error(logger.combinedFormat(err, req, res));
    };

    return logger;
};


module.exports = loggerExt;