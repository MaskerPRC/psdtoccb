#include "json2.js";

var main = function() {
	var originDocument = app.activeDocument;
	originDocumentName = originDocument.fullName;
	var tempDocument = originDocument.duplicate();
	app.activeDocument = tempDocument;
	var sceneName = originDocument.name.substring(0, originDocumentName.name.indexOf("."));
	var exportFolder = new Folder(new Folder(originDocumentName.parent).fsName + "/" + sceneName);
	 // alert("exportFolder".lastIndexOf("e"))

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

	alert(projectPos);

	// alert(parent+" # "+ parent1+" # "+ parent2+" # "+ parent3)
}
main();