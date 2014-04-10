'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');
var child = require('child_process');
var Dextromethorphan = require('../index');

var d = new Dextromethorphan({
  db: './test/db'
});
var id;
var secId;
var author = 'jen';

var message = {
  content: {
    message: 'some message'
  },
  meta: {
    location: '37.3882807, -122.0828559'
  }
};

describe('dextromethorphan', function () {
  after(function () {
    child.exec('rm -rf ./test/db');
  });

  describe('.create',  function () {
    it('creates an invalid message', function (done) {
      message.content.message = '';

      d.create(author, message, function (err, m) {
        should.exist(err);
        done();
      });
    });

    it('creates a valid message', function (done) {
      message.content.message = 'test';

      d.create(author, message, function (err, m) {
        should.exist(m);
        id = m.id;
        m.content.should.equal(message.content);
        m.meta.should.equal(message.meta);
        done();
      });
    });
  });

  describe('.get', function () {
    it('gets a message', function (done) {
      d.get(id, function (err, m) {
        should.exist(m);
        done();
      });
    });

    it('does not get a message', function (done) {
      d.get(1111, function (err, m) {
        should.exist(err);
        done();
      });
    });
  });

  describe('.update', function () {
    it('updates a message', function (done) {
      d.get(id, function (err, m) {
        m.content.message = 'new message';

        setTimeout(function () {
          d.update(author, m, function (err, mt) {
            mt.content.message.should.equal(m.content.message);
            mt.content.updated.should.not.equal(mt.content.created);
            done();
          });
        }, 1500);
      });
    });
  });

  describe('.getAll', function () {
    it('get all central messages', function (done) {
      d.getAll(0, function (err, mArr) {
        should.exist(mArr);
        mArr.length.should.equal(1);
        done();
      });
    });
  });

  describe('.getAllByUser', function () {
    it('get all user messages', function (done) {
      d.getAllByUser(author, 0, function (err, mArr) {
        should.exist(mArr);
        mArr.length.should.equal(1);
        done();
      });
    });
  });

  describe('.del', function () {
    it('deletes a message', function (done) {
      d.del(author, id, function (err, status) {
        d.get(id, function (err, msg) {
          should.not.exist(msg);
          done();
        });
      });
    });
  });
});
