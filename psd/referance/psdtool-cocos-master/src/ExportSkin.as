package {
	import com.PSDParser.PSDLayer;
	import com.adobe.images.PNGEncoder;
	import com.utils;
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	import flash.utils.Dictionary;
	
	import mx.messaging.channels.StreamingAMFChannel;
	
	public class ExportSkin {
		
		private static var FMT_OPEN:String  = '{0}{name="{1}",type="{2}",x={3},y={4},width={5},height={6},\n';
		private static var FMT_CLOSE:String = '{0}},\n';
		private static var FMT_OPEN_CHILDREN:String  = '{0}{name="{1}",type="{2}",x={3},y={4},width={5},height={6},\n{0}    children=\n{0}    {\n';
		private static var FMT_CLOSE_CHILDREN:String = '{0}    }\n{0}},\n';
		private static var FMT_IMAGE:String = '{0}{name = "{1}",status = "{2}",img="{3}",x={4},y={5},width={6},height={7}},\n';
		private static var FMT_IMAGE9:String = '{0}{name = "{1}",status = "{2}",img="{3}",x={4},y={5},width={6},height={7},top={8},right={9},bottom={10},left={11},midWidth={12},midHeight={13}},\n';
		private static var FMT_LABEL:String = '{0}{name="{1}",status="{2}",txt="{3}",font="{4}",size={5},bold={6},italic={7},color={{8},{9},{10}}},\n';
		
		private static var _fileName:String;
		private static var _dirName:String;
		private static var _rawDirName:String;
		private static var _addName:Boolean;
		private static var _addDir:Boolean;
		public static function Export(psdObject:Object,psdName:String,dirPath:String,addName:Boolean,addDir:Boolean):void
		{
		
			_fileName = psdName.replace(".psd","");
			_addName = addName;
			_addDir = addDir;
			_rawDirName = dirPath;
			_dirName = dirPath.substring(0,dirPath.lastIndexOf("/"));
			_dirName = _dirName.substring(_dirName.lastIndexOf("/")+1);
			var temp:ByteArray=new ByteArray;
			utils.readFile(File.applicationDirectory.nativePath+"/SkinTemplete.lua",temp);
			var tempStr:String = temp.readUTFBytes(temp.bytesAvailable);
			
			var bounds:Rectangle = new Rectangle(0,0,psdObject.width,psdObject.height);			
			adjustBounds1(psdObject.list);//计算folder位置信息
			adjustBounds2(bounds,psdObject.list);//绝对位置换为相对位置
			adjustBounds3(bounds,psdObject.list);//左上角原点换为左下角原点
			
			var skinData:ByteArray=new ByteArray;
			parseSkins(skinData, psdObject);
			skinData.position=0;
			var skinStr:String = skinData.readUTFBytes(skinData.bytesAvailable);
			
			var savePath:String = dirPath + "/" + _fileName + "Skin.lua";			
			utils.writeXmlAsync(savePath,tempStr.replace("{SkinStr}",skinStr),null);
		}
		
		private static function adjustBounds1(children:Array):Rectangle	
		{
			var bounds:Rectangle = new Rectangle();
			for(var i:int = children.length - 1; i >= 0; i--)
			{					
				if(children[i] is PSDLayer)
				{
					bounds = bounds.union(children[i].bounds);
				}
				else
				{					
					children[i].$folder.bounds = children[i].$folder.bounds.union(adjustBounds1(children[i].$list));
					bounds = bounds.union(children[i].$folder.bounds);
				}
			}
			return bounds;
		}
		private static function adjustBounds2(parentBounds:Rectangle, children:Array):void
		{
			for(var i:int = children.length - 1; i >= 0; i--)
			{
				if(children[i] is PSDLayer)
				{
					children[i].bounds.x = children[i].bounds.x - parentBounds.x;
					children[i].bounds.y = children[i].bounds.y - parentBounds.y;
				}
				else
				{
					adjustBounds2(children[i].$folder.bounds, children[i].$list);
					children[i].$folder.bounds.x = children[i].$folder.bounds.x - parentBounds.x;
					children[i].$folder.bounds.y = children[i].$folder.bounds.y - parentBounds.y;
				}
			}
		}		
		
		private static function adjustBounds3(parentBounds:Rectangle, children:Array):void
		{
			for(var i:int = children.length - 1; i >= 0; i--)
			{
				if(children[i] is PSDLayer)
				{
					children[i].bounds.y = parentBounds.height - children[i].bounds.y - children[i].bounds.height;
				}
				else
				{
					adjustBounds3(children[i].$folder.bounds, children[i].$list);
					children[i].$folder.bounds.y = parentBounds.height - children[i].$folder.bounds.y -children[i].$folder.bounds.height;
				}
			}
		}	
		private static function parseSkins(skinData:ByteArray, psdObject:Object):void
		{
			skinData.writeUTFBytes(formate(FMT_OPEN_CHILDREN,'    ',
				_fileName,"Container",0,0,psdObject.width,psdObject.height));	
			
			var psdLayer:PSDLayer;
			for(var i:int = psdObject.list.length - 1; i >= 0; i--)
			{
				if(psdObject.list[i] is PSDLayer)
				{
					parseLayer(skinData,psdObject.list[i],3,new Rectangle(0,0,psdObject.list[i].bounds.width,psdObject.list[i].bounds.height));
				}
				else
				{
					parseFolder(skinData,psdObject.list[i],3);
				}					
			}
			
			skinData.writeUTFBytes("        }\n    }");				
		}
		
		private static function parseSuffix(name:String,ary:Array):void
		{
			var suffixMap:Object = {
				normal:"normal",nl:"normal",nm:"normal",n:"normal",
				down:"down",dn:"down",d:"down",
				over:"over",or:"over",ov:"over",o:"over",
				disable:"disable",de:"disable",dis:"disable"
			}
			var index:int = name.indexOf("_");
			if(-1 == index)
			{
				ary.push(name);
				ary.push("");
			}
			else
			{
				ary.push(name.substring(0,index));
				var suffixStr:String = name.substring(index + 1);
				ary.push(suffixMap[suffixStr.toLocaleLowerCase()] ? suffixMap[suffixStr.toLocaleLowerCase()] : suffixStr);
			}
		}
		private static function parseName(name:String):Array
		{
			var map:Object = {
				image:"Image",img:"Image",bitmap:"Image",bit:"Image",bmp:"Image",
				button:"Button",btn:"Button",bt:"Button",
				image9:"Image9",img9:"Image9",sb:"Image9",scalebitmap:"Image9",
				label:"Label",lb:"Label",Text:"Label",ll:"Label",txt:"Label",
				radiobuttongroup:"RadioButtonGroup",rbg:"RadioButtonGroup",
				radiobutton:"RadioButton",rb:"RadioButton",
				dragbar:"DragBar",db:"DragBar",drag:"DragBar",
				list:"List",li:"List",lt:"List",ls:"List",
				scrollview:"ScrollView",sv:"ScrollView",
				pageview:"PageView",pv:"PageView",
				scrollbar:"ScrollBar",slb:"ScrollBar",srb:"ScrollBar",
				slider:"Slider",sd:"Slider",
				combobox:"ComboBox",cb:"ComboBox",
				stepper:"Stepper",sp:"Stepper",
				container:"Container",ct:"Container",
				progress:"Progress",pg:"Progress",
				focuslist:"FocusList"
			};
			

			var ary:Array = new Array();
			var index:int = name.indexOf("_");
			if(-1 == index)
			{
				if(map[name.toLocaleLowerCase()])
				{
					ary.push(map[name.toLocaleLowerCase()]);
					ary.push("my" + map[name.toLocaleLowerCase()]);
					ary.push("");
				}
				else
				{
					ary.push("");
					ary.push(name);
					ary.push("");
				}
				return ary;
			}
			
			var preStr:String = name.substring(0,index);
			if(map[preStr.toLocaleLowerCase()])
			{
				ary.push(map[preStr.toLocaleLowerCase()]);
				parseSuffix(name.substring(index + 1),ary);
			}
			else
			{	
				ary.push("");
				parseSuffix(name,ary);
			}
			return ary;
		}
		
		private static function typeIndex(name:String):int
		{
			var typeArr:Array = ["Image","Bitmap","Image9","Label","Button","RadioButtonGroup",
				"RadioButton","DragBar","List","ScrollBar","Slider","ComboBox","Stepper","Container","Progress","FocusList"];
			for(var i:int = 0; i< typeArr.length; i++)
			{
				if(name.substr(0,typeArr[i].length) == typeArr[i])
				{
					return typeArr[i].length;
				}
			}
			/*test redo*/
			if(name.substr(0,2) == "SB")
				return 2;
			return -1;			
		}
		
		private static function parseFolder(skinData:ByteArray, folder:Object, tabCnt:int):void
		{
			var type:String = "Container";	
			var name:String = utils.replaceLayerName(folder.$folder.name);	
			if(name == "回收站") return;
			
			var ary:Array = parseName(name);
			if(ary[0] == "")
			{
				ary[0] = "Container";
			}
			type = ary[0];
			if(type == "Image")
			{
				parseImageFolder(skinData,ary[1], folder, tabCnt);
			}
			else if(type == "Image9")
			{
				var value:Array = [8,8,8,8,3,3];	//top right bottom left midWidth midHeight
				if(ary[2] != "")
				{
					var arr:Array = ary[2].split(",");
					for(var j:int = 0;j<6 && j<arr.length;j++)
					{
						value[j] = int(arr[j]);
					}
				}
				parseImage9Folder(skinData,ary[1], folder, tabCnt,value[0],value[1],value[2],value[3],value[4],value[5]);
			}
			else if(type == "Label")
			{
				parseLabelFolder(skinData,name, folder, tabCnt);
			}
			else
			{
				if(type == "DragBar")
				{
					var mul:int = name.lastIndexOf('x');
					var width:int = int(name.substr(0,mul));
					var height:int = int(name.substr(mul+1)); 
					folder.$folder.bounds.width = width;
					folder.$folder.bounds.height = height;
					folder.$folder.bounds.y -= height;
				}
				var bounds:Rectangle = folder.$folder.bounds;
				skinData.writeUTFBytes(formate(FMT_OPEN_CHILDREN,tabStr(tabCnt),ary[1],type,
					bounds.x, bounds.y, bounds.width, bounds.height));	
				for(var i:int = folder.$list.length - 1; i >= 0; i--)
				{
					if(folder.$list[i] is PSDLayer)
					{
						//redo
						parseLayer(skinData,folder.$list[i],tabCnt+2,new Rectangle(0,0,bounds.width,bounds.height));
					}
					else
					{
						parseFolder(skinData,folder.$list[i],tabCnt+2);
					}
				}
				skinData.writeUTFBytes(formate(FMT_CLOSE_CHILDREN,tabStr(tabCnt)));	
			}
		}
		
		/*
		private static function parseFolder(skinData:ByteArray, folder:Object, tabCnt:int):void
		{
			var type:String = "Container";	
			var name:String = utils.replaceLayerName(folder.$folder.name);	
			if(name == "回收站") return;

			var tIndex:int = typeIndex(name);
			if(tIndex != -1)
			{
				type = name.substr(0,tIndex);
				name = name.substring(tIndex);
				if(name == null || name == "")name = "my"+type;
				else if(name.charAt(0) == "_")name = name.substring(1);
			}

			if(type == "Image" || type == "Bitmap")
			{
				parseImageFolder(skinData,name, folder, tabCnt);
			}
			else if(type == "ScaleBitmap" || type == "SB")
			{
				var sepIndex:int = name.indexOf("_");

				var value:Array = [8,8,8,8,3,3];	//top right bottom left midWidth midHeight
				if(sepIndex != -1 || name.length > 0)
				{
					var dataStr:String = name.substring(sepIndex+1);
					var arr:Array = dataStr.split(",");
					for(var j:int = 0;j<6 && j<arr.length;j++)
					{
						value[j] = int(arr[j]);
					}
					
					name = name.substring(0,sepIndex);
				}
				parseImage9Folder(skinData,name, folder, tabCnt,value[0],value[1],value[2],value[3],value[4],value[5]);
			}
			else if(type == "Label")
			{
				parseLabelFolder(skinData,name, folder, tabCnt);
			}
			else
			{
				if(type == "DragBar")
				{
					var mul:int = name.lastIndexOf('x');
					var width:int = int(name.substr(0,mul));
					var height:int = int(name.substr(mul+1)); 
					folder.$folder.bounds.width = width;
					folder.$folder.bounds.height = height;
					folder.$folder.bounds.y -= height;
				}
				var bounds:Rectangle = folder.$folder.bounds;
				skinData.writeUTFBytes(formate(FMT_OPEN_CHILDREN,tabStr(tabCnt),name,type,
					bounds.x, bounds.y, bounds.width, bounds.height));	
				for(var i:int = folder.$list.length - 1; i >= 0; i--)
				{
					if(folder.$list[i] is PSDLayer)
					{
						//redo
						//parseLayer(skinData,folder.$list[i],i + 1,tabCnt+2,new Rectangle(0,0,bounds.width,bounds.height));
					}
					else
					{
						parseFolder(skinData,folder.$list[i],tabCnt+2);
					}
				}
				skinData.writeUTFBytes(formate(FMT_CLOSE_CHILDREN,tabStr(tabCnt)));	
			}
		}
*/
		
		private static function parseImageQuick(skinData:ByteArray, name:String, folder:Object, tabCnt:int):void
		{
			
		}
		
		private static function parseImageFolder(skinData:ByteArray, name:String, folder:Object, tabCnt:int):void
		{
			var bounds:Rectangle = folder.$folder.bounds;
			skinData.writeUTFBytes(formate(FMT_OPEN,tabStr(tabCnt),name,"Image",
				bounds.x, bounds.y, bounds.width, bounds.height));
			for(var i:int = folder.$list.length - 1; i >= 0; i--)
			{
				var fd = folder.$list[i];
				//if(fd is PSDLayer)continue;
				//parseImageLayer(skinData, fd.$list[0], fd.$folder.name, fd.$folder.bounds);		
				if(fd is PSDLayer)
				{
					var ary:Array = parseName(fd.name);	
					parseImageLayer(skinData, fd,tabCnt+1,ary[1],ary[2], fd.bounds);	
				}
			}	
			skinData.writeUTFBytes(formate(FMT_CLOSE,tabStr(tabCnt)));
		}
		
		private static function parseImage9Quick(skinData:ByteArray, name:String, layer:PSDLayer, tabCnt:int,top:int = 8,right:int = 8,bottom:int = 8,left:int = 8,midWidth:int = 3,midHeight:int = 3):void
		{
			var bounds:Rectangle = layer.bounds;
			skinData.writeUTFBytes(formate(FMT_OPEN,tabStr(tabCnt),name,"Image9",
				bounds.x, bounds.y, bounds.width, bounds.height));
			parseImage9Layer(skinData, layer,tabCnt + 1,name,top,right,bottom,left,midWidth,midHeight, "", layer.bounds);	
			skinData.writeUTFBytes(formate(FMT_CLOSE,tabStr(tabCnt)));
		}
		
		private static function parseImage9Folder(skinData:ByteArray, name:String, folder:Object, tabCnt:int,top:int = 8,right:int = 8,bottom:int = 8,left:int = 8,midWidth:int = 3,midHeight:int = 3):void
		{
			var bounds:Rectangle = folder.$folder.bounds;
			skinData.writeUTFBytes(formate(FMT_OPEN,tabStr(tabCnt),name,"Image9",
				bounds.x, bounds.y, bounds.width, bounds.height));
			for(var i:int = folder.$list.length - 1; i >= 0; i--)
			{
				var fd = folder.$list[i];
				if(fd is PSDLayer)
				{
					var ary:Array = parseName(fd.name);
					parseImage9Layer(skinData, fd,tabCnt + 1,ary[1],top,right,bottom,left,midWidth,midHeight, ary[2], fd.bounds);	
				}
			}	
			skinData.writeUTFBytes(formate(FMT_CLOSE,tabStr(tabCnt)));
		}
		
		private static function parseLabelFolder(skinData:ByteArray, name:String, folder:Object, tabCnt:int):void
		{
			var bounds:Rectangle = folder.$folder.bounds;
			skinData.writeUTFBytes(formate(FMT_OPEN,tabStr(tabCnt),name,"Label",
				bounds.x, bounds.y, bounds.width, bounds.height));
			for(var i:int = folder.$list.length - 1; i >= 0; i--)
			{
				if(folder.$list[i] is PSDLayer)
				{
					var fd = folder.$list[i];
					var ary = parseName(fd.name);
					parseLabelLayer(skinData, fd,tabCnt+1,ary[1],ary[2]);	
				}
			}	
			skinData.writeUTFBytes(formate(FMT_CLOSE,tabStr(tabCnt)));		
		}
		
		private static function parseLayer(skinData:ByteArray, layer:PSDLayer,tabCnt:int,rect:Rectangle = null,isQuick:Boolean = false):void
		{
			var ary:Array = parseName(utils.replaceLayerName(layer.name));
			var type:String = layer.rawData ? "Label":"Image";			
			if(ary[0] == "" || isQuick)
			{
				var x:int = isQuick ? 0 : layer.bounds.x;
				var y:int = isQuick ? 0 : layer.bounds.y;
				var width:int = layer.bounds.width;
				var height:int = layer.bounds.height;
				
				skinData.writeUTFBytes(formate(FMT_OPEN,tabStr(tabCnt),utils.replaceLayerName(ary[1]),type,
					x, y,width,height));
				if(type == "Label")
				{		
					parseLabelLayer(skinData, layer,tabCnt+1,ary[1],ary[2]);
				}
				else
				{
					parseImageLayer(skinData, layer,tabCnt+1,ary[1],ary[2],rect,isQuick);
				}
				
				skinData.writeUTFBytes(formate(FMT_CLOSE,tabStr(tabCnt)));
			}
			else
			{
				if(ary[0] == "Image9")
				{
					var value:Array = [8,8,8,8,3,3];	//top right bottom left midWidth midHeight
					if(ary[2] != "")
					{
						var arr:Array = ary[2].split(",");
						for(var j:int = 0;j<6 && j<arr.length;j++)
						{
							value[j] = int(arr[j]);
						}
					}
					parseImage9Quick(skinData,ary[1], layer, tabCnt,value[0],value[1],value[2],value[3],value[4],value[5]);
				}
				else
				{
					var bounds:Rectangle = layer.bounds;
					skinData.writeUTFBytes(formate(FMT_OPEN_CHILDREN,tabStr(tabCnt),ary[1],ary[0],
						bounds.x, bounds.y, bounds.width, bounds.height));	
					
					
					//layer.bounds.x = 0;
					//layer.bounds.y = 0;
					//快速模式只有一个图片，所以相对坐标是0
					parseLayer(skinData,layer,tabCnt+2,rect,true);
					//parseFolder(skinData,layer,tabCnt+2);
						
					
					skinData.writeUTFBytes(formate(FMT_CLOSE_CHILDREN,tabStr(tabCnt)));	
				}
			}
		}
		
		private static function parseImageLayer(skinData:ByteArray, layer:PSDLayer,tabCnt:int = 0, name:String = "",status:String = "normal",parentBounds:Rectangle = null,isQuick:Boolean = false):void
		{
			var bounds:Rectangle = parentBounds == null ? layer.bounds : parentBounds ;
			
			var x:int = isQuick ? 0 : bounds.x;
			var y:int = isQuick ? 0 : bounds.y;
			var width:int = bounds.width;
			var height:int = bounds.height;
			
			if(layer)skinData.writeUTFBytes(formate(FMT_IMAGE,
				tabStr(tabCnt),name,status,getImgName(utils.replaceLayerName(layer.name)), 
				x, y, width, height));			
		}	
		
		private static function recutImage9(name:String,width:int,height:int,top:int,right:int,bottom:int,left:int,midWidth:int,midHeight:int):void
		{
			var tmp:int = top;
			top = bottom;
			bottom = tmp;
			var path:String = _rawDirName + "/"+ _fileName + "/"  + name + ".png";
			
			var loader:Loader = new Loader();
			loader.load(new URLRequest(path));
			// 加监听
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE,completeHandler);
			loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			function ioErrorHandler(e:Event):void{
				recutImage9(name,width,height,top,right,bottom,left,midWidth,midHeight);
			}
			//stage.addChild(loader);
			function completeHandler(e:Event):void{
				var image:Bitmap = e.target.content;
				// 图片宽
				trace(image.width);
				// 图片高
				trace(image.height);
				
				//临时构建对象
				var midPixs:int = 3;
				var tmpBitmap:Bitmap=new Bitmap();
				var tmpBitmapData:BitmapData=new BitmapData(left+right+midWidth,top+bottom+midHeight,true,0x000000);
				var tmpRectangle:Array = [
					new Rectangle(0,0,left,bottom),
					new Rectangle(left,0,midWidth,bottom),
					new Rectangle(width - right,0,right,bottom),
					new Rectangle(width - right,bottom,right,midHeight),
					new Rectangle(width - right,height-top,right,top),
					new Rectangle(left,height-top,midWidth,top),
					new Rectangle(0,height-top,left,top),
					new Rectangle(0,bottom,left,midHeight),
					new Rectangle(left,bottom,midWidth,midHeight),
					
				];
				
				var tmpPoint:Array = [
					new Point(0,0),
					new Point(left,0),
					new Point(left+midWidth,0),
					new Point(left+midWidth,bottom),
					new Point(left+midWidth,bottom+midHeight),
					new Point(left,bottom+midHeight),
					new Point(0,bottom+midHeight),
					new Point(0,bottom),
					new Point(left,bottom)
					]
				//进行加载和复制
				for(var i:int = 0;i<9;i++)
				{
					tmpBitmapData.copyPixels(e.target.content.bitmapData,tmpRectangle[i],tmpPoint[i]);
				}
				tmpBitmap.bitmapData=tmpBitmapData;
				utils.writeFileAsync(path,PNGEncoder.encode(tmpBitmapData),onComplete);
			}
		}
				
		
		private static function onComplete(path:String,flag:Boolean):void
		{
			utils.print("写入九宫格图片：",path,flag?"成功":"失败");
		}
		
		private static function parseImage9Layer(skinData:ByteArray, layer:PSDLayer,tabCnt:int,name:String,top:int = 8,right:int = 8,bottom:int = 8,left:int = 8,midWidth:int = 3,midHeight:int = 3, status:String = "normal",parentBounds:Rectangle = null):void
		{
			var bounds:Rectangle = parentBounds == null ? layer.bounds : parentBounds ;
			if(layer)
			{
				//FMT_IMAGE9:String = '{0}{name = "{1}",status = "{2}",img="{3}",x={4},y={5},width={6},height={7},top={8},right={9},bottom={10},left={11},midWidth={12},midHeight={13}},\n';
				skinData.writeUTFBytes(formate(FMT_IMAGE9,
				tabStr(tabCnt), name,status,getImgName(utils.replaceLayerName(layer.name)), 
				bounds.x, bounds.y, bounds.width, bounds.height,top,right,bottom,left,midWidth,midHeight));	
				
				recutImage9(getImgName(utils.replaceLayerName(layer.name)),bounds.width,bounds.height,top,right,bottom,left,midWidth,midHeight);
			}
		}
		
		private static function parseLabelLayer(skinData:ByteArray, layer:PSDLayer,tabCnt:int = 0,name:String ="", status:String = "normal"):void
		{ 
			if(!layer)return;
			var size:int = 12;
			var bold:Boolean = false;
			var italic:Boolean = false;
			var r:int = 0;
			var g:int = 0;
			var b:int = 0;
			var font:int = 1;
			
			var arr:Array = layer.rawData.EngineDict.StyleRun.RunArray as Array
			if(arr && arr[0] && arr[0].StyleSheet) // && arr[0].StyleSheet[0] && arr[0].StyleSheet[0].StyleSheetData)
			{
				var format:Object = null;
				if(arr[0].StyleSheet.StyleSheetData)
				{
					format = arr[0].StyleSheet.StyleSheetData;
				}
				else if(arr[0].StyleSheet[0] && arr[0].StyleSheet[0].StyleSheetData)
				{
					format = arr[0].StyleSheet[0].StyleSheetData;
				}
				if(format)
				{
					if(format.hasOwnProperty("FontSize"))size = format.FontSize;
					if(layer.textTransfrom)size = size * Math.min(layer.textTransfrom.xx, layer.textTransfrom.yy); 
					if(format.hasOwnProperty("FauxBold"))bold = format.FauxBold;
					if(format.hasOwnProperty("FauxItalic"))italic = format.FauxItalic;
					if(format.hasOwnProperty("Font"))font = format.Font;
	
					if(format.hasOwnProperty("FillColor"))
					{
						r = Math.ceil(format.FillColor.Values[1]*255);
						g = Math.ceil(format.FillColor.Values[2]*255);
						b = Math.ceil(format.FillColor.Values[3]*255);
					}
				}
			}
			//var myPattern:RegExp = /sh/g; var str:String = "She sells seashells by the seashore."; trace(str.replace(myPattern, "sch")); 
			var myPattern:RegExp = /\r/g;
			skinData.writeUTFBytes(formate(FMT_LABEL,tabStr(tabCnt),name,status, layer.textContent.replace(myPattern,"\\r"), 
				layer.rawData.DocumentResources.FontSet[0].Name[font].replace("\ufeff",""), size,bold,italic,r,g,b));
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
		
		private static function formate(str:String, ...args):String
		{
			for(var i:int = 0; i<args.length; i++)
			{
				str = str.replace(new RegExp("\\{" + i + "\\}", "gm"), args[i]);
			}
			return str;
		}
		
		private static function tabStr(n:int):String
		{
			var str:String = "";
			var tab:String = "    ";
			for(var i:int = 0; i<n; i++)
			{
				str = str + tab;
			}
			return str;
		}			
	}
}