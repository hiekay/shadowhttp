/* 
 * SimpSocks5
 * by Xiaoxia
 * A simplified version of socks5
 * NOTICE: No encryption is used
 */

var net = require('net');
var SOCKS_ADDR = '106.186.28.103';
var SOCKS_PORT = 1081;

var httpsrv = net.createServer(function(c){
    var host = null;
    var p = null;
    var socks_state = 0;

    c.on('end', function(){
        if(p){
            p.destroy();
        }
        console.log('80 server disconnected.');
    });

    c.on('data', function(buf){
        if(p == null){
            c.pause();
            var header = buf.toString();
            if(header.indexOf('Host: ') == -1){
                c.destroy();
                return;
            }
            host = header.split('Host: ')[1].split('\r\n')[0].trim();
            console.log('Host is ' + host);
            p = net.connect(SOCKS_PORT, SOCKS_ADDR, function(){
                var tmp = new Buffer(7 + host.length);
                tmp.write('\x05\x01\x00\x03', 0);
                tmp.writeUInt8(host.length, 4);
                tmp.write(host, 5);
                tmp.writeUInt16BE(80, 5+host.length);
                p.write(tmp);
                socks_state = 1;
            });
            p.on('error', function(err){
                return;
            });
            p.on('data', function(reply){
                if(socks_state == 1){
                    if(reply[1] != 0){
                        console.log('failed to connect to ' + host);
                        p.destroy();
                        return;
                    }
                    p.write(buf);
                    c.resume();
                    socks_state = 2;
                }else{
                    c.write(reply);
                }
            });
            p.on('end', function(){
                c.destroy();
            });
        }else{
            p.write(buf);
        }
    });
    c.on('error', function(err){
    });
});

httpsrv.listen(80, function(){
    console.log('80 server bound.');
});

var httpssrv = net.createServer(function(c){
    var host = null;
    var p = null;
    var socks_state = 0;

    c.on('end', function(){
        if(p){
            p.destroy();
        }
        console.log('443 server disconnected.');
    });

    c.on('data', function(buf){
        if(p == null){
            var patt = new RegExp(/\x00\x00([^\0])([\w\.-]{3,255})/g);
            while((result = patt.exec(buf)) != null){
                if(result[1].charCodeAt() == result[2].length){
                    host = result[2];
                    break;
                }
            }
            if(host == null){
                c.destroy();
                return;
            }
            console.log('Host is ' + host);
            p = net.connect(SOCKS_PORT, SOCKS_ADDR, function(){
                var tmp = new Buffer(7 + host.length);
                tmp.write('\x05\x01\x00\x03', 0);
                tmp.writeUInt8(host.length, 4);
                tmp.write(host, 5);
                tmp.writeUInt16BE(443, 5+host.length);
                p.write(tmp);
                socks_state = 1;
            });
            p.on('error', function(err){
                return;
            });
            p.on('data', function(reply){
                if(socks_state == 1){
                    if(reply[1] != 0){
                        console.log('failed to connect to ' + host);
                        p.destroy();
                        return;
                    }
                    p.write(buf);
                    c.resume();
                    socks_state = 2;
                }else{
                    c.write(reply);
                }
            });
            p.on('end', function(){
                c.destroy();
            });
        }else{
            p.write(buf);
        }
    });
    c.on('error', function(err){
    });
});

httpssrv.listen(443, function(){
    console.log('443 server bound.');
});

