const parse = require('csv-parse')
const axios = require('axios');
const url2019 = 'https://abertos.xunta.gal/catalogo/cultura-ocio-deporte/-/dataset/0401/praias-galegas-con-bandeira-azul-2019/001/descarga-directa-ficheiro.csv'


axios.get(url2019).then(response => {
    
    parse(response.data, {
        trim: true,
        skip_empty_lines: true,
        delimiter: ';',
        columns: true
    },
        function (err, result) {
            console.log(result);
        })
        .catch((err) => {
            console.log('Error: ', err.errno)
        })
}); 
