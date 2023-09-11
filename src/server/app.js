const express = require('express'),
    load = require('express-load'),
    util = require('util'),
    compression = require('compression'),
    requestTimeout = require('express-timeout'),
    responseTime = require('response-time'),
    bodyParser = require('body-parser'),
    parseCookie = require('cookie-parser'),
    requestParam = require('request-param'),
    morgan = require('morgan'),
    cors = require('cors');

const app = express();
const http = require('http').Server(app);
const cookie = parseCookie('LAPIG')

load('config.js', { 'verbose': false })
    .then('database')
    .then('middleware')
    .then('libs')
    .into(app);

const allowedOrigins = [
    'http://localhost:4200',
    'https://atlasdaspastagens.ufg.br',
    'https://atlasdev.lapig.iesa.ufg.br',
    'https://atlasdev.lapig.iesa.ufg.br',
    'https://covidgoias.ufg.br',
    'https://maps.lapig.iesa.ufg.br',
    'https://cepf.lapig.iesa.ufg.br',
    'https://araticum.lapig.iesa.ufg.br',
    'https://araticumdev.lapig.iesa.ufg.br',
    'https://agrotoxicosdev.lapig.iesa.ufg.br',
    'https://agrotoxicos.lapig.iesa.ufg.br'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    },
};

app.options('*', cors(corsOptions));
app.all('*', cors(corsOptions));

app.database.client.init(function () {
    app.libs.catalog.init(function () {
        app.middleware.repository.init(() => {

            app.use(cookie);
            app.use(compression());
            app.use(express.static(app.config.clientDir));
            app.set('views', __dirname + '/templates');
            app.set('view engine', 'ejs');

            app.use(requestTimeout({
                'timeout': 2000 * 60 * 30 * 24,
                'callback': function (err, options) {
                    let response = options.res;
                    if (err) {
                        util.log('Timeout: ' + err);
                    }
                    response.end();
                }
            }));

            app.use(responseTime());
            app.use(requestParam());
            app.use(morgan('tiny'));

            app.set('view engine', 'ejs');
            app.set('views', './views');
            // app.use(express.static('./assets/dashboard'));
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json({ limit: '1gb' }));

            app.use(function (error, request, response, next) {
                console.log('ServerError: ', error.stack);
                next();
            });

            load('controllers')
                .then('routes')
                .then('utils')
                .then('jobs')
                .into(app);

            app.database.client.init_general(function () { });

            const httpServer = http.listen(app.config.port, function () {
                const typeProcess = process.env.PRIMARY_WORKER === '1' ? 'master' : 'worker';
                console.log('OWS-API Server @ [port %s] [pid %s] - %s', app.config.port, process.pid.toString(), typeProcess);
            });

            if (process.env.PRIMARY_WORKER === '1') {
                app.libs.catalog.prefetchWmsCapabilities();
                app.jobs.cache.start();
            }

            [`exit`, `uncaughtException`].forEach((event) => {
                if (event === 'uncaughtException') {
                    process.on(event, (e) => { })
                } else {
                    process.on(event, (e) => {
                        httpServer.close(() => process.exit())
                    })
                }
            })
        });
    });
})
