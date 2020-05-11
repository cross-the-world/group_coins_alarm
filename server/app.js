#!/usr/bin/env node

process.env.TZ = 'Europe/Berlin';
const debug            = require( 'debug' )('app');
const logger           = require( './libs/winston' )(__filename);

const express	       = require( 'express' );
const cors               = require('cors')
const bodyParser       = require( 'body-parser' );
const morgan	       = require( 'morgan' );
const path             = require( 'path' );
const cookieParser     = require( 'cookie-parser' );
const commandLineArgs  = require( 'command-line-args' );
const swaggerUi        = require( 'swagger-ui-express' );
const proxy            = require( 'express-http-proxy' );
const swaggerValidator = require( 'express-ajv-swagger-validation' );
const jwt              = require( 'express-jwt' );
const helmet           = require( 'helmet' );
const noCache          = require('nocache');

const multer           = require('multer') //use multer to upload blob data
const upload           = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))


const configs          = require( './configs' );

const routes           = require( './routes' );
const routes_backend   = require( './routes/backend' );
const routes_frontend  = require( './routes/frontend' );

const swagger          = require( './libs/swagger' );
const swaggerDoc       = require( './libs/swagger/swagger.json' );
const helpers          = require( './libs/helpers' );
const fileOperation    = require( './libs/file_operations' );


// ATTENTION: args from command line can be saved as global
global.options = commandLineArgs([
    { name: 'verbose',        type: Boolean, alias: 'v' },
    { name: 'environment',    type: String, alias: 'e' },
    { name: 'backend',        type: String, alias: 'b' },
]);

// Config APP
let app = express();
const corsOptions = {
    origin: '*',
    method: ['GET', 'POST'],
    //allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    optionsSuccessStatus: 200, //Some legacy browsers (IE11, various SmartTVs) choke on 204,
    //credentials: true
};
app.use(cors(corsOptions));

app.use( morgan( 'combined', {
    skip: function (req, res) { return res.statusCode >= 400; },
    stream: logger.stream
} ) );

// config for server' security
app.use(noCache())
app.use( helmet.frameguard() );
// config limit for body-requests
app.use( bodyParser.json( {limit: '50mb', extended: true} ) );
app.use( bodyParser.text( {type: 'text/*', limit: '50mb', extended: true} ) );
app.use( bodyParser.urlencoded( {limit: '50mb', extended: true} ) );

// public routes
app.get( '/api/health-check', (req, res) => res.send('OK'));
// NOTE: log return
app.get( '/api/newest-log', (req, res) => {
    fileOperation.getMostRecentFileName( helpers.logDir() )
        .then( fn => {
            debug(fn);
            res.status(200).sendFile( helpers.logPath(fn) );
        })
        .catch( err => res.status ( 500 ).send(err) );
});
app.get( '/api/logs/:date', (req, res) => {
    const d = req.params.date;
    debug( d );
    fileOperation.getFileNameByDate( helpers.logDir(), d )
        .then( fn => {
            debug(fn);
            res.status(200).sendFile( helpers.logPath(fn) );
        })
        .catch( err => res.status ( 500 ).send(err) );
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use( '/api/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerDoc ) );

const auth = () => jwt( {
    secret: (req, payload, done) => done(null, config(req).secret),
    getToken: req => {
        return helpers.getToken(req);
    }
} );

// important to setup static route after redirects of !!!
app.use( express.static( path.join(__dirname, '../public' ) ) );


//
app.get( '/api/config/styles/:key', swaggerValidator.validate, routes.getMainStyle );


// === BACKEND ===
app.post( '/api/send', upload.single('soundBlob'), swaggerValidator.validate, routes_backend.send );




// === FRONTEND ===
app.get( '/api/receive', swaggerValidator.validate, routes_frontend.receive );



app.use( function (err, req, res, next) {
    if ( err.name === 'UnauthorizedError' ) {
        return res.status ( 401 ).json ( { message: 'token invalid' } );
    }
    if ( err instanceof swaggerValidator.InputValidationError ) {
        const error = swagger.errorHandle(err);
        logger.error('SwaggerValidator FAILED %o', err);
        return res.status ( 400 ).json( error );
    }
    logger.error('Group-Coins-Alarm FAILED %o', err);
    return res.status ( 500 ).send( process.env.NODE_ENV !== 'production' ? err.stack : null );
});

swaggerValidator
    .init(swaggerDoc)
    .then(function() {
        const port = 3000;
        const server = app.listen( port, function() {
            const host = server.address().address;
            const port = server.address().port;
            global.server = `http:\/\/${(host == '::') ? 'localhost' : host}:${port}`;
            logger.info( 'Group-Coins-Alarm listening at %s', global.server );
        } );
    });
