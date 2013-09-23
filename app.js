var express = require('express')
  ,	cons = require('consolidate')
  , phantom = require('phantom')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , needle = require('needle');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


var capture_url = function(req, res, callback) {
  var url = req.query.url;

  phantom.create(function(ph) {
    ph.createPage(function(page) {

      page.set('settings.userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17');
      page.set('viewportSize', { width: req.query.ww || 1480, height: req.query.wh || 968 });

      // required for typekit
      page.set('customHeaders', {
        Referer: url
      });

      page.open( url || "http://google.com", function(status) {
        //capture rendered page
        setTimeout(function(){

          var title = page.evaluate(function () {
              return document.title;
          });

          page.renderBase64('PNG', function(b64) {
              console.log('rendered png', status);

              var data = {
                'query_url': url,
                'datauri': 'data:image/png;base64,' + b64,
                'b64': b64,
                'title': title || ''
              };

              ph.exit();

              callback && callback(status, data);
          });
        }, 1000);
      });
    });
  });
};



app.get('/', routes.index);



//Usage: http://localhost:3000/url2png?url=http://vieron.net
app.get('/url2png', function(req, res) {

  if (!req.query.url) {
  	res.end("403");
  	return;
  }

  if (req.query.callback) {
  	res.end("200");
  };

  var url = req.query.url;
  var callback = req.query.callback;
  var format = req.query.type;

  capture_url(req, res, function(status, data) {

    delete data.b64;

    if (callback) {
      // post callback
      callback && needle.post(callback, data, function(err, resp, body) {
        if (err) {
          console.log('HTTP POST hook ERROR', err);
        } else {
          console.log('HTTP POST hook SUCCESS');
        }
      })
    }

    if (!format || format === 'html') {
      res.render('url2png', data);
    }

    if (format === 'json') {
      res.json(data);
    }

  });

});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});