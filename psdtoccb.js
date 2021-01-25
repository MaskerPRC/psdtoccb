/***
 * 我们把layer理解为psd中的组或者图层或者字体
 * 我们把node理解为中间对象
 * @param node
 * @returns {string}
 */

//JS库--begin
#include "json2.js";
var myInherits = function (subType, superType) {
	var subPrototype = Object.create(superType.prototype);
	subPrototype.constructor = subType;
	subType.prototype = subPrototype;
};
//JS库--end


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
var CCB_CCNode = function() {
	this.type = "CCNode";
	this.displayName = this.type;
	this.children = [];

	this.x = 0.0;
	this.y = 0.0;
	this.anchorX = 0.0;
	this.anchorY = 0.0;
	this.scaleX = 1.0;
	this.scaleY = 1.0;
	this.rotation = 0.0;
	this.visible = true;
};
CCB_CCNode.prototype.getPositionXml = function() {
	var positionAppendXml = "";
	//坐标不是0的node需要添加xml文本
	if(this.x || this.y) {
		positionAppendXml = "\n" +
			"<dict>\n" +
			"<key>name</key>\n" +
			"<string>position</string>\n" +
			"<key>type</key>\n" +
			"<string>Position</string>\n" +
			"<key>value</key>\n" +
			"<array>\n" +
			"<real>"+this.x+"</real>\n" +
			"<real>"+this.y+"</real>\n" +
			"<integer>0</integer>\n" +
			"</array>\n" +
			"</dict>";
	}
	return positionAppendXml;
};
CCB_CCNode.prototype.getVisibleXml = function() {
	var visibleAppendXml = "";
	//隐藏的node需要添加xml文本
	if(!this.visible) {
		visibleAppendXml = "\n" +
			"<dict>\n" +
			"<key>name</key>\n" +
			"<string>visible</string>\n" +
			"<key>type</key>\n" +
			"<string>Check</string>\n" +
			"<key>value</key>\n" +
			"<false/>\n" +
			"</dict>";
	}
	return visibleAppendXml;
};
CCB_CCNode.prototype.getRotationXml = function() {
	var rotationAppendXml = "";
	//角度不是0要添加xml文本
	if(this.rotation) {
		rotationAppendXml = "\n" +
			"<dict>\n" +
			"<key>name</key>\n" +
			"<string>rotation</string>\n" +
			"<key>type</key>\n" +
			"<string>Degrees</string>\n" +
			"<key>value</key>\n" +
			"<real>"+this.rotation+"</real>\n" +
			"</dict>";
	}
	return rotationAppendXml;
};
CCB_CCNode.prototype.getDynamicAttrXml = function() {
	return this.getPositionXml() +
		this.getVisibleXml() +
		this.getRotationXml();

};
CCB_CCNode.prototype.getChildrenXml = function() {
	var childrenXml = "";
	for(var child of this.children) {
		var childXml = child.buildXmlNode();
		childrenXml += childXml;
	}
	return childrenXml;
};
CCB_CCNode.prototype.buildXmlNode = function() {
	var xmlChildrenNode = this.getChildrenXml();
	if(xmlChildrenNode === "") {
		xmlChildrenNode = "\n" +
			"<array/>";
	} else {
		xmlChildrenNode = "\n" +
			"<array>" +
			xmlChildrenNode +
			"</array>";
	}
	var defaultNodeXml = "\n" +
		"<dict>\n" +
		"<key>baseClass</key>\n" +
		"<string>"+this.type+"</string>\n" +
		"<key>children</key>" +

		""+ xmlChildrenNode +"\n" +

		"<key>customClass</key>\n" +
		"<string></string>\n" +
		"<key>displayName</key>\n" +
		"<string>"+this.displayName+"</string>\n" +
		"<key>memberVarAssignmentName</key>\n" +
		"<string></string>\n" +
		"<key>memberVarAssignmentType</key>\n" +
		"<integer>0</integer>\n" +
		"<key>properties</key>\n" +
		"<array>\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>anchorPoint</string>\n" +
		"<key>type</key>\n" +
		"<string>Point</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<real>"+this.anchorX+"</real>\n" +
		"<real>"+this.anchorY+"</real>\n" +
		"</array>\n" +
		"</dict>\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>scale</string>\n" +
		"<key>type</key>\n" +
		"<string>ScaleLock</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<real>"+this.scaleX+"</real>\n" +
		"<real>"+this.scaleY+"</real>\n" +
		"<false/>\n" +
		"<integer>0</integer>\n" +
		"</array>\n" +
		"</dict>" +
		this.getDynamicAttrXml() + "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>ignoreAnchorPointForPosition</string>\n" +
		"<key>type</key>\n" +
		"<string>Check</string>\n" +
		"<key>value</key>\n" +
		"<false/>\n" +
		"</dict>\n" +
		"</array>\n" +
		"<key>selected</key>\n" +
		"<false/>\n" +
		"</dict>";
	return defaultNodeXml;
}

