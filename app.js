var http = require('http');
var request = require('request');
var url = require('url');
var fs = require('fs');

//create a server object:
fs.readFile('./form.html', function(err, html) {
  if (err) {throw err;}
  http.createServer(function (req, res) {
    if (req.url != '/favicon.ico') {
      var q = url.parse(req.url, true);
      var qdata = q.query;
      console.log(qdata);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(html);
      request(qdata.url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var imageLinks = scrapeImgsHTML(body);
          var htmlRes = "<html><head><title>Image Scraper</title></head><body>"
          for (var i = 0; i < imageLinks.length; i++) {
            htmlRes +="<div>"
            htmlRes +="<h4>"+imageLinks[i]+"</h4>"
            htmlRes +="<img width='600px' src='"+ imageLinks[i] +"'>"
            htmlRes +="</div>"
          }
          htmlRes += "</body></html>"
          res.write(htmlRes);
          res.end();
        }
      });
    }
  }).listen(process.env.PORT || 80);
});


/*request('https://www.reddit.com', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var imageLinks = scrapeImgsHTML(body);
        var htmlRes = "<html><head><title>Image Scraper</title></head><body>"
        htmlRes += html;
        for (var i = 0; i < imageLinks.length; i++) {
          htmlRes +="<div>"
          htmlRes +="<h4>"+imageLinks[i]+"</h4>"
          htmlRes +="<img width='600px' src='"+ imageLinks[i] +"'>"
          htmlRes +="</div>"
        }
        htmlRes += "</body></html>"
        res.write(htmlRes);
        res.end();
      }
});*/

function scrapeImgsHTML (htmlData) {
    var images = {
      imgTags: [],
      imgLinks: [],
      imgCSS: [],
      links: []
    };

    images.splitTags = htmlData.split('<img ');
    
    for (var i = 1; i < images.splitTags.length; i++) { //skip first element

      images.imgTags[i-1] = images.splitTags[i].split('>', 1);
      images.imgTags[i-1] = images.imgTags[i-1][0]; //remove extra array depth
    }

    images.splitCSS = htmlData.split('background-image:');
    //console.log(images.splitCSS);
    for (var i = 1; i < images.splitCSS.length; i++) { // skip first element
      images.imgCSS[i-1] = images.splitCSS[i].split(';', 1);
      images.imgCSS[i-1] = images.imgCSS[i-1][0];
    }

    // parse link from CSS links
    for (var i = 0; i < images.imgCSS.length; i++) {
      if (images.imgCSS[i].length > 4) {
        var totalLinks = images.imgLinks.length
        images.imgLinks[totalLinks] = images.imgCSS[i].split('(');
        images.imgLinks[totalLinks] = images.imgLinks[totalLinks][1];
        images.imgLinks[totalLinks] = images.imgLinks[totalLinks].split(')');
        images.imgLinks[totalLinks] = images.imgLinks[totalLinks][0];
      }
      
    }

    for (var i = 0; i < images.imgTags.length; i++) {
      var totalLinks = images.imgLinks.length
      images.imgLinks[totalLinks] = images.imgTags[i].split(' ');
      for (var j = 0; j < images.imgLinks[totalLinks].length; j++) {
        if (images.imgLinks[totalLinks][j].slice(0,9) === 'src="http') {
          images.imgLinks[totalLinks] = images.imgLinks[totalLinks][j];
          images.imgLinks[totalLinks] = images.imgLinks[totalLinks].split('"');
          images.imgLinks[totalLinks] = images.imgLinks[totalLinks][1];
        }
        
      }
    }

    for (var i = 0; i < images.imgLinks.length; i++) {
      if (typeof images.imgLinks[i] === 'string') {
        images.links[images.links.length] = images.imgLinks[i];
      }
    }

    return images.links;
}