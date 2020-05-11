/**
 * Konfiguration jwt Secret Token, Backend etc.
 */

const debug                      = require('debug')('app:GetConfig');
const logger                     = require('../libs/winston')(__filename);


const configs = {
    coinheisst: {
        // JSON WebToken (jwt)
        secret: '',
        expires: 24*3600, // expire after 8 hours
        interval: 3600, // validate each 1 hour

        backend: {
        },

        frontend: {
            backend_client: "public/backend-client",
            frontend_client: "public/frontend-client",
        },

        sql: {
            dev_dir: "E:/Documents/Learning/TradingAlarm/sqlite3/data",
            prod_dir: "/usr/share/nginx/html/group_coins_alarm/sqlite3/data"
        }

    }

};

module.exports = function(req) {
    const host = req.get('host');
    const qTenant = req.query['tenant'];
    const eTenant = process.env.TENANT;
    const xtenant = req.get('x-tenant');

    const tenantKey = (configs[eTenant] && eTenant) || (configs[qTenant] && qTenant) || (configs[host] && host) || (configs[xtenant] && xtenant) || 'coinheisst';
    const config = configs[tenantKey];
    config.tenant = tenantKey;

    const eMode = process.env.NODE_ENV || global.options.environment || 'development';

    const b = config.backend;
    // TODO might be changed later
    config.backend.url = process.env.BACKEND_URL ||
            ((eMode === 'production') ? b.url_prod : b.url_dev);

    const s = config.sql;
    config.sql.dir = process.env.SQL_DIR ||
        ((eMode === 'production') ? s.prod_dir : s.dev_dir);

    debug( tenantKey + ':' + eMode );
    return config;
};
