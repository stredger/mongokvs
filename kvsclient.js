
/* Creates and returns an object to do cross domain ajax requests
 * method: either 'GET' or 'POST'
 * url: url to make request to 
 * async: true for asynchronous, false for sync
 * returns an XMLHttpRequest object (or IE equiv)
 * or throws an error if we cant do cross domain ajax
 */
function createCORSRequest(method, url, async) {

	var corsreq = new XMLHttpRequest();
	if ('withCredentials' in corsreq) {
		corsreq.open(method, url, async);
	} else if (typeof XDomainRequest != 'undefined') {
		// this is for IE
		corsreq = new XDomainRequest();
		corsreq.open(method, url, async);
	} else {
		// we cant do cross domain ajax!
		throw new Error('CORS not supported, try another browser!');
	}
	return corsreq;
}

/* kvs object 
 * name: a string that along with a key is used 
 * in database queries. The name acts like a
 * namespace, so the same key can exist in two
 * different namespaces. Consequently the same
 * name must be used to access the same data.
 */
var kvs = function(name) {
	this.name = name;
	this.server = 'grack04.uvic.trans-cloud.net:64444';
	this.geturl = 'http://' + this.server + '/get';
	this.puturl = 'http://' + this.server + '/put';

	/* Get a value at a given key by performing a  
	 * synchronous ajax call to the kvs server
	 * key: the key to query
	 * returns the value stored or null
	 * throws an error if the ajax request fails
	 */
	this.get = function(key) {
		var ajaxreq = createCORSRequest('POST', this.geturl, false);
		var retval;
		ajaxreq.onload = function() {
			var retobj = JSON.parse(ajaxreq.responseText);
			retval = (retobj) ? retobj.value : null;
		}
		ajaxreq.onerror = function() {
			throw new Error('Ajax error: Failed to get data from server');
		}
		ajaxreq.ontimeout = function() {
			throw new Error('Ajax error: timeout connecting to server');
		}
		var getobj = {};
		console.log();
		getobj.name = this.name;
		getobj.key = key;
		ajaxreq.send(JSON.stringify(getobj));
		return retval;
	}

	/* Put a given value at a given key by performing a
	 * synchronous ajax call to the kvs server
	 * key: key to store value at
	 * val: value to store, can be any javascript object/value
	 * returns true if the store succeeds
	 * throws an error if the ajax call fails
	 */
	this.put = function(key, val) {
		var ajaxreq = createCORSRequest('POST', this.puturl, false);
		var retval;
		ajaxreq.onload = function() {
			var retobj = JSON.parse(ajaxreq.responseText);
			retval = (retobj) ? retobj.inserted : false;
		}
		ajaxreq.onerror = function() {
			throw new Error('Ajax error: Failed to get data from server');
		}
		ajaxreq.ontimeout = function() {
			throw new Error('Ajax error: timeout connecting to server');
		}
		var putobj = {};
		putobj.name = this.name;
		putobj.key = key;
		putobj.value = val;
		ajaxreq.send(JSON.stringify(putobj));
		return retval;
	}
}