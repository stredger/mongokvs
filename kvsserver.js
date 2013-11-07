
var MongoServer = require('mongodb').Server;
var MongoDb = require('mongodb').Db;
var assert = require('assert');

var database = 'csc130'
var serverloc = 'grack04.uvic.trans-cloud.net'
var serverport = 27017
var collection = 'kvs' 

var db = new MongoDb(database, new MongoServer(serverloc, serverport), {w:-1});
db.open(function(err, db) {
	assert.equal(null, err);
	db.collection(collection).findOne({},function(err, doc) {
		console.log(doc);
		db.close();
	});
});