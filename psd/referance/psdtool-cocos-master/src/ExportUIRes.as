package
{
	import com.PSDParser.PSDLayer;
	import com.adobe.images.JPGEncoder;
	import com.adobe.images.PNGEncoder;
	import com.utils;
	
	import flash.geom.Rectangle;
	import flash.utils.ByteArray;
	
	public class ExportUIRes
	{
		private static const IS_JPG:Boolean=false;
		private static var suffix:String = IS_JPG ? ".jpg":".png";
		private static var _dirPath:String;
		private static var _dirName:String;
		private static var _fileName:String;
		private static var _addName:Boolean;
		private static var _addDir:Boolean;
		private static var _fileListXml:XML = <data/>;
		
		private static var _fileCounter:int = 0;
		private static var _completeAllCallback:Function;
		private static var _completeFileList:Array=[];
		
		public static function Export(psdObject:Object,psdName:String, dirPath:String,addName:Boolean,addDir:Boolean,callback:Function):void
		{
			_fileName = psdName.replace(".psd","");
			_dirName = dirPath.substring(0,dirPath.lastIndexOf("/"));
			_dirName = _dirName.substring(_dirName.lastIndexOf("/")+1);
			_addName = addName;
			_addDir = addDir;
			_dirPath = dirPath;
			layerNameObject={};
			_fileListXml = <data/>
			_completeAllCallback = callback;
			readPsdLayer(psdObject.list);
			var xmlSavePath:String = _dirPath + "/" + _fileName + ".xml";
			utils.writeXmlAsync(xmlSavePath, _fileListXml.toXMLString(), null);			
		}
		
		private static var layerNameObject:Object;
		private static var jpgEncoder:JPGEncoder=new JPGEncoder(100);
		private static var isWirteFileObject:Object={};
		public static function getRect(psdObject:Object,rectDic:Object):void
		{
			if(psdObject==null)return;
			var psdLayer:PSDLayer;
			var path:String
			var currentClippingPsd:PSDLayer;
			for(var key:String in psdObject)
			{
				psdLayer=psdObject[key] as PSDLayer;
				if(psdLayer&&psdLayer.type != PSDLayer.LayerType_FOLDER_CLOSED && psdLayer.type != PSDLayer.LayerType_FOLDER_OPEN && psdLayer.type != PSDLayer.LayerType_HIDDEN && !psdLayer.isTextLayer() &&psdLayer.bmp)
				{
					if(psdLayer.clippingApplied)
					{
						currentClippingPsd=psdLayer;
						continue;
					}
					currentClippingPsd=null;
				}
				else
				{
					currentClippingPsd=null;
					getRect(psdObject[key],rectDic);
				}
			}
		}
		
		private static function readPsdLayer(children:Array):void
		{ 			
			if(children == null)return;

			var path:String;
			var name:String;	
			for(var i:int = children.length - 1; i >= 0; i--)
			{					
				if(children[i] is PSDLayer)
				{
					var psdLayer:PSDLayer = children[i];
					if(	psdLayer.type != PSDLayer.LayerType_FOLDER_CLOSED 
						&& psdLayer.type != PSDLayer.LayerType_FOLDER_OPEN 
						&& psdLayer.type != PSDLayer.LayerType_HIDDEN 
						&& !psdLayer.isTextLayer() && !psdLayer.clippingApplied
						&& psdLayer.bmp)
					{		
						name = getImgName(utils.replaceLayerName(psdLayer.name)) + suffix;
						path = _dirPath + "/"+ _fileName + "/" + name;
						
						if(!layerNameObject.hasOwnProperty(path))
						{
							layerNameObject[path] = psdLayer.name;
							_fileCounter++;
							if(IS_JPG)
							{
								utils.writeFileAsync(path,jpgEncoder.encode(psdLayer.bmp),onComplete);
							}
							else
							{
								utils.writeFileAsync(path,PNGEncoder.encode(psdLayer.bmp),onComplete);
							}
							var node:XML = <node/>;
							node.appendChild(name);
							_fileListXml.appendChild(node);
						}						
					}
				}
				else if(children[i].$folder.name != "回收站")
				{			
					readPsdLayer(children[i].$list);
				}
			} 			
		}	
		
		private static function getImgName(img:String):String
		{
			var ret:String = img;
			if(ret.indexOf(".") == -1)
			{
				if(_addName)ret = _fileName + "." + ret;
				if(_addDir)ret = _dirName + "." + ret;
			}
			return ret;		
		}
		
		private static function onComplete(path:String,flag:Boolean):void
		{
			utils.print("写入PSD图层名：",layerNameObject[path],"到文件路径：",path,flag?"成功":"失败");
			_completeFileList.push(path);
			_fileCounter--;
			if(_fileCounter == 0)
			{
				if(_completeAllCallback != null) 
				{
					_completeAllCallback(_completeFileList);
				}
			}
		}
	}
}