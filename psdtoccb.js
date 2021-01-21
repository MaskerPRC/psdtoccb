/***
 * 我们把layer理解为psd中的组或者图层或者字体
 * 我们把node理解为中间对象
 * @param node
 * @returns {string}
 */

//类型定义--begin
var TypeLayerEnum = {
	LAYER_IS_SP : 1,
	LAYER_IS_NODE: 2,
	LAYER_IS_FONT: 3,
};
var TypeNodeEnum = {
	NODE_IS_SP : 1,
	NODE_IS_NODE: 2,
	NODE_IS_FONT_SP: 3,
	NODE_IS_FONT_LB_NUM: 4,
	NODE_IS_BG_SP: 5,
	NODE_IS_BUTTON: 6,
	NODE_IS_ALL: 7,
	NODE_IS_CCB: 8,
	NODE_IS_BUTTON_SEL: 9,
	NODE_IS_BUTTON_DIS: 10,
	NODE_IS_BUTTON_EN: 11,
	NODE_IS_FONT_LB_ALL_CHARS: 12,
}
var TypePlistEnum = {
	PLIST_IS_SP : 1,
	PLIST_IS_FNT : 2,
}
//类型定义--end

//配置区--begin
var gapChar = "@";
var fntRootPath = "./fnt/";
var plistRootPath = "./";
var ccbNeedAttrMap = {
	map: {},
	build: function() {
		this.map[TypeNodeEnum.NODE_IS_NODE] = ["x", "y", "visible", "width", "height", "anchorX", "anchorY", "scaleX", "scaleY", "rotation"];
		this.map[TypeNodeEnum.NODE_IS_SP] = this.map[TypeNodeEnum.NODE_IS_NODE];
		this.map[TypeNodeEnum.NODE_IS_FONT_LB_NUM] = this.map[TypeNodeEnum.NODE_IS_NODE];
		this.map[TypeNodeEnum.NODE_IS_FONT_SP] = this.map[TypeNodeEnum.NODE_IS_NODE];
		this.map[TypeNodeEnum.NODE_IS_BUTTON] = this.map[TypeNodeEnum.NODE_IS_NODE];
		this.map[TypeNodeEnum.NODE_IS_BG_SP] = this.map[TypeNodeEnum.NODE_IS_NODE];
		this.map[TypeNodeEnum.NODE_IS_ALL] = this.map[TypeNodeEnum.NODE_IS_NODE];
		this.map[TypeNodeEnum.NODE_IS_FONT_LB_ALL_CHARS] = this.map[TypeNodeEnum.NODE_IS_NODE];
	}
};
var CCB_NEED_ATTR_MAP = ccbNeedAttrMap.build();
//配置区--end

//数据区--begin
var fntPaths = [];
var plistPaths = [];
var nodeTreeForCCB = {};
//数据区--end

//工具区--begin
var getLayerName = function(layer) {
	return ""
};
var getLayerType = function(layer) {
	return TypeLayerEnum.LAYER_IS_NODE;
};
var typeOfNode = function(node) {
	var name = getLayerName(node);
	var layerType = getLayerType(node);
	var find = name.indexOf(gapChar);
	//有前缀的情况
	var nodeType = TypeNodeEnum.NODE_IS_NODE;
	if(find !== -1) {
		var prefix = name.slice(0, find-1);
		switch(prefix) {
			case "all":
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
var checkSpIsBg = function(node) {
	return false;
};
var checkFntExists = function(path) {
	if(fntPaths.indexOf(path) !== -1) {
		return true;
	}
	return false;
}
var psExportTool = function(node, name, path) {
	//导出png到某个目录
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
//打包plist
var plistPackage = function() {
	for (var path in plistPaths) {
		//调用脚本去打包，并删除原目录
	}
};
//打包fnt
var fntPackage = function() {
	for (var path in fntPaths) {
		//调用脚本去打包，并删除原目录
	}
};
var ccbPackage = function() {
	//根据nodeTreeForCCB对象来生成ccb文件
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
				}
				//导出图片到某个plist目录
				var innerPlistName = getLayerName(spNode);
				var plistName = plistInfo.name;
				var plistPath = plistRootPath + plistName;
				psExportTool(spNode, innerPlistName, plistPath);
				//记录之后需要打包的字体目录
				if(plistPaths.indexOf(plistPath) === -1) {
					plistPaths.push(plistPath);
				}
				break;
		}
	}
};
//ps操作区--end

//main区--begin
var forAllNode = function(curNode, belongCcbName) {
	var nodeType = typeOfNode(curNode);
	var plistFolder = "./"+belongCcbName;

};
//main区--end