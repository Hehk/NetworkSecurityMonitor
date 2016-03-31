var url       = 'http://gauss.ececs.uc.edu/standings8150.html',
    scraper   = require('./lib/scraper.js'),
    messenger = require('./lib/messenger.js'),
    data      = require('./lib/data.js');


function startMonitor() {
  scraper.scrape(url, function (cur_data) {
    data.push(cur_data);
  });
}

setInterval(startMonitor, 1000 * 60);
