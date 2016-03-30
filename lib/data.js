var messenger = require('./messenger.js');
var colors    = require('colors');
var _         = require('lodash');

var our_team_name = "ROSEBUD";

// last time our teams scores increased
var last_change = (new Date()).getTime();
var warning_time = 1000 * 60 * 90;

var data = [];

function createMessage(a, b, num) {
  var message = '';

  if (a.points > b.points) {
    message = 'points have decreased'
  } else if (a.points < b.points) {
    //message = 'points have increased';
  }

  if (message === '') {
    return ''
  } else {
    console.log('Server['.gray, (num + 1).toString().bold.green, ']: '.gray, message.red);
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

    console.log('Time: '.gray, (new Date()).toString().green, '\n');
    messenger.sendMessage(messages);
  }
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
