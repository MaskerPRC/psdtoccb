
//类型定义--begin
var TypeLayerEnum = {
	LAYER_IS_SP : 1,
	LAYER_IS_NODE: 2,
	LAYER_IS_FONT: 3,
};
var TypeNodeEnum = {
	NODE_IS_NONE: 0,
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
	NODE_IS_EXCEPTION: 13
}
var TypePlistEnum = {
	PLIST_IS_SP : 1,
	PLIST_IS_FNT : 2,
}
function CCB_CCNode() {
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
	for (var index = 0; index < this.children.length; index++) {
		var child = this.children[index];
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
	this.anchorX = 0.50;
	this.anchorY = 0.50;
	this.type = "CCSprite";
	this.referResourcePath = "";
};
CCB_CCSprite.prototype = new CCB_CCNode();
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
	this.fntText = "NO TEXT";
};
CCB_CCLabelBMFont.prototype = new CCB_CCNode();
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
CCB_CCMenuItemImage.prototype = new CCB_CCNode();
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
CCB_CCBNode.prototype = new CCB_CCNode();
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
CCB_RootNode.prototype = new CCB_CCNode();
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

function CCB_FileNode() {
	CCB_CCNode.call(this);
	this.referResourcePath = "";
	this.children = [];
};

CCB_FileNode.prototype = new CCB_CCNode();
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