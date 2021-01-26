/*

// Enables double-click launching from the Mac Finder or Windows Explorer
#target photoshop

var getname = function() {
	var layerRef = app.activeDocument.layers;
	// var textItem = layerRef[0].textItem;
	var length = layerRef.length;
	var alertText = "";
	for(var i = 0 ; i < length ; i++ ) {
		var content = layerRef[i].kind;
		alertText += "key: "+i+" value:"+content + " \n";
	}

	alert(alertText);
};

// Loop to iterate through all layers
function recurseLayers(currLayers) {
	for ( var i = 0; i < currLayers.layers.length; i++ ) {
		layerRef = currLayers.layers[i];
		x = layerRef.bounds[0].value;
		y = layerRef.bounds[1].value;
		coords += layerRef.name + "," + x + "," + y + "\n";

		//test if it's a layer set
		if ( isLayerSet(currLayers.layers[i]) ) {
			recurseLayers(currLayers.layers[i]);
		}
	}
}

// Ask the user for the folder to export to
var FPath = Folder.selectDialog("Save exported coordinates to");

// Detect line feed type
if ( $.os.search(/windows/i) !== -1 ) {
	fileLineFeed = "Windows";
}
else {
	fileLineFeed = "Macintosh";
}

// Export to txt file
function writeFile(info) {
	try {
		var f = new File(FPath + "/" + docName + ".txt");
		f.remove();
		f.open('a');
		f.lineFeed = fileLineFeed;
		f.write(info);
		f.close();
	}
	catch(e){}
}

function goTextExport2(el, fileOut, path)
{
	// Get the layers
	var layers = el.layers;
	// Loop 'm
	for (var layerIndex = layers.length; layerIndex > 0; layerIndex--)
	{
		// curentLayer ref
		var currentLayer = layers[layerIndex-1];
		// currentLayer is a LayerSet
		if (currentLayer.typename == "LayerSet") {
			goTextExport2(currentLayer, fileOut, path + currentLayer.name + '/');
			// currentLayer is not a LayerSet
		} else {
			// Layer is visible and Text --> we can haz copy paste!
			if ( (currentLayer.visible) && (currentLayer.kind == LayerKind.TEXT) )
			{
				fileOut.writeln(separator);
				fileOut.writeln('');
				fileOut.writeln('LayerPath: ' + path);
				fileOut.writeln('LayerName: ' + currentLayer.name);
				fileOut.writeln('');
				fileOut.writeln('LayerContent:');
				fileOut.writeln(currentLayer.textItem.contents);
				fileOut.writeln('');
				// additional exports added by Max Glenister for font styles
				if(currentLayer.textItem.contents){
					fileOut.writeln('LayerStyles:');
					fileOut.writeln('* capitalization: '+(currentLayer.textItem.capitalization=="TextCase.NORMAL"?"normal":"uppercase"));
					fileOut.writeln('* color: #'+(currentLayer.textItem.color.rgb.hexValue?currentLayer.textItem.color.rgb.hexValue:''));
					fileOut.writeln('* fauxBold: '+(currentLayer.textItem.fauxBold?currentLayer.textItem.fauxBold:''));
					fileOut.writeln('* fauxItalic: '+(currentLayer.textItem.fauxItalic?currentLayer.textItem.fauxItalic:''));
					fileOut.writeln('* font: '+currentLayer.textItem.font);
					//fileOut.writeln('leading: '+(currentLayer.textItem.leading=='auto-leading'?'auto':currentLayer.textItem.leading));
					fileOut.writeln('* size: '+currentLayer.textItem.size);
					fileOut.writeln('* tracking: '+(currentLayer.textItem.fauxItalic?currentLayer.textItem.fauxItalic:''));
					fileOut.writeln('');
				}
			}
		}
	}
}

getname();*/
#target photoshop




