const axios = require('axios');
const axiosCacheAdapter = require('axios-cache-adapter');
const config = require('config');
const express = require('express');
const parse = require('csv-parse');
const winston = require('winston');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const port = config.get('server.port');

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
        new winston.transports.Console({ format: winston.format.simple() })
    ]

});

const api = axiosCacheAdapter.setup({
    cache: {
        maxAge: 0.5 * 60 * 1000
    }
})

const app = express();

app.get('/beaches/', async (req, res) => {
    const year = req.query['year'];
    if (year === undefined) {
        res.status(400).send('Faltan parámetros');
        return;
    }

    if (!config.has(`resources.${year}`)) {
        res.status(404).send('No hay datos de ese año');
        return;
    }

    const url = config.get(`resources.${year}`);
    const response = await api.get(url);

    logger.debug(`Acabo de recibir una petición de playas (cached: ${response.request.fromCache === true}`);

    parse(response.data, {
        trim: true,
        skip_empty_lines: true,
        delimiter: ';',
        columns: true
    },

    function (err, result) {
        const state = req.query['state'];

        if (state !== undefined) {
            const filteredData = result.filter((item) => item['C�DIGO PROVINCIA'] === state);

            if (filteredData.length === 0) {
                res.status(404).send('No hay datos');
            } else {
                res.send(filteredData);
            }
        } else {
            res.send(result);
        }

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

app.listen(port, function () {
    logger.info(`Starting points of interest application on port ${port}`);
});





