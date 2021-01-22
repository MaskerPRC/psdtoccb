package UI
{
	import com.PSDParser.PSDLayer;
	import com.utils;
	
	import flash.geom.ColorTransform;
	import flash.geom.Point;
	import flash.utils.ByteArray;
	
	import spark.primitives.Rect;
	
	public class Layer extends Object
	{
		public static const LAYER_TYPE_TEXT:String="Text";
		public static const LAYER_TYPE_IMAGE:String="Image";
		public static const LAYER_TYPE_FOLDER:String="Folder";
		
		public var type:String;
		public var url:String;	
		public var width:int;
		public var height:int;
		
		public var visible:Boolean
		public var name:String
		public var x:int
		public var y:int
		public var text:String
		public var filters:Array
		public var textStyle:TextStyle
		
		public var rect:Rect;
		//    public var skin:String
		
		public var childList:Array;
		public var layerType:String;
		
		private static var colorTransform:ColorTransform=new ColorTransform;
		public static function toLayer(psdObject:Object,layerList:Array):Object
		{
			if(psdObject==null)return null;	
			var psdLayer:PSDLayer;
			var list:Array=psdObject.hasOwnProperty("$list")?psdObject.$list:psdObject as Array;
			var layerType:String;
			var isDir:Boolean;
			var rect:Object=list.length?{x:100000,y:100000,width:0,height:0}:{x:0,y:0,width:0,height:0};
			for(var i:int = 0;i<list.length;i++)
			{
				if(list[i].hasOwnProperty("$folder"))	//是否是文件夹
				{
					psdLayer = list[i].$folder as PSDLayer;
					isDir=true;
				}
				else
				{
					psdLayer = list[i] as PSDLayer;
					isDir=false;
				}
				if(!psdLayer||psdLayer.clippingApplied)continue;
				var name:Array = utils.replaceLayerCopyName(psdLayer.name).split("_");
				layerType = name[0];
				var layer:Layer = new Layer;
				layer.name = name[1]?name[1]:utils.replaceLayerCopyName(psdLayer.name);
				layer.filters = psdLayer.filters_arr;
				layer.width = psdLayer.bounds.width;
				layer.height = psdLayer.bounds.height;
				
				layer.text = psdLayer.textContent;
				layer.type = layerType;
				layer.visible = psdLayer.isVisible;
				
				if(psdLayer.isTextLayer())
				{
					var textStyle:TextStyle = new TextStyle;
					var textStyleSheet:Object = psdLayer.getTextStyleSheet();
					
					textStyle.bold = textStyleSheet.FauxBold;
					textStyle.italic = textStyleSheet.FauxItalic;
					
					var color:Array = textStyleSheet.FillColor.Values;
					colorTransform.redOffset = uint(color[1]*255);
					colorTransform.greenOffset = uint(color[2]*255);
					colorTransform.blueOffset = uint(color[3]*255);
					textStyle.color = colorTransform.color;
					
					textStyle.fontName = psdLayer.getFontNameList()[textStyleSheet.Font];
					textStyle.size = textStyleSheet.FontSize;
					textStyle.xScale = textStyleSheet.HorizontalScale;
					textStyle.yScale = textStyleSheet.VerticalScale;
					textStyle.leading = textStyleSheet.Leading;
					textStyle.underline = textStyleSheet.Underline;
					
					layer.textStyle = textStyle
					layer.layerType=Layer.LAYER_TYPE_TEXT;	
					layer.type="Text";
					
				}
				else
				{
					if(!isDir)
					{
						layer.url=utils.replaceLayerName(psdLayer.name);
						layer.layerType=Layer.LAYER_TYPE_IMAGE;
					}
					else
					{
						layer.layerType=Layer.LAYER_TYPE_FOLDER;
					}
				}
				layerList.push(layer);
				layer.childList = [];
				layer.x = psdLayer.position.x;
				layer.y = psdLayer.position.y;
				if(psdLayer.isTextLayer())
				{
					layer.width+=4
					layer.height+=6
					layer.x-=2
					layer.y-=4
				}
				if(isDir)
				{
					// 获取子列表最小坐标 
					var subRect:Object=toLayer(list[i].$list,layer.childList);		
					layer.width = subRect.width-subRect.x;
					layer.height = subRect.height-subRect.y;
					layer.x = subRect.x;
					layer.y = subRect.y;
					globalToLocal(layer);
				}
				rect.x = layer.x<rect.x?layer.x:rect.x;
				rect.y = layer.y<rect.y?layer.y:rect.y;
				rect.width = layer.x+layer.width>rect.width?layer.x+layer.width:rect.width;
				rect.height = layer.y+layer.height>rect.height?layer.y+layer.height:rect.height;
			}
			return rect;
		}
		
		
		private static function globalToLocal(layer:Layer):void {
			for(var i:int=0;i<layer.childList.length;i++)
			{
				layer.childList[i].x-=layer.x;
				layer.childList[i].y-=layer.y;
			}
		}
		
		public static function removeLayerType(object:Object,scaleDic:Object):void
		{
			var i:int = 0;
			if(object is Array)
			{
				for(i = 0;i<object.length;i++)
				{
					removeLayerType(object[i],scaleDic)
				}
			}
			else
			{
				delete object.rect
				if(object.layerType == LAYER_TYPE_IMAGE)
				{
					if(scaleDic.hasOwnProperty(object.url))
					{
						object.type="ScaleBitmap"
						object.rect = scaleDic[object.url]
					}
					else
					{
						object.type="Bitmap"
					}
				}
				for(i = 0;i<object.childList.length;i++)
				{
					removeLayerType(object.childList[i],scaleDic)
				}
				delete object.layerType;
			}
		}
		
		public static function removeLayerProperty(object:Object,parentObject:Object=null):void
		{
			var i:int = 0;
			if(object is Array)
			{
				for(i = 0;i<object.length;i++)
				{
					removeLayerProperty(object[i])
				}
			}
			else
			{
				var strName:String = utils.replaceLayerCopyName(object.name)
				
				for(i = 0;i<object.childList.length;i++)
				{
					removeLayerProperty(object.childList[i],object)
				}
				
				if(!object.skin)delete object.skin;
				
				if(object.type!="ScaleBitmap"&&object.type!="Bitmap")
				{
					delete object.url;     
				}
				
				if(object.type=="ScaleBitmap"||object.type=="Bitmap"||object.type=="Text")
				{
					if(!object.childList.length)
					{
						delete object.childList;   
					}
				}
				
				if(object.type!="Text")
				{
					delete object.text;
					delete object.textStyle;
				}
				
				delete object.visible;
				delete object.filters;
			}
		}
		
		public static function createProperty(object:Object,parent:Object=null):void
		{
			if((object.type=="ScaleBitmap"||object.type=="Bitmap"||object.type=="Text")&&!object.childList)
			{
				trace("parent.type",parent.type)
				
				var normal:Object = clone(object)
					delete object.childList
					delete object.text
					delete object.textStyle
					delete object.url
					delete normal.type
					delete normal.name
				if(normal.textStyle)
				{
					delete normal.textStyle.fontName	
						delete normal.textStyle.xScale	
						delete normal.textStyle.yScale	
				}
				
				if(parent.type=="ScaleBitmap"||parent.type=="Bitmap"||parent.type=="Text")
					object = normal
				else
					object.normal = normal
				return;
			}
			if(!object||!object.childList)return;
			var childList:Array = object.childList
			for(var i:String in childList)
			{
				var sub:Object = childList[i];
				var name:String = sub.name;
				if(object.type=="ScaleBitmap"||object.type=="Bitmap"||object.type=="Text")
				{
					sub.childList[0].x+=sub.x
					sub.childList[0].y+=sub.y
					childList[i]=sub=sub.childList[0]
					sub.x+=object.x
					sub.y+=object.y
						delete object.childList;   
					delete object.text
						delete object.textStyle
						delete object.url
						delete sub.type
						delete sub.name
					if(sub.textStyle)
					{
						delete sub.textStyle.fontName	
							delete sub.textStyle.xScale	
							delete sub.textStyle.yScale	
					}
				}
				if(object.hasOwnProperty(name))
				{
					if(object[name] is Array)
					{
						object[name].push(sub)
					}
					else
					{
						object[name]=[object[name],sub]
					}
				}
				else
				{
					object[name] = sub;
				}
				createProperty(sub,object)
			}
		}
		
		public static function resetObjectRect(object:Object):void
		{
			var i:int = 0
			if(object is Array)
			{
				for(i = 0;i<object.length;i++)
				{
					resetObjectRect(object[i])
				}
			}
			else
			{
				var strName:String = utils.replaceLayerCopyName(object.name)
				
				if(object.childList)
				{
					for(var key:String in object.childList)
					{
						resetObjectRect(object.childList[key])
					}
				}
				
				//是文件夹
				if(object.type!="ScaleBitmap"&&object.type!="Bitmap"&&object.type!="Text"&&strName.substr(0,4)!="Skin")
				{
					switch(strName)
					{
						case "disable":
						case "down":
						case "over":
						case "normal":
							
							for(var k:int=0;k<object.childList.length;k++)
							{
								object.childList[k].x+=object.x;
								object.childList[k].y+=object.y;
							}
							break
						default:
							if(strName.substr(0,4)=="Skin")break;
							var widthHeight:Object = getChildWidthHeight(getObjectByName(getObjectByName(object,"Skin"),"normal"));
							object.width = widthHeight.width;
							object.height = widthHeight.height;
							break;
					}
				}
			}
		}
		
		private static function clone(src:Object):Object
		{
			var bytes:ByteArray = new ByteArray;
			bytes.writeObject(src);
			bytes.position=0;
			return bytes.readObject()
		}
		
		private static function getObjectByName(object:Object,name:String):Object
		{
			for(var key:String in object.childList)
			{
				if(object.childList[key].name==name)return object.childList[key];
			}
			return null;
		}
		
		private static function getChildWidthHeight(object:Object):Object
		{
			return {width:object.childList[0].width,height:object.childList[0].height}
		}
	}
	
}