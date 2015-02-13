var http = require('http');
var events = require('events');
var util = require('util');
var uuid = require('node-uuid');
var debug = require('debug')('lilbro:solr');

var SolrWriter = function(options) {

	events.EventEmitter.call(this);

	// 'http://localhost:8990/solr/heatmap/update?commit=true' -H 'Content-Type:application/json'
	this.agent = new http.Agent({ host: options["solr-host"], port: options["solr-port"] });
	this.agent.maxSockets = 512;


	this.request_options = {
		host: options["solr-host"],
		port: options["solr-port"],
		path: "/solr/heatmap/update?commit=true",
		method: "POST",
		agent: this.agent,
		headers: { "content-type": "application/json" }
	};

	this.on('data', function(data) {
		//console.log(data);
		var req = http.request(this.request_options, function(res) {
			
			res.on("end", function() {
				if (res.statusCode !== 200) {
					debug("bad response: " + res.statusCode);
				}
			});

			res.on('data', function (chunk) {
		    	debug(chunk);
		  	});

		});

		req.on("error", function(e) {
			debug(e.toString());
		});

		var entry = [{
			"uid": uuid.v4(),
			"mouse_x_y": data.mouse_x + '-' + data.mouse_y,
			"timestamp": new Date(),
			"viewport": data.viewport_width + '-' + data.viewport_height,
			"visitor": data.visitor_id,
			"visit": data.visit_id,
			"event": parseInt(data.event_type),
			"scroll": data.scroll_y + '-' + data.scroll_x,
			"id": data.element_id,om,
			"class": data.element_class,
			"tag": data.element_tag,
			"browser": data.browser,
			"OS": data.operating_system,
			"url": data.request_path
		}];

		//console.log(entry);
		debug('forwarding event ' + entry.uid);

		req.write(JSON.stringify(entry));
		req.end();
	});

	this.on('close', function() {
		// no-op
	});
};

util.inherits(SolrWriter, events.EventEmitter);

module.exports = SolrWriter;

