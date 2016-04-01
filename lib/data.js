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
var last_change_message = (new Date()).getTime();

var data = [];

function createMessage(a, b, num) {
  var message = '';
  var output = false;

  if (a.points > b.points) {
    if (a.points - b.points >= 5) {
      message = 'points have decreased [unexpected]';
      output = true;
    } else {
      message = 'points have decreased [expected]';
    }
  } else if (a.points < b.points) {
    message = 'points have increased';
    last_change = (new Date()).getTime();
  }

  fs.appendFile(text_log_file, 'Server [' + (num + 1) + ']: ' + message + '\n', function (err) {
    if (err) throw err;
  });

  if (output) {
    console.log('Server['.white, (num + 1).toString().bold.green, ']: '.white, message.bold.red);
    console.log(message);
    return 'Server [' + (num + 1) + ']: ' + message + '\n';
  } else {
    return '';
  }
}

function checkTime() {
  var minute = 1000 * 60;
  var warning_time = minute * 90;
  var warning_time_spacing = minute * 30;
  var cur_time = (new Date()).getTime();

  if (cur_time > last_change + warning_time && cur_time > last_change_message + warning_time_spacing) {
    var message = 'Points have not increased in ' + Math.floor((cur_time - last_change) / minute) + 'min';

    console.log(message.red, '\n');
    messenger.sendMessage(message);

    last_change_message = cur_time;
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

    console.log(messages);
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

function monitorTransferChange(prev_data, new_data) {
  var message = false;

  for (var i = 0; i < new_data.length; i++) {
    var new_servers =  new_data[i].servers;
    var prev_servers = prev_data[i].servers;
    var team_name = new_data[i].team_name;

    for (var j = 0; j < new_servers.length; j++) {
      var initiate = Number(new_servers[j].initiate) - Number(prev_servers[j].initiate),
          accept   = Number(new_servers[j].accept)   - Number(prev_servers[j].accept),
          decline  = Number(new_servers[j].decline)  - Number(prev_servers[j].decline);

      if (initiate + accept + decline > 0) {
        console.log((team_name + '-' + (j + 1).toString() + ':').white, 'i: ' + ('+' + initiate).red, 'a: ' + ('+' + accept).red, 'd: ' + ('+' + decline).red);
        message = true;
      }
    }
  }

  if (message) {
    console.log('\n');
    messenger.textNich('Change in Transfers');
  }
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
        monitorTransferChange(prev_data, new_data);
      }
    }

    checkTime();
  },
  peek: function () {
    return data[data.length - 1];
  }
}
