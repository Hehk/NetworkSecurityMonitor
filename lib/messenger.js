var http = require('http');

var twilio = require('twilio'),
    twilio_sid = 'ACc8f3c0e60b9eef8b0f0a70e2c5f265e7',
    twilio_auth = '8295f6c0a3f39c3ba8ffa793a014ac25',
    twilio_num = ' +18599558273',
    twilio_client = new twilio.RestClient(twilio_sid, twilio_auth);

var response_watchers = [];

function sendMessage(body) {
  twilio_client.sms.messages.create({
      to:   '+15135503175',
      from: twilio_num,
      body: body
  }, function(error, message) {
      if (!error) {

      } else {
          console.log('Oops! There was an error.');
      }
  });
}

module.exports = {
  sendMessage: sendMessage
}
