// Express
const express = require('express');
const app = express();
const port = 3000;

// My modules
const api = require('./api');

// Captive portal redirect
// Derive if the hostname is portal.pi.net, or an ip address
app.all('*', function(req, res, next) {
    // req.hostname stores hostname

    // This is very crude. it matches "*.*.*.*" or "*.*.*.*:*", where * is a valid number (0-999 or 0-99999)
    // OR portal.pi.net OR portal.pi.net:*
    // OR localhost OR localhost:*
    let ipv4Regex = /^(localhost|portal\.pi\.net|(\d{1,3}\.){3}\d{1,3})(|:\d{1,5})$/;

    // Check if hostname is in ipv4Regex
    if (ipv4Regex.test(req.hostname)) {
        next();
    } else {
        // Redirect to "portal.pi.net"
        res.redirect(302, 'http://portal.pi.net/');
    }
})

// Static GET/HEAD requests
app.head('/');
app.use('/submodules', express.static('../../submodules/'));
app.use(express.static('../var/www/html/'));

// Dynamic requests
app.use('/api', api);

// Listen
app.listen(port, function() {
  console.log(`[${new Date().toISOString()}]: Server started`);
});
