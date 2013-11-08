
var MongoServer = require('mongodb').Server;
var MongoDb = require('mongodb').Db;
var assert = require('assert');
var http = require('http');
var fs = require('fs');
var ts = require('ts');


var mongodb = 'csc130';
var mongohost = 'localhost';
var mongoport = 27017;
var mongocollection = 'kvs';
var listenport = 64444;

var consolelog = false;
var logfile = 'kvs.log';
var logfd = null;

if (logfile) {
	logfd = fs.createWriteStream(logfile);
}

function timestamp() {
	return ts(Date.now()).split('GMT')[0] + '| ';
}

function serverlog(msg) {
	msg = timestamp() + msg;
	if (consolelog)
		console.log(msg);
	if (logfile)
		logfd.write(msg);
}

function failedRequest(res, msg) {
	msg = msg || '';
	res.writeHead(500, 'Server Error', {'access-control-allow-origin':'*', 'Content-Type': 'application/json'});
	res.end(msg);
}

function serverError(res, err) {
	serverlog('Failed Request:' + err.toString());
	failedRequest(res);
}

function successfulRequest(res, data, logmsg) {
	serverlog('Success: ' + logmsg);
	res.writeHead(200, 'OK', {'access-control-allow-origin':'*', 'Content-Type': 'application/json'});
	res.end(data);
}

function badRequest(res, msg) {
	serverlog('Bad Request: ' + msg);
	res.writeHead(400, 'Bad Request', {'access-control-allow-origin':'*', 'Content-Type': 'application/json'});
	res.end('');
}


var db = new MongoDb(mongodb, new MongoServer(mongohost, mongoport), {w:-1});
http.createServer(function(req, res) {

	req.put = (req.url == '/put');
	req.get = (req.url == '/get');
	if (req.method != 'POST' || !(req.put || req.get)) {
		return badRequest(res, req.method + ' to ' + req.url);
	}

	var postdata = ''
	req.on('data', function(chunk) {
		postdata += chunk.toString();
	});
	req.on('end', function() {

		if (!postdata)
			return badRequest(res, req.url + ' missing resource identifier');
		serverlog('Got ' + req.url + ' request: ' + postdata);

		var mongorequest = JSON.parse(postdata);
		db.open(function(err, db) {

			if (err) return serverError(res, err);

			var coll = db.collection(mongocollection);
			if (req.get) {
				coll.findOne(mongorequest, function(err, doc) {
					if (err) {
						serverError(res, err);
					} else {
						jsondoc = JSON.stringify(doc);
						successfulRequest(res, jsondoc, 'Query returned: ' + jsondoc);
					}
					db.close();
				});
			} else { // put
				var searchObj = {name:mongorequest.name, key:mongorequest.key}
				coll.update(searchObj, mongorequest, {upsert:true}, function(err, count) {
					if (err) {
						serverError(res, err);
					} else {
						resmsg = 'inserted ' + JSON.stringify(mongorequest);
						successfulRequest(res, '{\"inserted\":true}', resmsg);
					}
					db.close();
				});
			}
		});
	});
}).listen(listenport);

serverlog('Started http server on port ' + listenport);

