var http = require('http');
var request = require('request');

//create a server object:
http.createServer(function (req, res) {
  res.write('Hello World!');
  request('http://www.benarea.com/', function (error, response, body) {
    //console.log(response);
    if (!error && response.statusCode == 200) {
      //var info = JSON.parse(body)
      //console.log(body);
      res.write(body);
      res.end();
    }
  });
  
}).listen(process.env.PORT || 80);