var CCB_CCSprite = function(){
	CCB_CCNode.call(this);
	this.type = "CCSprite";
	this.referResourcePath = "";
};
myInherits(CCB_CCSprite, CCB_CCNode);
CCB_CCSprite.prototype.getSpriteFrameXml = function() {
	var frameAppendXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>displayFrame</string>\n" +
		"<key>type</key>\n" +
		"<string>SpriteFrame</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<string></string>\n" +
		"<string>"+this.referResourcePath+"</string>\n" +
		"</array>\n" +
		"</dict>";
	return frameAppendXml;
};
CCB_CCSprite.prototype.getDynamicAttrXml = function() {
	return this.getPositionXml() +
		this.getVisibleXml() +
		this.getRotationXml() +
		this.getSpriteFrameXml();

};

var CCB_CCLabelBMFont = function(){
	CCB_CCNode.call(this);
	this.type = "CCSprite";
	this.referResourcePath = "";
};
myInherits(CCB_CCLabelBMFont, CCB_CCNode);
CCB_CCLabelBMFont.prototype.getFntFileXml = function() {
	var fntFileAppendXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>fntFile</string>\n" +
		"<key>type</key>\n" +
		"<string>FntFile</string>\n" +
		"<key>value</key>\n" +
		"<string>"+this.referResourcePath+"</string>\n" +
		"</dict>";
	return fntFileAppendXml;
};
CCB_CCLabelBMFont.prototype.getFntTextXml = function() {
	var fntTextXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>string</string>\n" +
		"<key>type</key>\n" +
		"<string>Text</string>\n" +
		"<key>value</key>\n" +
		"<string>"+this.fntText+"</string>\n" +
		"</dict>";
	return fntTextXml;
}
CCB_CCLabelBMFont.prototype.getDynamicAttrXml = function() {
	return this.getPositionXml() +
		this.getVisibleXml() +
		this.getRotationXml() +
		this.getFntFileXml() +
		this.getFntTextXml();
};

