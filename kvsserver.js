
var MongoServer = require('mongodb').Server;
var MongoDb = require('mongodb').Db;
var assert = require('assert');
var http = require('http');
var fs = require('fs');
var ts = require('ts');


var mongodb = 'csc130'
var mongohost = 'localhost'
var mongoport = 27017
var mongocollection = 'kvs' 
var listenport = 64444;

var consolelog = true;
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
	res.writeHead(500, 'Server Error', {'Content-Type': 'application/json'});
	res.end(msg);
}

function serverError(res, err) {
	serverlog('Failed request:' + err.toString());
	failedRequest(res);
}

function successfulRequest(res, data, logmsg) {
	serverlog(logmsg);
	res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
	res.end(data);
}

var db = new MongoDb(mongodb, new MongoServer(mongohost, mongoport), {w:-1});
http.createServer(function(req, res) {

	req.put = (req.url == '/put');
	req.get = (req.url == '/get');
	if (req.method != 'POST' || !(req.put || req.get)) {
		res.writeHead(405, 'Not Supported', {'Content-Type': 'application/json'});
		res.end('');
		serverlog(req.method + ' to ' + req.url);
		return;
	}

	var postdata = ''
	req.on('data', function(chunk) {
		postdata += chunk.toString();
	});
	req.on('end', function() {

		serverlog('Got ' + req.url + ' request: ' + postdata);
		var mongorequest = JSON.parse(postdata);

		db.open(function(err, db) {

			if (err) return serverError(res, err);

			var coll = db.collection(mongocollection);
			if (req.get) {
				coll.find(mongorequest).toArray(function(err, docs) {
					if (err) {
						serverError(res, err);
					} else {
						jsondocs = JSON.stringify(docs);
						successfulRequest(res, jsondocs, 'Query returned: ' + jsondocs);
					}
					db.close();
				});
			} else { // put
				var searchObj = {name:mongorequest.name, key:mongorequest.key}
				coll.update(searchObj, mongorequest, {upsert:true}, function(err, count) {
					if (err) {
						serverError(res, err);
					} else {
						if (count) {
							resdata = '{\"updated\":' + count + '}';
							resmsg = 'updated ' + count;
						} else {
							resdata = '{\"inserted\":true}';
							resmsg = 'inserted ' + JSON.stringify(mongorequest);
						}
						successfulRequest(res, resdata, resmsg);
					}
					db.close();
				});
			}
		});
	});
}).listen(listenport);

serverlog('Started http server on port ' + listenport);

