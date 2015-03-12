var express = require('express');
var http    = require('http');
var url     = require("url");
var path    = require('path');
var fs      = require('fs');
var debug   = require('debug')('lilbro');
var bp      = require('body-parser');

// Variables
var loaded_schemas = {};
var bad_schemas = {};
var https_opts = {};
var js_bundles = {};
var opts = {};
var bug,
    client_js_path,
    post_opts,
    server,
    secure_server;

exports.createServer = function(options) {
	// Initialize
	bug = fs.readFileSync(options["png-bug"]);
	client_js_path = options["client-js-path"];

	js_bundles["shared"] = fs.readFileSync(path.join(client_js_path, "lilbro.js"));
	js_bundles["shared"] += fs.readFileSync(path.join(client_js_path, "lilbro.browser.js"));
	js_bundles["default"] = fs.readFileSync(path.join(client_js_path, "lilbro.schema.js"));

	// Application
	var app = express();
	var rootPath = path.join(__dirname, '..');

	var Writer = require("./writers/" + options.writer);
	writer = new Writer(options);
	opts = options;


	process.chdir(rootPath)

	app.use(express.static(path.join(rootPath, 'heatmap')))
	app.use(bp.json());
	app.use(bp.urlencoded({ extended: true }));

	// Proxying Solr requests
	app.get('/solr/*', function(request,response) {
		proxy('GET',request,response);
	});

	// Write in the file
	app.post('/write', function(req, res) {
		var ip = req.headers['x-forwarded-for'] || 
    		req.connection.remoteAddress || 
    		req.socket.remoteAddress ||
    		req.connection.socket.remoteAddress;

		fs.appendFile('/app/infovis/' + ip +'.txt', req.body, function (err) {
			
		});
	});

	// Installing heatmap bookmarklet
	app.get('/install', function(request,response) {
		var host = request.headers.host;

		var html = [];
		html.push('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">');
		html.push('<html>');
		html.push('<head>');
		html.push('<title>Heatmap Bookmarklet</title>');
		html.push('<link type="text/css" rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">');
		html.push('</head>');
		html.push('<body>');
		html.push('<style>');
		html.push('#container {');
		html.push('	width: 80%;');
		html.push('	margin: 0 auto;');
		html.push('}');
		html.push('</style>');
		html.push('	<div id="container">');
		html.push('		<h1>Install Heatmap Bookmarklet</h1>');
		html.push('		<p>');
		html.push('	<li>To setup the bookmarklet, copy the code below into a new bookmark in Chrome.');
		html.push('	<li>Open the bookmark manager > Right Click > Add Page > Paste the above code in the "URL" textbox');
		html.push('	</p>');
		html.push("<pre>javascript:(function() {host='http://"+host+"', _bookmarklet_script = document.createElement('script'), _bookmarklet_script.src=host+'/panel.js', document.body.appendChild(_bookmarklet_script) })()</pre>");
		html.push('</div>');
		html.push('</body>');
		html.push('</html>');

		response.write(html.join(''));
		response.end();
	});

	// Health endpoint
	app.get('/health', function(request, response){
		response.write('OK');
		response.end();
	});

	// Track user requests
	app.get('/track/*', function(request, response){
		response.writeHead(200, {
			"Content-Length": bug.length,
			"Content-Type": "image/png",
			"Pragma": "no-cache",
			"Cache-Control": "must-revalidate"
		});
		response.end(bug);

		var parsed = url.parse(request.url, true);
		var event = parsed.pathname.substring(1, parsed.pathname.length - 4);
		onEvent(event);
	});

	// Lilbro client library
	app.get('/lilbro.js', function(request, response){
		var version = "default";
		fs.readFile(path.join(client_js_path, "lilbro.schema.js"), function(err, data) {
			if (err) {
				response.writeHead(404);
				response.end("404 Not Found");
				return;
			}

			js_bundles[version] = data;
			var expires = new Date;
			expires.setTime(expires.getTime() + (90 * 24 * 60 * 60 * 1000));
			response.writeHead(200, {
				"Content-Type": "application/javascript",
				"Expires": expires.toGMTString()
			});
			response.end(js_bundles["shared"] + js_bundles[version]);
		});
	});

	// proxy for solr requests
	var proxy = function(method,request,response) {
		setHeaders(response);

		var url_parts = url.parse(request.url, true);
		var path = '/solr/'+request.params[0];

		if (url_parts.search) {
			path += url_parts.search;
		}
		console.log(opts);

		var options = {
			method: method,
			host: opts["solr-host"],
			port: opts["solr-port"],
			path: path,
		};

		debug('proxying request: ',options);
		proxyRequest(response,options);
	}

	// send request and return response
	var proxyRequest = function(res, options) {
		var callback = function(response) {
			var str = '';
			response.on('data', function (chunk) {
				str += chunk;
			});
			response.on('end', function () {
				res.write(str);
				res.end();
			});
		}
		http.request(options, callback).end();
	};

	var setHeaders = function(res) {
		res.setHeader('Access-Control-Allow-Origin',  '*');
		res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET, OPTIONS');
		res.setHeader('Access-Control-Max-Age',       0);
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.setHeader('Cache-Control','max-age=0');
		res.setHeader('Content-Type','application/json');
	}

	return app;
}


	// Occurs when an event arrives
	var onEvent = function(encodedEvent) {
		try {
			var items = decodeURIComponent(encodedEvent).split("\x01");
		} catch (err) {
			if (err) {
				debug("could not decode event string: " + err.toString());
				return;
			}
		}

		var schema = load_schema(items[1]);
		if (!schema) return;

		var event = {};
		for (var i = 1; i < items.length; i++) {
			event[schema[i]] = items[i];
		}

		writer.emit('data', event);
	}


// Loads the schema
function load_schema(vstring) {
	if (bad_schemas[vstring]) {
		return;
	}
	if (loaded_schemas[vstring]) {
		return loaded_schemas[vstring];
	}

	try {
		var rev_key_map = {};
		var vlib = vstring === "default" ? "lilbro.schema" : "lilbro.schema." + vstring;
		var lbs = require(path.resolve(client_js_path, vlib));

		for (var key in lbs.LilBro.Schema.key_map) {
			rev_key_map[lbs.LilBro.Schema.key_map[key]] = key;
		}

		loaded_schemas[vstring] = rev_key_map;
		return loaded_schemas[vstring];

	} catch (e) {
		bad_schemas[vstring] = true;
	}
}