#include "json2.js";

var main = function() {
	var originDocument = app.activeDocument;
	originDocumentName = originDocument.fullName;
	var tempDocument = originDocument.duplicate();
	app.activeDocument = tempDocument;
	var sceneName = originDocument.name.substring(0, originDocumentName.name.indexOf("."));
	var exportFolder = new Folder(new Folder(originDocumentName.parent).fsName + "/" + sceneName);
	alert(exportFolder)
}
main();