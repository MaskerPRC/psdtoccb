
#include "json2.js";
#include "json2plist.js";
#include "ccb.js";

transparency = true;
interlaced = false;
trim = true;

pathSplit = "\\";

imagePath = "assets";

//
originDocument = app.activeDocument;
originDocumentName = originDocument.fullName.name;
sceneName = originDocumentName.substring(0, originDocumentName.indexOf("."));
exportFolder = new Folder(new Folder(originDocument.fullName.parent).fsName + pathSplit + sceneName);
exprotPath = exportFolder.fsName;
imageFolder = new Folder(exprotPath + pathSplit + imagePath);
if(exportFolder.exists){
	if(imageFolder.exists){
		var files = imageFolder.getFiles();
		for(var i=files.length-1;i>=0;i--){
			files[i].remove();
		}
		imageFolder.remove();
	}

	var files = exportFolder.getFiles();
	for(var i=files.length-1;i>=0;i--){
		files[i].remove();
	}
	exportFolder.remove();
}
new Folder(exportFolder).create();
new Folder(imageFolder).create();

//
nodeStack = [];
transX = 0;
transY = 0;

try{
	tempDocument = originDocument.duplicate();
	app.activeDocument = tempDocument;

	removeInvisibleLayers(tempDocument);
	invisibleLayers(tempDocument);

	var ccbFile = new CCBFile();

	nodeStack.push(ccbFile.nodeGraph);
	mainExportLoop(tempDocument);

	saveFile(sceneName + ".ccb",json2plist(ccbFile.generateCCB()));

	tempDocument.close(SaveOptions.DONOTSAVECHANGES);
	alert("Done");
}catch(e){
	tempDocument.close(SaveOptions.DONOTSAVECHANGES);
	alert("Error! \nLine : " + e.line + "\nMsg : " + e.message);
}finally{
}


function mainExportLoop(node){
	for(var i=node.artLayers.length-1;i>=0;i--) {
		exportArtLayer(node.artLayers[i]);
	}
	for(var i=node.layerSets.length-1;i>=0;i--) {
		exportLayerSet(node.layerSets[i]);
	}
}

function exportArtLayer(layer){

	var parent = nodeStack[nodeStack.length-1];

	var arr = splitString(layer.name," ");
	var nodeType = arr[0];
	var imgName = arr[1];

	var node = null;
	var saveToPng = false;

	switch(nodeType){
		case "node":
			node = new CCNode();
		case "layer":
			node = new CCLayer();
			node.width = getNodeWidth(layer);
			node.height = getNodeHeight(layer);
			break;
		case "sprite":
			node = new CCSprite();
			node.displayFrame = imgName + ".png";
			saveToPng = true;
			break;
		case "label":
			node = new CCLabelTTF();
			node.text = layer.textItem.contents;
			node.fontName = layer.textItem.font;
			node.fontSize = layer.textItem.size.as("px");
			node.r = layer.textItem.color.rgb.red;
			node.g = layer.textItem.color.rgb.green;
			node.b = layer.textItem.color.rgb.blue;
			break;
		default:
			throw new Error("unexpected nodeType : " + nodeType);
	}

	node.x = getNodeX(layer);
	node.y = getNodeY(layer);
	node.width = getNodeWidth(layer);
	node.height = getNodeHeight(layer);

	node.x -= transX;
	node.y -= transY;

	node.parseAttr(arr);
	parent.addChild(node);

	if(saveToPng){
		layer.visible = true;
		app.activeDocument.activeLayer = layer;
		saveCurrentContentToPng(imgName,node.width,node.height);
		layer.visible = false;
	}
}

function exportLayerSet(layerSet){
	var parent = nodeStack[nodeStack.length-1];

	var arr = splitString(layerSet.name," ");
	var nodeType = arr[0];
	var imgName = arr[1];

	var node = null;
	var saveToPng = false;

	switch(nodeType){
		case "node":
			node = new CCNode();
		case "layer":
			node = new CCLayer();
			break;
		case "sprite":
			node = new CCSprite();
			node.displayFrame = imgName + ".png";
			saveToPng = true;
			break;
		default:
			throw new Error("unexpected nodeType : " + nodeType);
	}

	node.x = getNodeX(layerSet);
	node.y = getNodeY(layerSet);
	node.width = getNodeWidth(layerSet);
	node.height = getNodeHeight(layerSet);
	parent.addChild(node);

	if(saveToPng){
		var nodeTop = 9999;
		var nodeBottom = 0;
		var nodeLeft = 9999;
		var nodeRight = 0;
		for(var i=layerSet.artLayers.length-1;i>=0;i--) {
			if(layerSet.artLayers[i].name == "__content"){
				layerSet.artLayers[i].visible = true;
				if(layerSet.artLayers[i].bounds[0].as("px") < nodeLeft){
					nodeLeft = layerSet.artLayers[i].bounds[0].as("px")
				}
				if(layerSet.artLayers[i].bounds[1].as("px") < nodeTop){
					nodeTop = layerSet.artLayers[i].bounds[1].as("px")
				}
				if(layerSet.artLayers[i].bounds[2].as("px") > nodeRight){
					nodeRight = layerSet.artLayers[i].bounds[2].as("px")
				}
				if(layerSet.artLayers[i].bounds[3].as("px") > nodeBottom){
					nodeBottom = layerSet.artLayers[i].bounds[3].as("px")
				}
			}
		}
		node.width = nodeRight - nodeLeft;
		node.height = nodeBottom - nodeTop;
		node.x = nodeLeft + node.width/2;
		node.y = originDocument.height.as("px") - nodeTop - node.height/2;

		layerSet.visible = true;
		app.activeDocument.activeLayer = layerSet;
		saveCurrentContentToPng(imgName,node.width,node.height);
		for(var i=layerSet.artLayers.length-1;i>=0;i--) {
			layerSet.artLayers[i].visible = false;
		}
	}else{
		node.x = 0;
		node.y = 0;
		node.width = 0;
		node.height = 0;
	}
	node.x -= transX;
	node.y -= transY;

	node.parseAttr(arr);

	nodeStack.push(node);
	transX += (node.x - node.width/2);
	transY += (node.y - node.height/2);

	for(var i=layerSet.artLayers.length-1;i>=0;i--) {
		if(layerSet.artLayers[i].name != "__content"){
			exportArtLayer(layerSet.artLayers[i]);
		}
	}
	for(var i=layerSet.layerSets.length-1;i>=0;i--) {
		exportLayerSet(layerSet.layerSets[i]);
	}

	layerSet.visible = false;

	nodeStack.pop();
	transX -= (node.x - node.width/2);
	transY -= (node.y - node.height/2);
}

