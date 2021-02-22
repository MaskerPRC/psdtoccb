/***
 * 我们把layer理解为psd中的组或者图层或者字体
 * 我们把node理解为中间对象
 */

//JS库--begin
#include "json2.js";
#include "ccb.js";
var debugFrom = 1;
var indexOf = function(one){
	for (var index = 0; index < fntPaths.length; index++) {
		if(one === fntPaths[index]) {
			return i;
		}
	}
	return -1;
};
//JS库--end

//配置区--begin
var gapChar = "@";
var fntRootPath = "./fnt/";
var plistRootPath = "./";
// var ccbNeedAttrMap = {
// 	map: {},
// 	build: function() {
// 		this.map[TypeNodeEnum.NODE_IS_NODE] = ["displayName", "x", "y", "visible", "width", "height", "anchorX", "anchorY", "scaleX", "scaleY", "rotation"];
// 		this.map[TypeNodeEnum.NODE_IS_SP] = this.map[TypeNodeEnum.NODE_IS_NODE];
// 		this.map[TypeNodeEnum.NODE_IS_FONT_LB_NUM] = this.map[TypeNodeEnum.NODE_IS_NODE];
// 		this.map[TypeNodeEnum.NODE_IS_FONT_SP] = this.map[TypeNodeEnum.NODE_IS_NODE];
// 		this.map[TypeNodeEnum.NODE_IS_BUTTON] = this.map[TypeNodeEnum.NODE_IS_NODE];
// 		this.map[TypeNodeEnum.NODE_IS_BG_SP] = this.map[TypeNodeEnum.NODE_IS_NODE];
// 		this.map[TypeNodeEnum.NODE_IS_ALL] = this.map[TypeNodeEnum.NODE_IS_NODE];
// 		this.map[TypeNodeEnum.NODE_IS_FONT_LB_ALL_CHARS] = this.map[TypeNodeEnum.NODE_IS_NODE];
// 	}
// };
//
// var CCB_NEED_ATTR_MAP = ccbNeedAttrMap.build();
//配置区--end

//数据区--begin
var fntPaths = [];
fntPaths.indexOf = indexOf;
var plistPaths = [];
plistPaths.indexOf = indexOf;
var ccbFiles = [];
ccbFiles.indexOf = indexOf;
var originDocumentName = "";
//数据区--end

