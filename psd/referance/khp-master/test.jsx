
var layer = app.activeDocument.artLayers[0];

var s = "";

for(var k in layer.textItem.color.rgb){
	s += k;
	s += "\n";
	// s = s + k + " : " + layer[k] + "\n";
}

alert(layer.textItem.color.rgb.red);
alert(layer.textItem.color.rgb.green);
alert(layer.textItem.color.rgb.blue);

alert(s);

// alert(s);