
/**
 * Module dependencies.
 */

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

app.get('/', routes.index);


app.get('/url2png', function(req, res) {

  if (!req.query.url) {
  	res.end("403");
  	return;
  }

  if (req.query.callback) {
  	res.end("200");
  };


  phantom.create(function(ph) {
  	ph.createPage(function(page) {
  	
  		page.set('settings.userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17');
  		page.set('viewportSize', { width: req.query.ww || 1200, height: req.query.wh || 968 });
  		page.set('customHeaders', {
  			Referer: req.query.url
  		});

  		page.open( req.query.url || "http://vieron.net", function(status) {
  			//capture rendered page
  			setTimeout(function(){
  				page.renderBase64('PNG', function(b64) {
	  			  	var datauri = 'data:image/png;base64,' + b64;
		  			// var body = '{"data": "' + datauri + '"}';
		  			var body = '<img src="' + datauri + '" />';
	  			  	console.log('rendered png', status);

	  			  	ph.exit();

					req.query.callback && needle.post(req.query.callback, {image: datauri},
					    function(err, resp, body){
					    	if (err) {
					    		console.log('HTTP POST hook ERROR', err);
					    	} else {
					    		console.log('HTTP POST hook SUCCESS');
					    	}
						}
					);

					if (!req.query.callback && (!req.query.type || !req.query.type == 'html') ) {
						res.render('url2png', {
							title: 'Site rendered: ' + req.query.url,
							image: datauri
						});
					}

					if (!req.query.callback && req.query.type == 'json') {
						res.json({
							image: datauri
						});
					};
					
					// res.end(body);
  				});
  			  
  			}, 1000);
  			
  		});
	  });
	});
    




});






http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
