const axios = require('axios');
const axiosCacheAdapter = require('axios-cache-adapter'); 
const express = require('express');
const parse = require('csv-parse'); 
const winston = require('winston'); 
const config = require('./config.json')

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const url = config['url']; 

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'debug',
    format: combine(
        label({ label: 'Main: This is a warning dog' }),
        timestamp(),
        myFormat
      ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({format: winston.format.simple()})
    ]

});

const api = axiosCacheAdapter.setup({
    baseURL: 'https://abertos.xunta.gal',
    cache: {
        maxAge: 0.5 * 60 * 1000
    }
})

const app = express();

app.get('/beaches', async (req, res) => {
    const response = await api.get('/catalogo/cultura-ocio-deporte/-/dataset/0401/praias-galegas-con-bandeira-azul-2019/001/descarga-directa-ficheiro.csv');

    logger.debug(`Acabo de recibir una petición de playas (cached: ${response.request.fromCache === true}`);

    parse(response.data, {
        trim: true,
        skip_empty_lines: true,
        delimiter: ';',
        columns: true
    },
        function (err, result) {
            beaches = result;
            res.send(result);
        })
}); 

app.get('/students', function (req, res) {
    res.send('datos del endpoint students');
});

app.get('/', function (req, res) {

    const state = req.query['state'];

    if (state === undefined) {
        res.status(400).send('Falta un parámetro');
    }
    else if (req.query['state'].toLowerCase() == 'pontevedra') {
        res.send('Estas en Pontevedra');
    } else {
        res.send('No estás en Pontevedra');
    }

    res.send('Hello World!');
});

app.listen(config['port'], function () {
    logger.info(`Starting points of interest application on port ${config['port']}`);
});





