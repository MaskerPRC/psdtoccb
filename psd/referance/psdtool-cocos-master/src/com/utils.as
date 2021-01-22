package com
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	import flash.utils.ByteArray;
	
	import mx.controls.List;

	public class utils
	{
		public static function warpImgName(file:String,dir:String,addFile:Boolean,addDir:Boolean,img:String):String					
		{
			var ret:String = img;
			if(addFile)ret = file + "." + ret;
			if(addDir)ret = dir + "." + ret;
			return ret;			
		}
		public static function replaceLayerName(layerName:String):String
		{
			layerName=layerName.replace(/\s\副本.*$/i,'');
			layerName=layerName.replace("图层",'rn_layer');	//rename
			layerName=layerName.replace("背景",'rn_background');
			layerName=layerName.replace(/ /g,'');
			return 	layerName;
		}
		
		public static function replaceLayerCopyName(layerName:String):String
		{
			return layerName.replace(/\s\副本.*$/i,'');
		}
		
		private static var fileStream:FileStream=new FileStream;
		private static var file:File=new File
		public static function writeFile(savePath:String,bytes:ByteArray):Boolean
		{
			file.nativePath=savePath;
			bytes.position=0;
			try
			{
				fileStream.open(file,FileMode.WRITE);
				fileStream.writeBytes(bytes)
			}
			catch(e:Error)
			{
				return false;
			}
			fileStream.close();
			return true;
		}
		public static function readFile(readPath:String,bytes:ByteArray):Boolean
		{
			file.nativePath=readPath;
			bytes.position=0;
			try
			{
				fileStream.open(file,FileMode.READ);
				fileStream.readBytes(bytes)
			}
			catch(e:Error)
			{
				return false;
			}
			fileStream.close();
			return true;
		}
		private static var writeFileList:Array=[];
		private static var fileStreamAsync:FileStream=new FileStream;
		private static var nowWrite:Array;
		
		/**
		 * 异步写文件
		 * @param savePath
		 * @param bytes
		 * @param callBack(filePath:String,flag:Boolean)
		 * 
		 */
		public static function writeFileAsync(savePath:String,bytes:ByteArray,callBack:Function):void
		{
			if(!fileStreamAsync.hasEventListener(IOErrorEvent.IO_ERROR))
				fileStreamAsync.addEventListener(IOErrorEvent.IO_ERROR,function(e:IOErrorEvent):void{
					trace(e)
				});
			if(!fileStreamAsync.hasEventListener(Event.CLOSE))
				fileStreamAsync.addEventListener(Event.CLOSE,onWriteFileAsyncComplete);
			writeFileList.push([savePath,bytes,callBack]);
			doWriteFileAsync(writeFileList);
		}
		
		public static function writeXmlAsync(savePath:String, data:String, callBack:Function):void
		{
			if(!fileStreamAsync.hasEventListener(IOErrorEvent.IO_ERROR))
				fileStreamAsync.addEventListener(IOErrorEvent.IO_ERROR,function(e:IOErrorEvent):void{
					trace(e)
				});
			if(!fileStreamAsync.hasEventListener(Event.CLOSE))
				fileStreamAsync.addEventListener(Event.CLOSE,onWriteFileAsyncComplete);
			writeFileList.push([savePath, data, callBack]);
			doWriteFileAsync(writeFileList);
		}
		
		private static function doWriteFileAsync(writeFileList:Array):void
		{
			if(!writeFileList.length||nowWrite)return;
			var data:Array=writeFileList.shift();
			nowWrite=data;
			file.nativePath=data[0];
			if(data[1] is ByteArray)
			{
				data[1].position=0;
				try
				{
					fileStreamAsync.openAsync(file,FileMode.WRITE);
					fileStreamAsync.writeBytes(data[1]);
				}
				catch(e:Error)
				{
					var callback:Function=nowWrite[2];
					callback(nowWrite[0],false)
					nowWrite=null;
					doWriteFileAsync(writeFileList);
				}
			}
			else if(data[1] is String)
			{
				try
				{
					fileStreamAsync.openAsync(file,FileMode.WRITE);
					fileStreamAsync.writeUTFBytes(data[1]);
				}
				catch(e:Error)
				{
					var callback0:Function=nowWrite[2];
					callback0(nowWrite[0],false)
					nowWrite=null;
					doWriteFileAsync(writeFileList);
				}
			}
			fileStreamAsync.close();
			
		}
		
		private static function onWriteFileAsyncComplete(e:Event):void
		{
			var callback:Function=nowWrite[2];
			if(callback != null) callback(nowWrite[0],true)
			nowWrite=null;
			fileStreamAsync.close();
			doWriteFileAsync(writeFileList);
		}
		
		
		public static function print(...arg):void
		{
			UITool.print.apply(null,arg);
		}
	}
}