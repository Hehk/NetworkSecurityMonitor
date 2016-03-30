var request = require('request'),
    cheerio = require('cheerio'),
    _ = require('lodash');

function convertData(data) {
  return {
    name:        data[0],
    rank:        data[1],
    points:      data[2],
    initiate:    data[4],
    accept:      data[5],
    decline:     data[6],
    ammount_out: data[8],
    ammount_in:  data[9]
  }
}

function groupTeams(data) {
  var newData = {};
  var regexp = /([A-Za-z_0-9]+)-([0-9])/;

  var newData = _(data)
    .groupBy(function (elem) {
      try {
        return elem.name.match(regexp)[1];
      } catch (e) {
        console.log(elem.name);
      }
    })
    .map(function (elems, name) {
      var formatted = elems.map(function (elem) {
        elem.name = Number(elem.name.match(regexp)[2]);

        return elem;
      });

      formatted.sort(function (a, b) {
        return a.name - b.name;
      });

      return {
        team_name: name,
        servers: formatted
      }
    });

  return newData.value();
}

function scrape(url, success) {
  request(url, (error, response, body) => {
    if (!error) {
      var $ = cheerio.load(body),
          teams = $('table tr').slice(2,20),
          team_data = {};

      teams.each((_i, elem) => {
        var sections = $(elem).find('td');
        var data = [];

        sections.each((_i, elem) => {
          data.push($(elem).text());
        });

        var formatted_data = convertData(data);

        team_data[formatted_data.name] = formatted_data;
      });

      success(groupTeams(team_data));
    } else {
      console.log('Error: ' + error);
    }
  });
}

module.exports = {
  scrape: scrape
};
