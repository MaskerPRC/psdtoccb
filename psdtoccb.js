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
var needPackagePlist = 1;
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
var plistPathes = []
var ccbFiles = [];
var originDocumentName = "";
var spriteSubfix = needPackagePlist?".plist":"";
var projectPos = "";
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
	// if(getIsFntLayer(layer)) {
	// 	return TypeLayerEnum.LAYER_IS_FONT;
	// }
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
		return 500-node.bounds[1].value;
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
var setPosition = function(node, layer) {
	var x = getLayerX(layer);
	var y = getLayerY(layer);
	node.x = x;
	node.y = y;
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
			case "":
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
			case "exp":
				nodeType = TypeNodeEnum.NODE_IS_EXCEPTION;
				break;
		}
	}
	//无前缀情况
	else {
		switch(layerType) {
			case TypeLayerEnum.LAYER_IS_NODE:
				nodeType = TypeNodeEnum.NODE_IS_ALL;
				break;
			case TypeLayerEnum.LAYER_IS_SP:
				nodeType = TypeNodeEnum.NODE_IS_SP;
				break;
			case TypeLayerEnum.LAYER_IS_FONT:
				nodeType = TypeNodeEnum.NODE_IS_FONT_LB_ALL_CHARS;
				break;
		}
	}
	return nodeType;
};
var removeInvisibleLayers = function(doc) {
	var nodeType = typeOfNode(doc);
	if(nodeType === TypeNodeEnum.NODE_IS_EXCEPTION) {
		doc.allLocked = false;
		doc.visible = false;
		return;
	}

	if(doc && doc.artLayers) {
		for (var i = doc.artLayers.length - 1; i >= 0; i--) {
			try {
				if (!doc.artLayers[i].visible) {
					doc.artLayers[i].remove();
				}
			} catch (e) {
			}
		}
	}
	if(doc && doc.layerSets) {
		for (var i = doc.layerSets.length - 1; i >= 0; i--) {
			removeInvisibleLayers(doc.layerSets[i]);
		}
	}
}
var invisibleLayers = function(doc){
	var nodeType = typeOfNode(doc);
	if(nodeType === TypeNodeEnum.NODE_IS_EXCEPTION) {
		doc.allLocked = false;
		doc.visible = false;
		return;
	}

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
			if(nodeType !== TypeNodeEnum.NODE_IS_EXCEPTION) {
				invisibleLayers(doc.layerSets[i]);
			}
		}
	}
}
var visibleLayers = function(doc){
	var nodeType = typeOfNode(doc);
	if(nodeType === TypeNodeEnum.NODE_IS_EXCEPTION) {
		doc.allLocked = false;
		doc.visible = false;
		return;
	}

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
			var nodeType = typeOfNode(doc.layerSets[i]);
			if(nodeType !== TypeNodeEnum.NODE_IS_EXCEPTION) {
				visibleLayers(doc.layerSets[i]);
			}
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
	if(needPackagePlist) {
		var sceneName = originDocumentName.name.substring(0, originDocumentName.name.indexOf("."));
		var exportFolder = new Folder(new Folder(originDocumentName.parent).fsName + "/" + sceneName);
		var thisFile  = new File($.fileName).parent;
		for (var index = 0; index < plistPathes.length; index++) {
			//调用脚本去打包，并删除原目录
			var path = plistPathes[index];

			// alert("python3 "+thisFile.fsName+"/plistPack.py "+exportFolder+"/"+ path+" "+thisFile.fsName)
			app.system("python3 "+thisFile.fsName+"/plistPack.py "+exportFolder+"/"+ path+" "+thisFile.fsName);
		}
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
		var filePath = ccb.referResourcePath1;
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

var findProject = function() {
	var projectPos = "";
	var self = new Folder(originDocumentName).fsName;
	var parent = new Folder(originDocumentName.parent).fsName;
	var parent1 = parent.slice(0, parent.lastIndexOf("/"));
	var parent2 = parent1.slice(0, parent1.lastIndexOf("/"));
	var parent3 = parent2.slice(0, parent2.lastIndexOf("/"));

	parent += "$";
	parent1 += "$";
	parent2 += "$";
	parent3 += "$";
	parent4 += "$";

	if(parent4.indexOf("Resources$") !== -1) {
		projectPos = self.slice(parent4.length, self.lastIndexOf("."));
	}
	if(parent3.indexOf("Resources$") !== -1) {
		projectPos = self.slice(parent3.length, self.lastIndexOf("."));
	}
	if(parent2.indexOf("Resources$") !== -1) {
		projectPos = self.slice(parent2.length, self.lastIndexOf("."));
	}
	if(parent1.indexOf("Resources$") !== -1) {
		projectPos = self.slice(parent1.length, self.lastIndexOf("."));
	}
	if(parent.indexOf("Resources$") !== -1) {
		projectPos = self.slice(parent.length, self.lastIndexOf("."));
	}

	return projectPos;
};

//工具区--end

//ps操作区--begin
var exportPng = function(spNode, isPlist, plistInfo) {
	if(!isPlist) {
		//直接导出到根节点
		// var name = plistInfo.name;
		// var prefix = plistInfo.prefix;
		// psExportTool(spNode, prefix+name);
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
				psExportTool(spNode, prefix+innerPlistName, plistPath);
				// alert(JSON.stringify(innerPlistName));
				// alert(JSON.stringify(innerPlistName));
				// alert(plistPath);
				//记录之后需要打包的字体目录
				break;
		}
	}
};
//ps操作区--end

//main区--begin
var forAllNode = function(curNode, ccbPlistName, resPrefixName, fatherNode) {
	resPrefixName = (resPrefixName!=="" ?resPrefixName+"_" : "");
	var nodeType = typeOfNode(curNode);
	//对当前节点进行处理，对于不同的类型，进行不同的处理，或直接导出，或存储到数据区最后导出
	curNode.visible = true;
	var node = null;

	var nodeLayerName = getLayerName(curNode);

	switch(nodeType) {
		case TypeNodeEnum.NODE_IS_EXCEPTION:
			break;
		case TypeNodeEnum.NODE_IS_NODE:
			//组：构建内部ccbNode结构，插入到数据区
			node = new CCB_CCNode();
			node.displayName = nodeLayerName;

			//遍历子节点
			for(var j=curNode && curNode.layers && curNode.layers.length-1; j>=0 ; j--) {
				forAllNode(curNode.layers[j], ccbPlistName, resPrefixName+nodeLayerName, node);
			}
			break;
		case TypeNodeEnum.NODE_IS_SP:
		case TypeNodeEnum.NODE_IS_ALL:
			//layer图片：
			//1、构建sp节点
			node = new CCB_CCSprite();
			node.displayName = nodeLayerName;
			setPosition(node, curNode);

			if(nodeType === TypeNodeEnum.NODE_IS_ALL) {
				visibleLayers(curNode);
			}

			//2、将 单张图片 或者 node集合图片 导出到所属ccbplist目录
			var plistPath = ccbPlistName;
			exportPng(curNode, !!plistPath, {name: plistPath, type: TypePlistEnum.PLIST_IS_SP, prefix: ccbPlistName+"_"+resPrefixName});
			node.referResourcePath = projectPos+"/"+ccbPlistName+spriteSubfix;
			node.referResourcePathName = ccbPlistName+"_"+resPrefixName + nodeLayerName + ".png";
			break;
		case TypeNodeEnum.NODE_IS_FONT_LB_NUM:
		case TypeNodeEnum.NODE_IS_FONT_LB_ALL_CHARS:
			//字体文件
			// 1、构建字体节点
			node = new CCB_CCLabelBMFont();
			node.displayName = nodeLayerName;
			// node.referResourcePath = "./"+ccbPlistName+spriteSubfix + "/" + ccbPlistName+"_"+resPrefixName + nodeLayerName + ".png";
			setPosition(node, curNode);

			var text = getIsFntLayer(curNode);
			if(text) {
				node.fntText = text;
			}

			// 2、导出字体文件
			break;
		case TypeNodeEnum.NODE_IS_BG_SP:
			//layer图片：
			//1、构建bg节点
			node = new CCB_CCSprite();
			node.displayName = nodeLayerName;

			if(nodeType === TypeNodeEnum.NODE_IS_ALL) {
				visibleLayers(curNode);
			}

			//2、bg图片不需要倒入到plist
			exportPng(curNode, false, {name: nodeLayerName, prefix: ccbPlistName+"_"+resPrefixName});
			node.referResourcePath = projectPos+"/" + ccbPlistName+"_"+resPrefixName + nodeLayerName + ".png";
			break;
		case TypeNodeEnum.NODE_IS_CCB:
			//子ccb

			//1、构建ccb节点
			node = new CCB_CCBNode();
			var fatherCcbName = ccbPlistName;

			node.displayName = nodeLayerName;

			//2、创建子ccb内部Plist目录
			var subCcbPlistName = fatherCcbName +"_" + nodeLayerName;
			//3、建立新的ccb初始节点
			var fileNode = new CCB_FileNode();
			var ccbFileName = fatherCcbName +"_" + nodeLayerName;
			fileNode.referResourcePath = projectPos+"/"+ccbFileName + ".ccb";
			fileNode.referResourcePath1 = ccbFileName + ".ccb";
			for(var i=curNode && curNode.layers && curNode.layers.length-1; i>=0 ; i--) {
				forAllNode(curNode.layers[i], subCcbPlistName, "", fileNode);
			}
			//4、记录file数组和plist文件夹数据
			ccbFiles.push(fileNode);
			node.referResourcePath = projectPos+"/"+fatherCcbName +"_"+ nodeLayerName + ".ccb";
			plistPathes.push(""+subCcbPlistName);
			break;
	}

	//如果有父节点，需要加入树结构，如果没有，说明还没有找到ccb节点
	if(fatherNode && node) {
		fatherNode.children.push(node);
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

	//构建fntPaths，plistPathes，ccbFiles
	var fileName = originDocumentName.name.slice(0, originDocumentName.name.indexOf("."));
	// alert(fileName);
	projectPos = findProject();

	forAllNode(rootLayer, fileName, "");

	//打包plist，fnt，ccb
	plistPackage();
	ccbPackage();

	//二期内容：加入fnt字体导出
	fntPackage();

	//将引用中的相对引用 './'改为ccb项目规范格式exp:'server/ui3/'
	// fixPackageReferance();

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