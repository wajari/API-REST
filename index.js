const axios = require('axios');
const express = require('express');
const parse = require('csv-parse'); 
const winston = require('winston'); 

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const url2019 = 'https://abertos.xunta.gal/catalogo/cultura-ocio-deporte/-/dataset/0401/praias-galegas-con-bandeira-azul-2019/001/descarga-directa-ficheiro.csv'

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

const app = express();

app.get('/students', function (req, res) {
    res.send('datos del endpoint students');
});

app.get('/', function (req, res) {

    const state = req.query['state'];

    logger.log({
        level: 'debug',
        message: JSON.stringify(req.query)
    });

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

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

logger.log({
    level: 'error', 
    message: 'This is a mistake'
}); 

logger.log({
    level: 'info',
    message: 'Starting points of interest application! :-)'
  });

logger.log({
    level: 'debug',
    message: 'Debugging test'
});

axios.get(url2019).then(response => {
    
    parse(response.data, {
        trim: true,
        skip_empty_lines: true,
        delimiter: ';',
        columns: true
    },
        function (err, result) {
            console.log(result.length);
        })
        .catch((err) => {
            console.log('Error: ', err.errno)
        })
        // app.get('/maps', function (req, res) {
        //     res.send(response.data); 
        // }); 
}); 

