var http = require('http');
var events = require('events');
var util = require('util');
var uuid = require('node-uuid');

var SolrWriter = function(options) {

	events.EventEmitter.call(this);

	// 'http://localhost:8990/solr/heatmap/update?commit=true' -H 'Content-Type:application/json'
	this.agent = new http.Agent({ host: options["solr-host"], port: options["solr-port"] });
	this.agent.maxSockets = 512;

	this.request_options = {
		host: options["solr-host"],
		port: 8990/*options["solr-port"]*/,
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
					console.log("bad response: " + res.statusCode);
				}
			});

			res.on('data', function (chunk) {
		    	console.log('Solr: ' + chunk);
		  	});

		});

		req.on("error", function(e) {
			console.log("error posting to devent-forwarder" + e.toString());
		});

		var entry = [{
			"uid": uuid.v4(),
			"mouse_x_y": data.mouse_x + '-' + data.mouse_y,
			"site": 'experiment',
			"page": 'index.html',
			"timestamp": new Date(),
			"country":"ie",
			"language": "en",

			"viewport_width": parseInt(data.viewport_width),
			"viewport_height": parseInt(data.viewport_height),
			"visitor_id": data.visitor_id,
			"visit_id": data.visit_id,
			"event_type": parseInt(data.event_type),
			"scroll_x": data.scroll_x,
			"scroll_y": data.scroll_y,
			"element_id": data.element_id,
			"element_id_from": data.element_id_from,
			"element_class": data.element_class,
			"element_class_from": data.element_class_from,

			"element_name": data.element_name,
			"element_tag": data.element_tag,
			"element_type": data.element_type,
			"element_checked": data.element_checked,
			"element_value": data.element_value,
			"element_x_y": data.element_x + '-' + data.element_y,
			"browser": data.browser,
			"browser_version": data.browser_version,
			"operating_system": data.operating_system,
			"request_path": data.request_path
		}];

		//console.log(entry);

		req.write(JSON.stringify(entry));
		req.end();
	});

	this.on('close', function() {
		// no-op
	});
};

util.inherits(SolrWriter, events.EventEmitter);

module.exports = SolrWriter;

