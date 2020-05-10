const logger                     = require('../winston')(__filename);
const debug                      = require('debug')('app:handleErrorSwagger');
const helpers                    = require('../helpers');

exports.errorHandle = err => {
    if (err && err.errors) {
        const errors = err.errors;
        debug('Swagger errors: %o', errors);
        return helpers.parseError(errors);
    }
    return err || { message: 'unknown by Swagger validation' };
};