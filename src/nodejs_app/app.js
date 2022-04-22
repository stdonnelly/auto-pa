// Express
const express = require('express');
const app = express();
const port = 3000;

// My modules
const api = require('./api')

// Static GET/HEAD requests
app.head('/');
app.use('/submodules', express.static('../../submodules/'));
app.use(express.static('../var/www/html/'));

// Dynamic requests
app.use('/api', api);

// Listen
app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`)
});
