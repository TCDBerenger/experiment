var http = require('http');
var events = require('events');
var util = require('util');

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

		var req = http.request(this.request_options, function(res) {

			res.on("end", function() {
				if (res.statusCode !== 200) {
					util.log("bad response: " + res.statusCode);
				}
			});
		});

		req.on("error", function(e) {
			util.log("error posting to devent-forwarder" + e.toString());
		});

		req.end(JSON.stringify(data));
	});

	this.on('close', function() {
		// no-op
	});
};

util.inherits(SolrWriter, events.EventEmitter);

module.exports = SolrWriter;