var CCB_CCMenuItemImage = function(){
	CCB_CCNode.call(this);
	this.type = "CCMenuItemImage";
	this.referResourcePlist = "";
	this.referResourcePathSel = "";
	this.referResourcePathEn = "";
	this.referResourcePathDis = "";
};
myInherits(CCB_CCMenuItemImage, CCB_CCNode);
CCB_CCMenuItemImage.prototype.getBlockXml = function() {
	var blockXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>block</string>\n" +
		"<key>type</key>\n" +
		"<string>Block</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<string></string>\n" +
		"<integer>0</integer>\n" +
		"</array>\n" +
		"</dict>";
	return blockXml;
};
CCB_CCMenuItemImage.prototype.getEnableXml = function() {
	var enableXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>isEnabled</string>\n" +
		"<key>type</key>\n" +
		"<string>Check</string>\n" +
		"<key>value</key>\n" +
		"<true/>\n" +
		"</dict>";
	return enableXml;
};
CCB_CCMenuItemImage.prototype.getNormalXml = function() {
	var normalXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>normalSpriteFrame</string>\n" +
		"<key>type</key>\n" +
		"<string>SpriteFrame</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<string>"+this.referResourcePlist+"</string>\n" +
		"<string>"+this.referResourcePathEn+"</string>\n" +
		"</array>\n" +
		"</dict>";
	return normalXml;
};
CCB_CCMenuItemImage.prototype.getSelXml = function() {
	var selXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>selectedSpriteFrame</string>\n" +
		"<key>type</key>\n" +
		"<string>SpriteFrame</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<string>"+this.referResourcePlist+"</string>\n" +
		"<string>"+this.referResourcePathSel+"</string>\n" +
		"</array>\n" +
		"</dict>";
	return selXml;
};
CCB_CCMenuItemImage.prototype.getDisXml = function() {
	var DisXml = "\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>disabledSpriteFrame</string>\n" +
		"<key>type</key>\n" +
		"<string>SpriteFrame</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<string>"+this.referResourcePlist+"</string>\n" +
		"<string>"+this.referResourcePathDis+"</string>\n" +
		"</array>\n" +
		"</dict>";
	return DisXml;
};
CCB_CCMenuItemImage.prototype.getDynamicAttrXml = function() {
	return this.getPositionXml() +
		this.getVisibleXml() +
		this.getRotationXml() +
		this.getBlockXml() +
		this.getEnableXml() +
		this.getNormalXml() +
		this.getSelXml() +
		this.getDisXml() +
		this.getDynamicAttrXml();
};
CCB_CCMenuItemImage.prototype.buildXmlNode = function() {
	var innerNodeXml = CCB_CCNode.prototype.buildXmlNode.call(this);
	var defaultNodeXml = "\n"+
		"<dict>\n"+
		"<key>baseClass</key>\n"+
		"<string>CCMenu</string>\n"+
		"<key>children</key>\n"+
		"<array>"+

		innerNodeXml + "\n" +

		"</array>\n"+
		"<key>customClass</key>\n"+
		"<string></string>\n"+
		"<key>displayName</key>\n"+
		"<string>CCMenu</string>\n"+
		"<key>memberVarAssignmentName</key>\n"+
		"<string></string>\n"+
		"<key>memberVarAssignmentType</key>\n"+
		"<integer>0</integer>\n"+
		"<key>properties</key>\n"+
		"<array>\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>position</string>\n"+
		"<key>type</key>\n"+
		"<string>Position</string>\n"+
		"<key>value</key>\n"+
		"<array>\n"+
		"<real>0.0</real>\n"+
		"<real>0.0</real>\n"+
		"<integer>0</integer>\n"+
		"</array>\n"+
		"</dict>\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>anchorPoint</string>\n"+
		"<key>type</key>\n"+
		"<string>Point</string>\n"+
		"<key>value</key>\n"+
		"<array>\n"+
		"<real>0.5</real>\n"+
		"<real>0.5</real>\n"+
		"</array>\n"+
		"</dict>\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>scale</string>\n"+
		"<key>type</key>\n"+
		"<string>ScaleLock</string>\n"+
		"<key>value</key>\n"+
		"<array>\n"+
		"<real>1</real>\n"+
		"<real>1</real>\n"+
		"<false/>\n"+
		"<integer>0</integer>\n"+
		"</array>\n"+
		"</dict>\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>ignoreAnchorPointForPosition</string>\n"+
		"<key>type</key>\n"+
		"<string>Check</string>\n"+
		"<key>value</key>\n"+
		"<true/>\n"+
		"</dict>\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>touchEnabled</string>\n"+
		"<key>platform</key>\n"+
		"<string>iOS</string>\n"+
		"<key>type</key>\n"+
		"<string>Check</string>\n"+
		"<key>value</key>\n"+
		"<true/>\n"+
		"</dict>\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>mouseEnabled</string>\n"+
		"<key>platform</key>\n"+
		"<string>Mac</string>\n"+
		"<key>type</key>\n"+
		"<string>Check</string>\n"+
		"<key>value</key>\n"+
		"<true/>\n"+
		"</dict>\n"+
		"</array>\n"+
		"</dict>";
	return defaultNodeXml;
}

