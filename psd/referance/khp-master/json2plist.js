// To Do: Figure out safe solution for binary data.

// Convert a JSON variable to plist
function json2plist (obj){
	var returnData = '';
	returnData += '<?xml version="1.0" encoding="UTF-8"?>';
	returnData += '\n';
	returnData += '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">';
	returnData += '\n';
	returnData += '<plist version="1.0">';
	returnData += '\n';
	returnData += '<dict>';
	returnData += recurse(obj);
	returnData += '\n';
	returnData += '</plist>';
	return returnData;
}

// Recurse through an array or object to make a plist
function recurse(json, tabNum){
	var returnData = '';
	// Tab number to count how many tabs we indent
	if(!tabNum){
		tabNum = 0;
	}
	if (typeof json == typeof [0] && (json instanceof Array) ){
		// Our JSON object is an array
		var fin = '</array>';
		// Loop through our array
		for (var i = 0; i < json.length; i++){
			returnData += magicHat(json[i],i,tabNum,true);
		}
	}
	else{
		// Our JSON object is not array
		var fin = '</dict>';
		// Loop through our object
		for (var i in json){
			returnData += magicHat(json[i],i,tabNum,false);
		}
	}
	// Tab out
	returnData += tabular(tabNum-1);
	// End the block
	returnData += fin;
	return returnData;
}

// Convert to plist
function magicHat(rabbit,i,tabNum,inArray){
	var returnData = '';
	if (typeof rabbit == typeof [0] && (rabbit instanceof Array)){
		// ARRAY
		returnData += tabular(tabNum);
		if(!inArray){
			returnData += '<key>' + i + '</key>';
			returnData += tabular(tabNum);
		}
		returnData += '<array>';
		returnData += recurse(rabbit,tabNum+1,true);
	}
	else if (typeof rabbit == typeof {}){
		// OBJECT OR DICT
		returnData += tabular(tabNum);
		if(!inArray){
			returnData += '<key>' + i + '</key>';
			returnData += tabular(tabNum);
		}
		returnData += '<dict>';
		returnData += recurse(rabbit,tabNum+1);
	}
	
	else if (typeof rabbit == typeof ''){
		// STRING
		returnData += tabular(tabNum);
		if(!inArray){
			returnData += '<key>' + i + '</key>';
			returnData += tabular(tabNum);
		}
		returnData += '<string>' + rabbit + '</string>';
	}
	// else if (isBinary(rabbit)){
	// 	// BINARY
	// 	returnData += tabular(tabNum);
	// 	if(!inArray){
	// 		returnData += '<key>' + i + '</key>';
	// 		returnData += tabular(tabNum);
	// 	}
	// 	// returnData += '<data>' + rabbit + '</data>';
	// 	returnData += '<real>' + rabbit + '</real>';
	// }
	else if (isFloat(rabbit)){
		// FLOAT
		returnData += tabular(tabNum);
		if(!inArray){
			returnData += '<key>' + i + '</key>';
			returnData += tabular(tabNum);
		}
		returnData += '<real>' + rabbit + '</real>';
	}
	else if (typeof rabbit == typeof 1){
		// INTEGER
		returnData += tabular(tabNum);
		if(!inArray){
			returnData += '<key>' + i + '</key>';
			returnData += tabular(tabNum);
		}
		returnData += '<integer>' + rabbit + '</integer>';
	}
	else if (typeof rabbit == typeof true){
		// BOOLEAN
		returnData += tabular(tabNum);
		if(!inArray){
			returnData += '<key>' + i + '</key>';
			returnData += tabular(tabNum);
		}
		returnData += '<'+rabbit+'/>';
	}
	return returnData;
}

// Tabs & new lines
function tabular(num){
	var returnData = '\n'
	for (var ii = 0; ii < num +1 ; ii++){
		returnData += '\t';
	}
	return returnData;
}

// Returns true if floating int
function isFloat(num){
	if (typeof num == typeof 1){
		var numStr = num+'';
		if (numStr.indexOf('.') != -1){
			return true;
		}
	}
	return false;
}

// Returns true if binary number
function isBinary(num){
	if (typeof num == typeof 1){
		aNum = parseInt(num,2);
		return /^[01]+$/.test(aNum);
	}
	return false;
}