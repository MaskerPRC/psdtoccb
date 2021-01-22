package
{
	import UI.Layer;
	import UI.TextStyle;
	
	import com.PSDParser.PSDLayer;
	import com.adobe.serialization.json.JSON;
	import com.adobe.serialization.json.JSONEncoder;
	import com.utils;
	
	import flash.geom.ColorTransform;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.utils.ByteArray;

	public class LayoutCreator
	{
		private static var bytes:ByteArray=new ByteArray;
		private static var _dirPath:String;
		private static var _saveFileName:String
		public static function Export(psdObject:Object,dirPath:String,saveFileName:String,scaleGrid9Path:String,isOwner:Boolean):void
		{
			_dirPath=dirPath;
//			_dirPath=dirPath+"\\"+saveFileName.replace(".psd","");
			_saveFileName=saveFileName.replace("psd","clyt");
			bytes.clear();
			var layerList:Array=[];
			Layer.toLayer(psdObject.list,layerList);
		      //干掉layoutType
		      bytes.writeObject(layerList);
		      bytes.position=0;
		      
		      var list:Object = bytes.readObject();
		      var panel:Object = {};
		      panel.childList = list as Array;
		      panel.width = psdObject.width;
		      panel.height = psdObject.height;
		      
		      var scaleDic:Object = {};
		      if(isOwner)
		      {
		        ExportUIRes.getRect(psdObject,scaleDic);
		      }
		      else
		      {
		        var bytesConfig:ByteArray = new ByteArray;
		        utils.readFile(scaleGrid9Path,bytesConfig);
		        bytesConfig.uncompress();
				scaleDic = bytesConfig.readObject();
		      }
		      
		      Layer.removeLayerType(list,scaleDic)
		//      Layer.resetObjectRect(list)
		      Layer.removeLayerProperty(list)
		      Layer.createProperty(panel);
		      
		      bytes.clear();  
			bytes.writeObject(panel);
			bytes.compress();
			utils.writeFileAsync(_dirPath+"/"+_saveFileName,bytes,writeComplete);
			
		}
		
		private static function writeComplete(filePath:String,flag:Boolean):void
		{
			utils.print("导出功能模块：",_dirPath+"/"+_saveFileName,"完成")
		}
	}
}