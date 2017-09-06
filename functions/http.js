function Protocol(http){
    this._http = http;
} 

Protocol.prototype.test = function(){
    console.trace();
}

Protocol.prototype.httpGetAsync = function(root, path, headers, callback) {
    var options = {
            host: root,
            path: path,
            method: 'GET',
            headers: headers
        },
        req = this._http.request(options, function(res) {
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
module.exports = Protocol;

