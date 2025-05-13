let http = require('http');

http.createServer((req, res) => {
    let fileName = '.' + req.url;

    if (fileName === './stream') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        res.write('retry: 5\n');
        res.write('event: connect_time\n');
        res.write('data: ' + new Date().toLocaleTimeString() + '\n\n');

        let interval = setInterval(function() {
            res.write('data: ' + new Date().toLocaleTimeString() + '\n\n');
        }, 997);

        req.socket.addListener('close', function() {
            clearInterval(interval);
        }, false);
    }
}).listen(6174, '127.0.0.1');
