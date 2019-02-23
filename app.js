var http = require('http');
var request = require('request');

//create a server object:
http.createServer(function (req, res) {

  request('benarea.com', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var imageLinks = scrapeImgsHTML(body);
      var htmlRes = "<html><head><title>Image Scraper</title></head><body>"
      for (var i = 0; i < imageLinks.length; i++) {
        htmlRes +="<div>"
        htmlRes +="<h4>"+imageLinks[i]+"</h4>"
        htmlRes +="<img width='400px' src='"+ imageLinks[i] +"'>"
        htmlRes +="</div>"
      }
      htmlRes += "</body></html>"
      res.write(htmlRes);
      res.end();
    }
  });
  
}).listen(process.env.PORT || 80);



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