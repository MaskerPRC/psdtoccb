#include "json2.js";

var main = function() {
	for (var key in app) {
		try{
			alert(JSON.stringify(key));
			alert(JSON.stringify(app[key]));
		} catch(e) {
			continue;
		}
	}
}
main();