var messenger = require('./messenger.js');
var jsonfile  = require('jsonfile');
var fs        = require('fs');
var colors    = require('colors');
var _         = require('lodash');

var json_log_file = './log.json';
var text_log_file = './log.txt';

var our_team_name = "ROSEBUD";

// last time our teams scores increased
var last_change = (new Date()).getTime();
var warning_time = 1000 * 60 * 90;

var data = [];

function createMessage(a, b, num) {
  var message = '';

  if (a.points > b.points) {
    message = 'points have decreased'
    fs.appendFile(text_log_file, 'Server [' + (num + 1) + ']: ' + message + '\n', function (err) {
      if (err) throw err;
    });
  } else if (a.points < b.points) {
    fs.appendFile(text_log_file, 'Server [' + (num + 1) + ']: points have increased\n', function (err) {
      if (err) throw err;
    });
    //message = 'points have increased';
  }

  if (message === '') {
    return '';
  } else {
    console.log('Server['.white, (num + 1).toString().bold.green, ']: '.white, message.bold.red);
    return '\nServer [' + (num + 1) + ']: ' + message;
  }
}

function respondToChange(prev_data, new_data) {
  var prev_our_team = getServers(prev_data, our_team_name);
  var new_our_team = getServers(new_data, our_team_name);
  var messages = '';

  for(var i = 0; i < 3; i++) {
    if (_.isEqual(prev_our_team[i], new_our_team[i]) === false) {
      messages += createMessage(prev_our_team[i], new_our_team[i], i);
    }
  }

  if (messages.length > 0) {
    last_change = (new Date()).getTime();

    console.log('Time: '.white, (new Date()).toString().green, '\n');
    messenger.sendMessage(messages);
  }

  var log_time = 'Time: ' + (new Date()).toString() + '\n';
  fs.appendFile(text_log_file, log_time, function (err) {
    if (err) throw err;
  });
}

function getServers(cur_data, team_name) {
  var index = _.findIndex(cur_data, function (elem) {
    return elem.team_name === team_name
  });

  return cur_data[index].servers;
}

module.exports = {
  push: function (new_data) {
    var prev_data = this.peek();

    if (_.isEqual(prev_data, new_data) === false) {
      data.push(new_data);

      // updates the data file
      var log_data = {
        time: new Date(),
        data: new_data
      };

      fs.appendFile(json_log_file, JSON.stringify(log_data), function(err) {
        if (err) throw err;
      })

      if (typeof prev_data !== 'undefined') {
        respondToChange(prev_data, new_data);
      }
    }

    if ((new Date()).getTime() > last_change + warning_time) {
      console.log('Points have not increased in the last hour and a half!'.red, '\n');
      messenger.sendMessage('Points have not increased in the last hour and a half!');
    }
  },
  peek: function () {
    return data[data.length - 1];
  }
}
