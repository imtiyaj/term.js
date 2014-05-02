#!/usr/bin/env node

/**
 * term.js
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 */

var http = require('http')
    , express = require('express')
    , io = require('socket.io')
//    , pty = require('pty.js')
//    , terminal = require('./lib');
//
///**
// * term.js
// */
//
//process.title = 'term.js';
//
///**
// * Dump
// */
//
var stream;
if (process.argv[2] === '--dump') {
   stream = require('fs').createWriteStream(__dirname + '/dump.log');
}
//
///**
// * Open Terminal
// */
//
//var buff = []
//    , socket
//    , term;
//
//term = pty.fork(process.env.SHELL || 'bash', [], {
//    name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
//        ? 'xterm-256color'
//        : 'xterm',
//    cols: 80,
//    rows: 24,
//    cwd: process.env.HOME
//});
//
//term.on('data', function(data) {
//    if (stream) stream.write('OUT: ' + data + '\n-\n');
//    // send data to server
//    console.log("reply from shell:\n")
//    console.log(data)
//    return !socket
//        ? buff.push(data)
//        : socket.emit('data', data);
//});
//
//console.log(''
//        + 'Created shell with pty master/slave'
//        + ' pair (master: %d, pid: %d)',
//    term.fd, term.pid);

/**
 * App & Server
 */
var buff = []
   , socket

var app = express()
    , server = http.createServer(app);

app.use(function(req, res, next) {
    var setHeader = res.setHeader;
    res.setHeader = function(name) {
        switch (name) {
            case 'Cache-Control':
            case 'Last-Modified':
            case 'ETag':
                return;
        }
        return setHeader.apply(res, arguments);
    };
    next();
});

app.use(express.basicAuth(function(user, pass, next) {
    if (user !== 'foo' || pass !== 'bar') {
        return next(true);
    }
    return next(null, user);
}));

app.use(express.static(__dirname));
//app.use(terminal.middleware());

//if (!~process.argv.indexOf('-n')) {
//    server.on('connection', function(socket) {
//        var address = socket.remoteAddress;
//        if (address !== '127.0.0.1' && address !== '::1') {
//            try {
//                socket.destroy();
//            } catch (e) {
//                ;
//            }
//            console.log('Attempted connection from %s. Refused.', address);
//        }
//    });
//}

server.listen(8080);

/**
 * Sockets
 */

 io = io.listen(server, {
 log: false
 });
var browserconn;
var piconn;

io.sockets.on('connection', function(sock) {
    console.log("socket connection:  \n");
    socket = sock;

    //identify the socket
    socket.on('browser', function() {
        browserconn = socket;
        console.log("browser socket")
        console.log(sock.id)

    });
    socket.on('data', function(data) {
        //if (stream) stream.write('IN: ' + data + '\n-\n');
        //send data to term
        console.log(data)
        if(piconn) {
            console.log("sending data to pi")
            piconn.emit('cmdtoterm', data);
            //term.write(data);
        }
    });

    //identify the socket
    socket.on('piconn', function() {
        piconn = socket;
        console.log("PI socket")
        console.log(sock.id)

    });

    socket.on('termdata', function(data) {
        if(browserconn)
            browserconn.emit('data', data);
    });

    //if(socket==browserconn) {


    //} else if(socket==piconn){

   // }

    /*
     socket.on('data', function(data) {
     if (stream) stream.write('IN: ' + data + '\n-\n');
     //send data to term
     console.log(data)
     socket.emit('cmdtoterm', data);
     //term.write(data);
     });

     socket.on('disconnect', function() {
     socket = null;
     });

     socket.on('termdata', function() {
     socket.emit('data', data);
     });
     */
// while (buff.length) {
// socket.emit('data', buff.shift());
// }
});

/*

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});


*/