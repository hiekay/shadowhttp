/* my socks5 server */
var net = require('net');

var server = net.createServer(function(c) {
    var p = null;
    c.on('end', function() {
        if(p)
            p.destroy();
    });
    c.on('data', function(buf){
        if(p == null){
            if(buf.length < 7)
                return c.destroy();
            var namelen = buf.readUInt8(4);
            if(namelen + 7 != buf.length)
                return c.destroy();
            var host = buf.slice(5, 5+namelen).toString();
            var port = buf.readUInt16BE(5 + namelen);
            console.log('connecting to ' + host + ':' + port);
            p = net.connect(port, host, function(){
                c.write('\x05\x00');
            });
            p.on('error', function(err){
            });
            p.on('end', function(){
                return c.destroy();
            });
            p.on('data', function(reply){
                c.write(reply);
            });
        }else{
            p.write(buf);
        }
    });
    c.on('error', function(err){
    });
});

server.listen(1081, function() {
    console.log('server bound');
});

