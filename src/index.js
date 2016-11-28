var keystone = require('keystone');
var srs = require('secure-random-string');
var url = require('url');

keystone.init({

  'name': 'superdns',
  'brand': 'superdns',
  'admin path': 'admin',

  'views': 'templates/views',
  'view engine': 'jade',

  'mongo' : 'mongodb://127.0.0.1',

  'auto update': false,
  'session': true,
  'auth': true,
  'user model': 'Admin',
  'cookie secret': srs(64),

  'logger': false
});

keystone.import('model');

keystone.set('locals', {
  // _: require('underscore'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
});

keystone.set('routes', require('./route'));
keystone.set('nav', {
});

keystone.start();

require('./dns');
