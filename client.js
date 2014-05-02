#!/usr/bin/env node

  /**
   * term.js
   * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
   */

  var http = require('http')
      , express = require('express')
      , io = require('socket.io')
      , pty = require('pty.js')
      , terminal = require('./lib');

  /**
   * term.js
   */

  process.title = 'term.js';

  /**
   * Dump
   */

  var stream;
  if (process.argv[2] === '--dump') {
      stream = require('fs').createWriteStream(__dirname + '/dump.log');
  }

  /**
   * Open Terminal
   */

  var buff = []
      , socket
      , term;

  term = pty.fork(process.env.SHELL || 'bash', [], {
      name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
          ? 'xterm-256color'
          : 'xterm',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME
  });

  term.on('data', function(data) {
      if (stream) stream.write('OUT: ' + data + '\n-\n');
      // send data to server
      console.log("reply from shell:\n")
      console.log(data)
      if(mysocket) mysocket.emit('termdata', data);
//      return !mysocket
//          ? buff.push(data)
//          : socket.emit('data', data);
  });

  console.log(''
          + 'Created shell with pty master/slave'
          + ' pair (master: %d, pid: %d)',
      term.fd, term.pid);

/**
 * App & Server
 */

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
app.use(terminal.middleware());

if (!~process.argv.indexOf('-n')) {
    server.on('connection', function(socket) {
        var address = socket.remoteAddress;
        if (address !== '127.0.0.1' && address !== '::1') {
            try {
                socket.destroy();
            } catch (e) {
                ;
            }
            console.log('Attempted ection from %s. Refused.', address);
        }
    });
}

server.listen(8080);

/**
 * Sockets
 */
/*
    <script src="/socket.io/socket.io.js"></script>
    <script>
var socket = io.connect('http://pisignage.com');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});
</script>
*/


/*
io = io.listen(server, {
    log: false
});

io.sockets.on('connection', function(sock) {
    socket = sock;

    socket.on('data', function(data) {
        if (stream) stream.write('IN: ' + data + '\n-\n');
        term.write(data);
    });

    socket.on('disconnect', function() {
        socket = null;
    });

    while (buff.length) {
        socket.emit('data', buff.shift());
    }
});
*/

//var mysocket = io.connect('http://pisignage.com');

var ioclient = require('socket.io-client');
//var mysocket= ioclient.connect('http://pisignage.com:8080', { 'force new connection': true })
var mysocket= ioclient.connect('http://192.168.1.205:8080', { 'force new connection': true })


mysocket.on('connect', function(sock) {
   socket = sock;
    mysocket.emit('piconn', "connection from pi");

    mysocket.on('cmdtoterm', function(data) {
        if (stream) stream.write('IN: ' + data + '\n-\n');
        console.log(data)
        term.write(data);
    });

    mysocket.on('disconnect', function() {
        socket = null;
    });

    while (buff.length) {
        mysocket.emit('termdata', buff.shift());
    }

});