var CCB_CCBNode = function(){
	CCB_CCNode.call(this);
	this.type = "CCBFile";
	this.referResourcePath = "";
};
myInherits(CCB_CCBNode, CCB_CCNode);
CCB_CCBNode.prototype.getCCBFileXml = function() {
	var ccbFileAppendXml = "\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>ccbFile</string>\n"+
		"<key>type</key>\n"+
		"<string>CCBFile</string>\n"+
		"<key>value</key>\n"+
		"<string>"+this.referResourcePath+"</string>\n"+
		"</dict>";
	return ccbFileAppendXml;
};
CCB_CCBNode.prototype.getDynamicAttrXml = function() {
	return this.getPositionXml() +
		this.getVisibleXml() +
		this.getRotationXml() +
		this.getCCBFileXml();
};

var CCB_RootNode = function(){
	CCB_CCNode.call(this);
	this.type = "CCNode";
	this.referResourcePath = "";
	this.anchorX = 0.0;
	this.anchorY = 0.0;
	this.scaleX = 1;
	this.scaleY = 1;
};
myInherits(CCB_RootNode, CCB_CCNode);
CCB_RootNode.prototype.getCCBFileXml = function() {
	var ccbFileAppendXml = "\n"+
		"<dict>\n"+
		"<key>name</key>\n"+
		"<string>ccbFile</string>\n"+
		"<key>type</key>\n"+
		"<string>CCBFile</string>\n"+
		"<key>value</key>\n"+
		"<string>"+this.referResourcePath+"</string>\n"+
		"</dict>";
	return ccbFileAppendXml;
};
CCB_RootNode.prototype.getDynamicAttrXml = function() {
	return this.getPositionXml() +
		this.getVisibleXml() +
		this.getRotationXml() +
		this.getCCBFileXml();
};
CCB_RootNode.prototype.buildXmlNode = function() {
	var xmlChildrenNode = this.getChildrenXml();
	if(xmlChildrenNode === "") {
		xmlChildrenNode = "<array/>";
	} else {
		xmlChildrenNode = "\n" +
			"<array>\n" +
			xmlChildrenNode +
			"</array>";
	}
	var defaultNodeXml = "\n" +
		"<dict>\n" +
		"<key>baseClass</key>\n" +
		"<string>CCNode</string>\n" +
		"<key>children</key>\n" +
		"<array>" +

		xmlChildrenNode + "\n" +

		"</array>\n" +
		"<key>customClass</key>\n" +
		"<string></string>\n" +
		"<key>displayName</key>\n" +
		"<string>CCNode</string>\n" +
		"<key>jsController</key>\n" +
		"<string></string>\n" +
		"<key>memberVarAssignmentName</key>\n" +
		"<string></string>\n" +
		"<key>memberVarAssignmentType</key>\n" +
		"<integer>0</integer>\n" +
		"<key>properties</key>\n" +
		"<array>\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>anchorPoint</string>\n" +
		"<key>type</key>\n" +
		"<string>Point</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<real>0.0</real>\n" +
		"<real>0.0</real>\n" +
		"</array>\n" +
		"</dict>\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>scale</string>\n" +
		"<key>type</key>\n" +
		"<string>ScaleLock</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<real>1</real>\n" +
		"<real>1</real>\n" +
		"<false/>\n" +
		"<integer>0</integer>\n" +
		"</array>\n" +
		"</dict>" +

		this.getDynamicAttrXml() + "\n" +

		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>ignoreAnchorPointForPosition</string>\n" +
		"<key>type</key>\n" +
		"<string>Check</string>\n" +
		"<key>value</key>\n" +
		"<false/>\n" +
		"</dict>"
		"</array>\n" +
		"</dict>";
	return defaultNodeXml;
}