//
function getNodeX(node){
	var left = node.bounds[0].as("px");
	if(left < 0){
		left = 0;		
	}
	return left + getNodeWidth(node)/2;
	// return node.bounds[0].as("px");
}

function getNodeY(node){
	var top = node.bounds[1].as("px");
	if(top < 0){
		top = 0;		
	}
	return originDocument.height.as("px") - top  - getNodeHeight(node)/2;
	// return originDocument.height.as("px") - node.bounds[1].as("px");
}

function getNodeWidth(node){
	var left = node.bounds[0].as("px");
	var right = node.bounds[2].as("px");
	if(left < 0){
		left = 0;		
	}
	if(right > originDocument.width.as("px")){
		right = originDocument.width.as("px");		
	}
    return right - left;
}

function getNodeHeight(node){
	var top = node.bounds[1].as("px");
	var bottom = node.bounds[3].as("px");
	if(top < 0){
		top = 0;		
	}
	if(bottom > originDocument.height.as("px")){
		bottom = originDocument.height.as("px");
	}
    return bottom - top;
}

function removeInvisibleLayers(doc) {
  for(var i=doc.artLayers.length-1;i>=0;i--) {
    try {
      if(!doc.artLayers[i].visible) {
        doc.artLayers[i].remove();
      }
    } 
    catch (e) {
    }
  }
  for(var i=doc.layerSets.length-1;i>=0;i--) {
    removeInvisibleLayers(doc.layerSets[i]);
  }
}

function invisibleLayers(doc){
	for(var i=doc.artLayers.length-1;i>=0;i--) {
	    doc.artLayers[i].allLocked = false;
	    doc.artLayers[i].visible = false;
	  }
	for(var i=doc.layerSets.length-1;i>=0;i--) {
	    doc.layerSets[i].allLocked = false;
	    doc.layerSets[i].visible = false;
		invisibleLayers(doc.layerSets[i]);
	}
}

//

function saveFile(name,content){
	if ($.os.search(/windows/i) != -1) {
		fileLineFeed = "Windows";
	} else {
		fileLineFeed = "Macintosh";
	}
	
	var outFile = new File(exprotPath+pathSplit+name);
	outFile.lineFeed = fileLineFeed;
	outFile.open("w", "TEXT", "????");
	outFile.write(content);
	outFile.close();
}

function saveCurrentContentToPng(imgName,width,height){
	var outFile = new File(exprotPath + pathSplit + imagePath + pathSplit + imgName + ".png");
	if(outFile.exists){
		return;
	}

	var temp = app.activeDocument.duplicate();
	removeInvisibleLayers(temp);
	app.activeDocument.trim(TrimType.TRANSPARENT);

	var id6 = charIDToTypeID( "Expr" );
	var desc3 = new ActionDescriptor();
	var id7 = charIDToTypeID( "Usng" );
	var desc4 = new ActionDescriptor();
	var id8 = charIDToTypeID( "Op  " );
	var id9 = charIDToTypeID( "SWOp" );
	var id10 = charIDToTypeID( "OpSa" );
	desc4.putEnumerated( id8, id9, id10 );
	var id11 = charIDToTypeID( "Fmt " );
	var id12 = charIDToTypeID( "IRFm" );
	var id13 = charIDToTypeID( "PN24" );
	desc4.putEnumerated( id11, id12, id13 );
	var id14 = charIDToTypeID( "Intr" );
	desc4.putBoolean( id14, interlaced );
	var id15 = charIDToTypeID( "Trns" );
	desc4.putBoolean( id15, transparency );
	var id16 = charIDToTypeID( "Mtt " );
	desc4.putBoolean( id16, true );
	var id17 = charIDToTypeID( "MttR" );
	desc4.putInteger( id17, 255 );
	var id18 = charIDToTypeID( "MttG" );
	desc4.putInteger( id18, 255 );
	var id19 = charIDToTypeID( "MttB" );
	desc4.putInteger( id19, 255 );
	var id20 = charIDToTypeID( "SHTM" );
	desc4.putBoolean( id20, false );
	var id21 = charIDToTypeID( "SImg" );
	desc4.putBoolean( id21, true );
	var id22 = charIDToTypeID( "SSSO" );
	desc4.putBoolean( id22, false );
	var id23 = charIDToTypeID( "SSLt" );
	var list1 = new ActionList();
	desc4.putList( id23, list1 );
	var id24 = charIDToTypeID( "DIDr" );
	desc4.putBoolean( id24, false );
	var id25 = charIDToTypeID( "In  " );
	desc4.putPath( id25, outFile);
	var id26 = stringIDToTypeID( "SaveForWeb" );
	desc3.putObject( id7, id26, desc4 );
	executeAction( id6, desc3, DialogModes.NO );

	temp.close(SaveOptions.DONOTSAVECHANGES);
	app.activeDocument = tempDocument;
}