//工具区--begin
var getLayerName = function(layer) {
	var name = layer.name;
	var find = name.indexOf(gapChar);
	//有前缀的情况
	var layerName = name;
	if(find !== -1) {
		layerName = name.slice(find+1, name.length);
	}
	layerName = replaceSpace(layerName);
	return layerName;
};
var getLayerType = function(layer) {
	if (layer.layers && layer.layers.length > 0) {
		return TypeLayerEnum.LAYER_IS_NODE;
	}
	else {
		return TypeLayerEnum.LAYER_IS_SP;
	}
};
var getLayerX = function(node, fatherNode) {
	if(!fatherNode) {
		return node.bounds[0].value;
	} else {
		return node.bounds[0].value - getLayerX(fatherNode);
	}
};
var getLayerY = function(node, fatherNode) {
	if(!fatherNode) {
		return 200-node.bounds[1].value;
	} else {
		return 200-node.bounds[1].value - getLayerY(fatherNode);
	}
};
var getLayerWidth = function(node) {

};
var getLayerHeight = function(node) {

};
var getIsFntLayer = function(node) {
	if(node.textItem && node.textItem.contents) {
		return node.textItem.contents;
	}
	return null;
};
var typeOfNode = function(node) {
	var name = node.name;
	var layerType = getLayerType(node);
	var find = name.indexOf(gapChar);
	//有前缀的情况
	var nodeType = TypeNodeEnum.NODE_IS_NONE;
	if(find !== -1) {
		var prefix = name.slice(0, find);
		switch(prefix) {
			case "all":
				nodeType = TypeNodeEnum.NODE_IS_ALL;
				break;
			case "bg":
				nodeType = TypeNodeEnum.NODE_IS_BG_SP;
				break;
			case "ccb":
				nodeType = TypeNodeEnum.NODE_IS_CCB;
				break;
			case "btn":
				nodeType = TypeNodeEnum.NODE_IS_BUTTON;
				break;
			case "en":
				nodeType = TypeNodeEnum.NODE_IS_BUTTON_EN;
				break;
			case "dis":
				nodeType = TypeNodeEnum.NODE_IS_BUTTON_DIS;
				break;
			case "sel":
				nodeType = TypeNodeEnum.NODE_IS_BUTTON_SEL;
				break;
			case "fspNum":
				nodeType = TypeNodeEnum.NODE_IS_FONT_LB_NUM;
				break;
			case "fspAll":
				nodeType = TypeNodeEnum.NODE_IS_FONT_LB_ALL_CHARS;
				break;
			case "flb":
				nodeType = TypeNodeEnum.NODE_IS_FONT_LB;
				break;
		}
	}
	//无前缀情况
	else {
		switch(layerType) {
			case TypeLayerEnum.LAYER_IS_NODE:
				nodeType = TypeNodeEnum.NODE_IS_NODE;
				break;
			case TypeLayerEnum.LAYER_IS_SP:
				nodeType = TypeNodeEnum.NODE_IS_SP;
				break;
		}
	}
	return nodeType;
};
var removeInvisibleLayers = function(doc) {
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
var invisibleLayers = function(doc){
	if(doc && doc.artLayers) {
		for (var i = doc.artLayers.length - 1; i >= 0; i--) {
			doc.artLayers[i].allLocked = false;
			doc.artLayers[i].visible = false;
		}
	}
	if(doc && doc.layerSets) {
		for (var i = doc.layerSets.length - 1; i >= 0; i--) {
			doc.layerSets[i].allLocked = false;
			doc.layerSets[i].visible = false;
			invisibleLayers(doc.layerSets[i]);
		}
	}
}
var visibleLayers = function(doc){
	if(doc && doc.artLayers) {
		for(var i=doc.artLayers.length-1;i>=0;i--) {
			doc.artLayers[i].allLocked = true;
			doc.artLayers[i].visible = true;
		}
	}
	if(doc && doc.layerSets) {
		for (var i = doc.layerSets.length - 1; i >= 0; i--) {
			doc.layerSets[i].allLocked = true;
			doc.layerSets[i].visible = true;
			visibleLayers(doc.layerSets[i]);
		}
	}
}
var checkSpIsBg = function(node) {
	return false;
};
var checkFntExists = function(path) {
	if(fntPaths.indexOf(path) !== -1 ) {
		return true;
	}
	return false;
}
var dupLayers = function() {
	var desc143 = new ActionDescriptor();
	var ref73 = new ActionReference();
	ref73.putClass( charIDToTypeID('Dcmn') );
	desc143.putReference( charIDToTypeID('null'), ref73 );
	desc143.putString( charIDToTypeID('Nm  '), activeDocument.activeLayer.name );
	var ref74 = new ActionReference();
	ref74.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
	desc143.putReference( charIDToTypeID('Usng'), ref74 );
	executeAction( charIDToTypeID('Mk  '), desc143, DialogModes.NO );
};
var psExportTool = function(node, name, path) {
	//导出png到某个目录
	var sceneName = originDocumentName.name.substring(0, originDocumentName.name.indexOf("."));
	var exportFolder = new Folder(new Folder(originDocumentName.parent).fsName + "/" + sceneName);
	if(!exportFolder.exists) {
		exportFolder.create();
	}
	var plistFolder = new Folder(exportFolder +"/"+path);
	if(!plistFolder.exists) {
		plistFolder.create();
	}
	dupLayers();
	app.activeDocument.trim(TrimType.TRANSPARENT);
	app.activeDocument.saveAs(new File(exportFolder +"/"+path+"/"+name), new PNGSaveOptions(), true, Extension.LOWERCASE);
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
};
var psBuildAllFnt = function(node, path) {
	//导出所有字体到某个目录
	var type = typeOfNode(node);
	//导出所有数字字体
	if(type === TypeNodeEnum.NODE_IS_FONT_SP_NUM) {

	}
	//导出所有字体
	else if(type === TypeNodeEnum.NODE_IS_FONT_SP_ALL_CHARS) {

	}
};
var getIsVisibleLayer = function(node) {
	return !!node.visible;
};
var replaceSpace = function(name) {
	return name.replace(/[:\/\\*\?\"\<\>\| ]/g, "_")
};
//打包plist
var plistPackage = function() {
	for (var index = 0; index < plistPaths.length; index++) {
		//调用脚本去打包，并删除原目录
		app.system("python ");
	}
};
//打包fnt
var fntPackage = function() {
	for (var index = 0; index < fntPaths.length; index++) {
		//调用脚本去打包，并删除原目录
	}
};
var ccbPackage = function() {
	//根据nodeTreeForCCBs对象来生成ccb文件
	// alert(ccbFiles);
	for (var index = 0; index < ccbFiles.length; index++) {
		var ccb = ccbFiles[index];
		var ccbFileContent = ccb.buildXmlNode();
		var filePath = ccb.referResourcePath;
		//将内容写出到文档
		var sceneName = originDocumentName.name.substring(0, originDocumentName.name.indexOf("."));
		var exportFolder = new Folder(new Folder(originDocumentName.parent).fsName + "/" + sceneName);
		if(!exportFolder.exists) {
			exportFolder.create();
		}
		// alert(filePath);
		var file = new File(exportFolder+"/"+filePath);
		file.remove();
		file.open("w", "TEXT");
		file.lineFeed = "\n";
		file.write(ccbFileContent);
		file.close();
	}
};
//工具区--end

//ps操作区--begin
var exportPng = function(spNode, isPlist, plistInfo) {
	if(!isPlist) {
		//直接导出到根节点
	}
	//需要导入到plist或者fnt
	else {
		var plistType = plistInfo.type;
		switch (plistType) {
			case TypePlistEnum.PLIST_IS_FNT:
				//导出图片到某个fnt子目录
				var fntName = getLayerName(spNode);
				var fntPath = fntRootPath + fntName;
				//检查此字体是否已经导出过了
				if(checkFntExists(fntPath)) {
					return;
				}
				psBuildAllFnt(spNode, fntPath);
				//记录之后需要打包的字体目录
				fntPaths.push(fntPath);
				break;
			case TypePlistEnum.PLIST_IS_SP:
				//检测不是bg，根据大小或者其他等等
				if(checkSpIsBg(spNode)) {
					exportPng(spNode, false);
					break;
				}
				//导出图片到某个plist目录
				var innerPlistName = getLayerName(spNode);
				var plistName = plistInfo.name;
				var prefix = plistInfo.prefix;
				var plistPath = plistName;
				// alert(plistName)
				psExportTool(spNode, prefix+innerPlistName, plistPath);
				// alert(JSON.stringify(innerPlistName));
				// alert(JSON.stringify(innerPlistName));
				// alert(plistPath);
				//记录之后需要打包的字体目录
				if(plistPaths.indexOf(plistPath) !== -1 ) {
					plistPaths.push(plistPath);
				}
				break;
		}
	}
};
//ps操作区--end

//main区--begin
var forAllNode = function(curNode, belongCcbName, prefix, fatherNode) {
	prefix = (prefix!=="" ?prefix+"_" : "");
	var nodeType = typeOfNode(curNode);
	//对当前节点进行处理，对于不同的类型，进行不同的处理，或直接导出，或存储到数据区最后导出
	curNode.visible = true;
	switch(nodeType) {
		case TypeNodeEnum.NODE_IS_NODE:
			//组：构建内部ccbNode结构，插入到数据区
			var node = new CCB_CCNode();
			var nodeLayerName = getLayerName(curNode);
			node.displayName = nodeLayerName;

			//如果有父节点，需要加入树结构，如果没有，说明还没有找到ccb节点
			if(fatherNode) {
				fatherNode.children.push(node);
			}

			//遍历子节点

			for(var j=curNode && curNode.layers && curNode.layers.length-1; j>=0 ; j--) {
				forAllNode(curNode.layers[j], belongCcbName, prefix+nodeLayerName, node);
			}

			break;
		case TypeNodeEnum.NODE_IS_SP:
		case TypeNodeEnum.NODE_IS_BG_SP:
			//layer图片：
			//1、构建sp节点
			var node = new CCB_CCSprite();
			var spLayerName = getLayerName(curNode);
			node.displayName = spLayerName;
			node.referResourcePath = "./"+belongCcbName + "/" + prefix + spLayerName + ".png";
			var x = getLayerX(curNode);
			var y = getLayerY(curNode);
			node.x = x;
			node.y = y;

			if(fatherNode) {
				fatherNode.children.push(node);
			}

			//2、将图片导出到所属ccbplist目录
			var plistPath = belongCcbName;
			exportPng(curNode, !!plistPath, {name: plistPath, type: TypePlistEnum.PLIST_IS_SP, prefix: prefix});

			break;
		case TypeNodeEnum.NODE_IS_CCB:
			//子ccb

			//1、构建ccb节点
			var node = new CCB_CCBNode();
			var fatherCcbName = belongCcbName;
			var ccbLayerName = getLayerName(curNode);
			node.displayName = ccbLayerName;
			node.referResourcePath = "./"+fatherCcbName+prefix+ ccbLayerName + ".ccb";

			if(fatherNode) {
				fatherNode.children.push(node);
			}

			//2、创建子ccb内部Plist目录
			var folder = new Folder(fatherCcbName +"_"+ ccbLayerName);
			if(folder.exists) {
				var files = folder.getFiles();
				for(var i=files.length-1;i>=0;i--){
					files[i].remove();
				}
				folder.remove();
			}
			new Folder(folder).create();

			//3、建立新的ccb初始节点
			var fileNode = new CCB_FileNode();
			fileNode.referResourcePath = (fatherCcbName!==""?fatherCcbName +"_":"")+ ccbLayerName + ".ccb";
			for(var i=curNode && curNode.layers && curNode.layers.length-1; i>=0 ; i--) {
				forAllNode(curNode.layers[i], fatherCcbName +"_"+ ccbLayerName, "", fileNode);
			}
			//4、记录file数组和plist文件夹数据
			ccbFiles.push(fileNode);
			plistPaths.push(folder);
			break;
		case TypeNodeEnum.NODE_IS_ALL:
			//集合
			//layer图片：
			//1、构建sp节点
			var node = new CCB_CCSprite();
			var spLayerName = getLayerName(curNode);
			node.displayName = spLayerName;
			node.referResourcePath = "./"+belongCcbName + "/" + prefix+spLayerName + ".png";
			var x = getLayerX(curNode);
			var y = getLayerY(curNode);
			node.x = x;
			node.y = y;

			if(fatherNode) {
				fatherNode.children.push(node);
			}
			visibleLayers(curNode);

			//2、将图片导出到所属ccbplist目录
			var plistPath = belongCcbName;
			exportPng(curNode, !!plistPath, {name: plistPath, type: TypePlistEnum.PLIST_IS_SP, prefix: prefix});

			break;
	}
	curNode.visible = false;
};

var main = function() {
	var originDocument = app.activeDocument;
	originDocumentName = originDocument.fullName;
	var tempDocument = originDocument.duplicate();
	app.activeDocument = tempDocument;

	removeInvisibleLayers(tempDocument);
	invisibleLayers(tempDocument);
	var rootLayer = app.activeDocument.activeLayer;

	//构建fntPaths，plistPaths，ccbFiles
	var fileName = originDocumentName.name.slice(0, originDocumentName.name.indexOf("."));
	// alert(fileName);

	forAllNode(rootLayer, fileName, "");

	//打包plist，fnt，ccb
	plistPackage();
	fntPackage();
	ccbPackage();

	//over
	tempDocument.close(SaveOptions.DONOTSAVECHANGES);
	app.activeDocument = originDocument;
};

var test = function() {
	var ccbNode = new CCB_FileNode();
	var rootNode = new CCB_RootNode();
	var node = new CCB_CCNode();
	var node1 = new CCB_CCNode();
	var node2 = new CCB_CCNode();
	var node3 = new CCB_CCNode();
	ccbNode.children.push(node);
	ccbNode.children.push(node1);
	ccbNode.children.push(node2);
	ccbNode.children.push(node3);

	ccbFiles.push(ccbNode);

	ccbPackage();
};
// try {
main();
// }catch(e) {
// 	alert(JSON.stringify(e));
// }
//main区--end