CCB_FileNode = function() {
	CCB_CCNode.call(this);
	this.referResourcePath = "";
	this.children = [];
};
myInherits(CCB_FileNode, CCB_CCNode);
CCB_FileNode.prototype.buildXmlNode = function() {
	var xmlChildrenNode = this.getChildrenXml();
	if(xmlChildrenNode === "") {
		xmlChildrenNode = "\n" +
			"<array/>";
	} else {
		xmlChildrenNode = "\n" +
			"<array>" +
			xmlChildrenNode +
			"</array>";
	}

	var defaultNodeXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
		"<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n" +
		"<plist version=\"1.0\">\n" +
		"<dict>\n" +
		"<key>centeredOrigin</key>\n" +
		"<false/>\n" +
		"<key>currentResolution</key>\n" +
		"<integer>0</integer>\n" +
		"<key>currentSequenceId</key>\n" +
		"<integer>0</integer>\n" +
		"<key>fileType</key>\n" +
		"<string>CocosBuilder</string>\n" +
		"<key>fileVersion</key>\n" +
		"<integer>4</integer>\n" +
		"<key>guides</key>\n" +
		"<array/>\n" +
		"<key>jsControlled</key>\n" +
		"<true/>\n" +
		"<key>nodeGraph</key>\n" +
		"<dict>\n" +
		"<key>baseClass</key>\n" +
		"<string>CCNode</string>\n" +
		"<key>children</key>" +

		xmlChildrenNode + "\n" +

		"<key>customClass</key>\n" +
		"<string></string>\n" +
		"<key>displayName</key>\n" +
		"<string>CCNode</string>\n" +
		"<key>memberVarAssignmentName</key>\n" +
		"<string></string>\n" +
		"<key>memberVarAssignmentType</key>\n" +
		"<integer>0</integer>\n" +
		"<key>properties</key>\n" +
		"<array>\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>anchorPoint</string>\n" +
		"<key>type</key>\n" +
		"<string>Point</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<real>0.0</real>\n" +
		"<real>0.0</real>\n" +
		"</array>\n" +
		"</dict>\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>scale</string>\n" +
		"<key>type</key>\n" +
		"<string>ScaleLock</string>\n" +
		"<key>value</key>\n" +
		"<array>\n" +
		"<real>1</real>\n" +
		"<real>1</real>\n" +
		"<false/>\n" +
		"<integer>0</integer>\n" +
		"</array>\n" +
		"</dict>\n" +
		"<dict>\n" +
		"<key>name</key>\n" +
		"<string>ignoreAnchorPointForPosition</string>\n" +
		"<key>type</key>\n" +
		"<string>Check</string>\n" +
		"<key>value</key>\n" +
		"<false/>\n" +
		"</dict>\n" +
		"</array>\n" +
		"</dict>" +
		"<key>notes</key>\n" +
		"<array/>\n" +
		"<key>resolutions</key>\n" +
		"<array>\n" +
		"<dict>\n" +
		"<key>centeredOrigin</key>\n" +
		"<false/>\n" +
		"<key>ext</key>\n" +
		"<string> </string>\n" +
		"<key>height</key>\n" +
		"<integer>0</integer>\n" +
		"<key>name</key>\n" +
		"<string>Custom</string>\n" +
		"<key>scale</key>\n" +
		"<real>1</real>\n" +
		"<key>width</key>\n" +
		"<integer>0</integer>\n" +
		"</dict>\n" +
		"</array>\n" +
		"<key>sequences</key>\n" +
		"<array>\n" +
		"<dict>\n" +
		"<key>autoPlay</key>\n" +
		"<true/>\n" +
		"<key>callbackChannel</key>\n" +
		"<dict>\n" +
		"<key>keyframes</key>\n" +
		"<array/>\n" +
		"<key>type</key>\n" +
		"<integer>10</integer>\n" +
		"</dict>\n" +
		"<key>chainedSequenceId</key>\n" +
		"<integer>-1</integer>\n" +
		"<key>length</key>\n" +
		"<real>10</real>\n" +
		"<key>name</key>\n" +
		"<string>Default Timeline</string>\n" +
		"<key>offset</key>\n" +
		"<real>4.6723957061767578</real>\n" +
		"<key>position</key>\n" +
		"<real>9.1333332061767578</real>\n" +
		"<key>resolution</key>\n" +
		"<real>30</real>\n" +
		"<key>scale</key>\n" +
		"<real>128</real>\n" +
		"<key>sequenceId</key>\n" +
		"<integer>0</integer>\n" +
		"<key>soundChannel</key>\n" +
		"<dict>\n" +
		"<key>keyframes</key>\n" +
		"<array/>\n" +
		"<key>type</key>\n" +
		"<integer>9</integer>\n" +
		"</dict>\n" +
		"</dict>\n" +
		"</array>\n" +
		"<key>stageBorder</key>\n" +
		"<integer>3</integer>\n" +
		"</dict>\n" +
		"</plist>\n";
	return defaultNodeXml;
};
//类型定义--end

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
var plistPaths = [];
var ccbFiles = [];
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
		return node.bounds[1].value;
	} else {
		return node.bounds[1].value - getLayerY(fatherNode);
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
var getIsVisibleLayer = function(node) {
	return !!node.visible;
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
	//根据nodeTreeForCCBs对象来生成ccb文件
	for (var ccb of ccbFiles) {
		var ccbFileContent = ccb.buildXmlNode();
		var filePath = ccb.referResourcePath;
		//将内容写出到文档
		var file = new File(filePath);
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
var forAllNode = function(curNode, belongCcbName, fatherNode) {
	var nodeType = typeOfNode(curNode);

	//对当前节点进行处理，对于不同的类型，进行不同的处理，或直接导出，或存储到数据区最后导出
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
			for(var i=curNode.artLayers.length-1 ; i>=0 ; i--) {
				forAllNode(curNode.artLayers[i], nodeLayerName, node);
			}

			break;
		case TypeNodeEnum.NODE_IS_SP:
			//layer图片：
			//1、构建sp节点
			var node = new CCB_CCSprite();
			var spLayerName = getLayerName(curNode);
			node.displayName = spLayerName;
			node.referResourcePath = belongCcbName + "/" + spLayerName + ".png";

			if(fatherNode) {
				fatherNode.children.push(node);
			}

			//2、将图片导出到所属ccbplist目录
			var plistPath = belongCcbName;
			exportPng(curNode, !!plistPath, {name: plistPath, type: TypePlistEnum.PLIST_IS_SP});

			break;
		case TypeNodeEnum.NODE_IS_CCB:
			//子ccb

			//1、构建ccb节点
			var node = new CCB_CCBNode();
			var fatherCcbName = belongCcbName;
			var ccbLayerName = getLayerName(curNode);
			node.displayName = ccbLayerName;
			node.referResourcePath = fatherCcbName +"_"+ ccbLayerName + ".ccb";

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
			fileNode.referResourcePath = fatherCcbName +"_"+ ccbLayerName + ".ccb";
			for(var i=curNode.artLayers.length-1 ; i>=0 ; i--) {
				forAllNode(curNode.artLayers[i], fatherCcbName +"_"+ layerName, fileNode);
			}

			//4、记录file数组和plist文件夹数据
			ccbFiles.push(fileNode);
			plistPaths.push(folder);
			break;
	}
};

var main = function() {
	var rootLayer = {};

	//构建fntPaths，plistPaths，ccbFiles
	forAllNode(rootLayer, getLayerName(rootLayer));

	//打包plist，fnt，ccb
	plistPackage();
	fntPackage();
	ccbPackage();

	//over
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
test();
//main区--end