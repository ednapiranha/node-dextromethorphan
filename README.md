# dextromethorphan

## What it is

Microblogging with leveldb.

### Initialize

    var Dextromethorphan = require('dextromethorphan');

    var d = new Dextromethorphan({
      db: './db',
      limit: 10
    });

`db` is the path where your leveldb database is located.

`limit` is the number of records you want returned per page - defaults to 10 (optional).

### Create

    var message = {
      content: {
        message: 'some message'
      },
      meta: {
        location: '37.3882807, -122.0828559',
        author: 'jen',
        postType: 'youtube'
      }
    };

    d.create(message, function (err, msg) {
      if (!err) {
        console.log(msg);
      }
    });

### Edit / Update

    d.get('jen', 1, function (err, m) {
      if (!err) {
        m.content.message = 'new updated message';
        d.update(m, function (err, m) {
          if (!err) {
            console.log(m)
          }
        });
      }
    });

### Delete

    d.get('jen', 1, function (err, message) {
      if (!err) {
        d.del(message.id, function (err, status) {
          if (status) {
            console.log('deleted!')
          }
        });
      }
    });

### Get all main feed content

The default limit is set to 10. You can change this by setting `meat.limit = 15` as an example.

First argument 0 is the page from where you want to get messages.

    d.getAll(0, function (err, messages) {
      if (!err) {
        console.log(messages);
      }
    });

## Get all user feed content

The default limit is set to 10. You can change this by setting `meat.limit = 15` as an example.

Second argument 0 is the page from where you want to get messages.

    d.getAllByUser('jen', 0, function (err, messages) {
      if (!err) {
        console.log(messages);
      }
    });

## Tests

    > npm test
