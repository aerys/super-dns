#!/bin/sh
':' //# http://sambal.org/?p=1014; exec /usr/bin/env node --require babel-polyfill $0 $@

var keystone = require('keystone');
var path = require('path');
var url = require('url');
var argv = require('minimist')(process.argv.slice(2));

keystone.init({headless: true});

keystone.mongoose.connect('mongodb://127.0.0.1');

keystone.import('../src/model');

var Admin = keystone.list('Admin');

function addAdmin(userEmail, userPassword, userName, done) {
  Admin.model.findOne({email: userEmail})
    .exec((err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        var newAdmin = new Admin.model({
          email: userEmail,
          name: userName,
          password: userPassword
        });

        newAdmin.save((saveErr) => {
          if (saveErr) {
            return done(saveErr);
          }

          console.log('Admin created.');
          return done();
        });
      } else {
        console.log('Admin already exists.');
        return done();
      }
    });
};

addAdmin(
  argv.email, argv.password, argv.username,
  (err, admin) => {
    if (!!err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  }
);
