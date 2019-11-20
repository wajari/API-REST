const axios = require('axios');

const url ='http://localhost:3000/beaches'

axios.get(url).then((response) => {
    console.log(response);
  })
