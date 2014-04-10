'use strict';

var Dextromethorphan = function (options) {
  var level = require('level');
  var paginate = require('level-paginate');
  var Sublevel = require('level-sublevel');
  var concat = require('concat-stream');

  var KEY = 'post!';

  var self = this;
  var users = {};

  this.dbPath = options.db;
  this.limit = options.limit - 1 || 10;
  this.db = Sublevel(level(this.dbPath, {
    createIfMissing: true,
    valueEncoding: 'json'
  }));
  this.centralLevel = this.db.sublevel('central');

  var setTime = function () {
    return Date.now();
  };

  var checkUser = function (user) {
    if (!users[user]) {
      users[user] = self.db.sublevel('user!' + user);
    }
  };

  this.create = function (user, message, callback) {
    if (!message.content.message) {
      callback(new Error('Message invalid'));
    } else {
      message.id = setTime();
      message.content.created = message.content.updated = message.id;
      this.update(user, message, callback);
    }
  };

  this.get = function (id, callback) {
    self.centralLevel.get(KEY + id, function (err, message) {
      if (err || !message) {
        callback(new Error('Not found ', err));
      } else {
        callback(null, message);
      }
    });
  };

  this.update = function (user, message, callback) {
    checkUser(user);
    message.content.updated = setTime();

    this.centralLevel.put(KEY + message.id, message, function (err) {
      if (err) {
        callback(err);
      } else {
        users[user].put(KEY + message.id, message, function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null, message);
          }
        });
      }
    });
  };

  this.del = function (user, id, callback) {
    checkUser(user);
    this.centralLevel.del(KEY + id);
    users[user].del(KEY + id);

    callback(null, true);
  };

  this.getAll = function (start, callback) {
    var rs = paginate(this.centralLevel, KEY, {
      page: start,
      num: self.limit
    });

    rs.pipe(concat(function (messages) {
      callback(null, messages);
    }));

    rs.on('error', function (err) {
      callback(err);
    });
  };

  this.getAllByUser = function (user, start, callback) {
    checkUser(user);

    var rs = paginate(users[user], KEY, {
      page: start,
      num: self.limit
    });

    rs.pipe(concat(function (messages) {
      callback(null, messages);
    }));

    rs.on('error', function (err) {
      callback(err);
    });
  };
};

module.exports = Dextromethorphan;
