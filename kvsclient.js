

function createCORSRequest(method, url, sync) {

	var corsreq = new XMLHttpRequest();
	if ('withCredentials' in corsreq) {
		corsreq.open(method, url, sync);
	} else if (typeof XDomainRequest != 'undefined') {
		// this is for IE
		corsreq = new XDomainRequest();
		corsreq.open(method, url, sync);
	} else {
		// we cant do cross domain ajax!
		throw new Error('CORS not supported, try another browser!');
	}
	return corsreq;
}


var kvs = function(name) {
	this.name = name;
	this.server = 'grack04.uvic.trans-cloud.net:64444';
	this.geturl = 'http://' + this.server + '/get';
	this.puturl = 'http://' + this.server + '/put';

	this.get = function(key) {
		var ajaxreq = createCORSRequest('POST', this.geturl, false);
		var val;
		ajaxreq.onload = function() {
			var retobj = JSON.parse(ajaxreq.responseText);
			val = (retobj) ? retobj.value : null;
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
		return val;
	}

	this.put = function(key, val) {
		var ajaxreq = createCORSRequest('POST', this.puturl, false);
		var val;
		ajaxreq.onload = function() {
			var retobj = JSON.parse(ajaxreq.responseText);
			val = (retobj) ? retobj.inserted : false;
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
		return val;
	}
}