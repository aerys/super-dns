var keystone = require('keystone');
var dns = require('native-dns');
var winston = require('winston');
var async = require('async');

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: true,
      colorize: true,
      prettyPrint: true,
      timestamp: true,
    }),
  ],
  exitOnError: true,
});

var DynamicDNS = keystone.list('DynamicDNS');

let authority = { address: '8.8.8.8', port: 53, type: 'udp' };

function proxy(question, response, cb) {
  var request = dns.Request({
    question: question, // forwarding the question
    server: authority,  // this is the DNS server we are asking
    timeout: 1000
  });

  // when we get answers, append them to the response
  request.on('message', (err, msg) => {
    msg.answer.forEach(a => response.answer.push(a));
  });

  request.on('end', cb);
  request.send();
}

var server = dns.createServer();

server.on('listening', () => logger.info('server listening on', server.address()));
server.on('close', () => logger.info('server closed', server.address()));
server.on('error', (err, buff, req, res) => logger.error(err.stack));
server.on('socketError', (err, socket) => logger.error(err));
server.on('request', (request, response) => {
  let f = []; // array of functions
  async.waterfall(
    request.question.map(question => callback => {
      logger.info('DNS request', {hostname: question.name, from:request.address.address});
      DynamicDNS.model.findOne({hostname:question.name}).exec((err, dyndns) => {
        if (!!dyndns) {
          response.answer.push(dns.A({
            name: dyndns.hostname,
            address: dyndns.ip,
            ttl: dyndns.ttl
          }));
          logger.info('DNS response', {hostname: question.name, ip:dyndns.ip});
          callback(null);
        } else {
          logger.info('proxying DNS request', {hostname: question.name});
          f.push(cb => proxy(question, response, cb));
          callback(null);
        }
      })
    }),
    (err) => {
      async.parallel(f, () => response.send());
    }
  );
});

server.serve(53, '127.0.0.1');
