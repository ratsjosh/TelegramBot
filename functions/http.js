const http = require('http');

module.exports = {
    httpGetAsync: (root, path, headers, callback) => {
        var options = {
                host: root,
                path: path,
                method: 'GET',
                headers: headers
            },
            req = http.request(options, function(res) {
                var body = '';
                res.on('data', function(chunk) {
                    body += chunk;
                });
                res.on('end', function() {
                    callback(JSON.parse(body));
                });
            });

        req.on('error', function(e) {
            console.log('ERROR: ' + e.message);
        });

        req.end();
    } 
};

