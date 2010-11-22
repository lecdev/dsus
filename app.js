/*
/#!/articles/
/#!/articles/article-title-url-sanitized
/#!/articles/article-title-url-sanitized/tags-appended-here (limit of 1st 4 tags)
/#!/twitter/
/#!/twitter/status_id
/#!/elsewhere/
/#!/elsewhere/facebook
/#!/work/
/#!/work/company-name-project-name
/#!/work/company-name-project-name/skill-tags-appended-here (limit of 1st 4 skill tags)


so, we parse out everything after #! and send it via ajax to get the next page.
part 1: section
part 2: specific item
part 3: additional info
*/

var util = require('util'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    m = require('mustache'), // switch to mu by rayMorgan
    c = require('./content'),
    t = require('./templates'),
    a = require('./articles');

function defaultView(content) {
  this.content = content;
};

defaultView.prototype = {
  title: 'Dave Stevens (shakefon) is not your #1 enemy',
  meta: '<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">',
  styles: '<link rel="stylesheet" type="text/css" href="/styles/style.css"/>\n<!--[if !IE]>-->\n<link type="text/css" rel="stylesheet" media="only screen and (max-device-width: 480px)" href="/styles/mbl.css">\n<!--<![endif]-->'
};

http.createServer(function(request, response){  
  var p = url.parse(request.url), 
      base = p.pathname, 
      filename = path.join(process.cwd(),base),
      h = (base.indexOf('.css') != -1) ? 'text/css' : (base.indexOf('.js') != -1) ? 'text/javascript' : (base.indexOf('.png') != -1) ? 'image/png' : (base.indexOf('.jpg') != -1) ? 'image/jpeg' : (base.indexOf('.gif') != -1) ? 'image/gif' : 'text/html';

  if (base.length === 0 || base == '/') {
    
    // HOMEPAGE
    
    var view = new defaultView(c.home);
    html = m.to_html(t.page,view);

    response.writeHead(200,'text/html');
    response.write(html);
    response.end();
    
  } else if (base == '/aea') {

    // THIS WILL BE EXPANDED OUT TO CONTROL WHATEVER WE'RE SHOWING - SECTIONS ABOVE ETC.
    // IN FACT, THIS SECTION CAN BE A VANITY URL HANDLER. HAVE AN ARRAY OF VANITY URLS AND THEIR
    // TEMPLATES TO USE, SO WE CAN DO AEA, CES, FOWD, WHATEVER.    
    var view = new defaultView(c.aea);
    view.title = 'I\'m Dave Stevens: We Met At An Event Apart San Diego 2010';
    view.meta = '<meta name="robots" content="noindex,nofollow,noarchive"/><meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">';
    var html = m.to_html(t.page,view);

    response.writeHead(200,'text/html');
    response.write(html);
    response.end();

  } else if (base.split('/')[1] == 'articles') {

    var keys = {
      'setting-up-node-js-and-couchdb-on-webfaction':'01'
    },    
        keysTitles = {
      '01':'Setting up node.js and CouchDB on Webfaction'
    },
        keysContent = {
      '01': a.article01    
    };
    
    var persistent = ['<div id="photo"><img src="/imgs/dave.jpg"/><span>I look like this</span></div>','</div>','<div id="twitter"><a href="http://twitter.com/shakefon">YOU SHOULD FOLLOW ME ON TWITTER.</a></div>'].join(''),
        urlKey = base.split('/')[2],
        key = keys[urlKey],
        view = new defaultView(keysContent[key] + persistent);
    
    view.title = keysTitles[key] || 'Article';
    var html = m.to_html(t.page,view);
    response.writeHead(200,'text/html');
    response.write(html);
    response.end();
    
  } else {

    // STATIC FILES TO BE SERVED
    path.exists(filename, function(exists) {  
      if(!exists) {  
        response.writeHead(404, {'Content-Type':h});
        response.write("404 Not Found\n");  
        response.end();
        return;  
      }  

      fs.readFile(filename, "binary", function(err, file) {  
        if(err) {  
          response.writeHead(500, {'Content-Type':'text/plain'});
          response.write(err + "\n");  
          response.end();
          return;  
        }             
        response.writeHead(200, {'Content-Type':h});          
        response.write(file, "binary");  
        response.end();
      });  
    });
    
  }   
}).listen(56246,"127.0.0.1");
console.log("server listening on port 56246");
