package com.PSDParser 
{
	import flash.display.BitmapData;
	import flash.display.BlendMode;
	import flash.filters.DropShadowFilter;
	import flash.filters.GlowFilter;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.utils.ByteArray;
	
	public class PSDLayer 
	{
		public static const LayerType_FOLDER_OPEN 	: String = "folder_open";
		public static const LayerType_FOLDER_CLOSED : String = "folder_closed";
		public static const LayerType_HIDDEN 		: String = "hidden";
		public static const LayerType_NORMAL 		: String = "normal";
		public static const FOLDER_CLOSE			:String	 = "</Layer group>";

		private var fileData				: ByteArray;
		
		public var bmp						: BitmapData;
		public var bounds					: Rectangle;
		public var position					: Point;
		public var name						: String;
		public var type						: String = LayerType_NORMAL;
		public var layerID					: uint;
		public var numChannels				: int;
		public var channelsInfo_arr			: Array;
		public var blendModeKey				: String;
		public var blendMode				: String;
		public var alpha					: Number;
		public var maskBounds				: Rectangle;
		public var maskBounds2				: Rectangle;	
		public var clippingApplied			: Boolean;
		public var isLocked					: Boolean;
		public var isVisible				: Boolean;
		public var pixelDataIrrelevant		: Boolean;
		public var nameUNI					: String; //layer unicode name		
		public var filters_arr				: Array; //filters array	
		
		public var typeTool					:TypeTool;	//扩展
		public var textTransfrom			:TextTransform;	//文本变换矩阵
		public var textContent				:String;	//文本内容
		public var rawData					:Object;	//原始数据对象
			
		public function PSDLayer(fileData:ByteArray) 
		{
			this.fileData = fileData;
			readLayerBasicInfo();	
		}
		

		private function readLayerBasicInfo() : void 
		{
			
			//------------------------------------------------------------- get bounds
			/*
			4 * 4 bytes.
			Rectangle containing the contents of the layer. Specified as top, left,
			bottom, right coordinates.
			*/
			bounds 		= readRect();
			position	= new Point(bounds.x, bounds.y);
			
			//------------------------------------------------------------- get num channels
			/*
			2 bytes.
			The number of channels in the layer.
			*/
			numChannels 	= fileData.readUnsignedShort(); //readShortInt
			
			//------------------------------------------------------------- get Layer channel info
			/*
			6 * number of channels bytes
			Channel information. Six bytes per channel.
			*/
			channelsInfo_arr		= new Array( numChannels );
			
			for ( var i:uint = 0; i < numChannels; ++i ) 
			{
				channelsInfo_arr[i] = new PSDChannelInfoVO(fileData);
			}
			
			//------------------------------------------------------------- get signature
			/*
			4 bytes.
			Blend mode signature. 
			*/
			var sig:String = fileData.readUTFBytes( 4 );
			if (sig != "8BIM") throw new Error("Invalid Blend mode signature: " + sig ); 

			//------------------------------------------------------------- get blend mode key
			/*
			4 bytes.
			Blend mode key.
			*/
			blendModeKey = fileData.readUTFBytes( 4 );

			//------------------------------------------------------------- get blend mode
			/*
			matches the flash blend mode to photoshop layer blen mode if match is found
			it the blend modes are not compatible "BlendMode.NORMAL is used" 
			*/
			blendMode = getBlendMode();
			
			//------------------------------------------------------------- get opacity
			/*
			1 byte.
			Opacity. 0 = transparent ... 255 = opaque
			*/
			var opacity:int = fileData.readUnsignedByte();
			
			//converts to more flash friendly alpha
			alpha = opacity/255;
			
			//------------------------------------------------------------- get clipping
			/*
			1 byte.
			Clipping. 0 (false) = base, 1 (true) = non-base
			 */
			clippingApplied = fileData.readBoolean();
			
			
			//------------------------------------------------------------- get flags
			/*
			1 byte.
			bit 0 = transparency protected 
			bit 1 = visible
			bit 2 = obsolete
			bit 3 = 1 for Photoshop 5.0 and later, tells if bit 4 has useful information;
			bit 4 = pixel data irrelevant to appearance of document
			*/
			var flags:uint = fileData.readUnsignedByte();
			
			//transparency protected 
			isLocked = ((flags&1) != 0);
			
			//visible
			isVisible = ((flags&2) == 0);
			
			//irrelevant
			if ((flags&3) != 0) pixelDataIrrelevant = (flags&4) != 0; //543
			
			// padding
			fileData.position += 1; 
			
			//----------------------------------------------------------------------------
			//------------------------------------------------------------- get extra data
			//----------------------------------------------------------------------------
			
			var extraSize	:uint = fileData.readUnsignedInt(); //561
			var pos			:int 	= fileData.position;
			var size		:int;

			//------------------------------------------------------------- get layer mask (564)
			parseLayerMaskData(fileData);
			
			//------------------------------------------------------------- get blending ranges (570)
			//parseLayerBlendingRanges( fileData );
			//skipping for now..
			var layerBlendingRangesSectionSize:uint = fileData.readUnsignedInt();
			fileData.position+=layerBlendingRangesSectionSize;
			
			//------------------------------------------------------------- get layer name (576)
			var nameObj:Object = readPascalStringObj();
			name = nameObj.str;
			
			
			//remember this position
			var prevPos:uint	= fileData.position;
			
			//----------------------------------------------------------------------------------
			//------------------------------------------------------------- read layer info tags
			//----------------------------------------------------------------------------------
			
			while (fileData.position - pos < extraSize) 
			{
				//------------------------------------------------------------- get signature
				sig = fileData.readUTFBytes(4);
				
				//check signature
				if (sig != "8BIM") throw new Error("layer information signature error");
				
				//------------------------------------------------------------- get layer tag
				/*
				4 bytes.
				Key: a 4-character code
				*/
				var tag:String = fileData.readUTFBytes(4); //readString(4)
				
				/*
				4 bytes.
				Length data below, rounded up to an even byte count.
				*/
				size = fileData.readInt();
				size = (size + 1) & ~0x01;
				
				//remember previous position
				prevPos = fileData.position;
				
				//trace ("tag = "+tag);
				
				switch (tag)
				{
					//------------------------------------------------------------- get layer ID
					case "lyid": layerID 	= fileData.readInt(); break;
					
					//------------------------------------------------------------- get layer divider section
					case "lsct": readLayerSectionDevider(); break;
					
					//------------------------------------------------------------- get layer unicode name
					//case "luni": nameUNI 	= fileData.readUTFBytes(size); break;
					case "luni": 
						var ii:int = fileData.readUnsignedInt();
						nameUNI 	= fileData.readMultiByte(ii*2, "unicodeFFFE"/*"unicode""shift-jis"*/); 
						name 	= nameUNI; 
						break;
					
					//------------------------------------------------------------- get layer effects
					case "lrFX": parseLayerEffects(); break;
					//读取文本工具信息
					case "tySh": readLayerTypeTool(); break;
					//读取文本工具信息	// Type tool object setting (Photoshop 6.0)
					case "TySh": readLayerTypeTool6_0(); break;	//未解析的其他标签：clbl infx knko lspf lclr shmd cust fxrp
				}
				
				fileData.position += prevPos + size - fileData.position;
			}
			
			fileData.position += pos + extraSize - fileData.position;
		}
		
		
		private function parseLayerEffects() :void
		{
			filters_arr = new Array();
			
			var version			:int = fileData.readShort(); //fileData.readShort( length 2)
			var numEffects		:int = fileData.readShort(); //fileData.readShort( length 2)
			var remainingSize	:int;
			
			for ( var i:uint = 0; i < numEffects; ++i ) 
			{
				
				var sig:String = fileData.readUTFBytes(4);
				
				//check signature
				if (sig != "8BIM") throw new Error("layer effect information signature error");
				
				//check effect ID
				var effID:String = fileData.readUTFBytes(4);
				
				switch (effID) 
				{
					case "cmnS":		//common state info
						//skip 
						/*
						4 Size of next three items: 7
						4 Version: 0
						1 Visible: always true
						2 Unused: always 0
						*/
						fileData.position+=11;	
						break;
					
					case "dsdw":		//drop shadow
						remainingSize 				= fileData.readInt(); 
						parseDropShadow(fileData,false);
						break;
					
					case "isdw":		//inner drop shadow
						remainingSize 				= fileData.readInt(); 
						parseDropShadow(fileData,true);
						break;
					
					case "oglw":		//outer glow
						remainingSize 				= fileData.readInt(); 
						parseGlow(fileData,false);
						break;
					
					case "iglw":		//inner glow
						remainingSize 				= fileData.readInt(); 
						parseGlow(fileData,true);
						break;
					
					
					default : 
						fileData.position+=remainingSize;
						return;
				}
				
			}
			filters_arr.reverse();
		}		
		
		//读取层文本信息工具
		private function readLayerTypeTool():void
		{
			typeTool = new TypeTool;
			// Version ( = 1)
			var version:int = fileData.readShort();
			if (version != 1) 
			{
				//trace("version error")
				return;
			}
			
			// 6 * 8 double precision numbers for the transform information
			var i:int = 0;
			for(i = 0; i < 6; i ++)
				typeTool.transform_info[i] = fileData.readDouble();
				
			/***********************************************************************/
			// Font information
			/***********************************************************************/
			// Version ( = 6)
			version = fileData.readShort();
			//if (version != 6) 
			//{
				//trace("version error")
				//return;
			//}
			// Count of faces
			typeTool.facesCount = fileData.readShort();
			var typeFace:TypeFace;
			var strLen:int;
			// The next 8 fields are repeated for each count specified above
			for (i = 0; i < typeTool.facesCount; i++ )
			{
				typeFace = new TypeFace;
				// Mark value
				typeFace.mark = fileData.readShort();
				
				// Font type data
				typeFace.font_type = fileData.readInt();
				
				// Pascal string of font name
				strLen = fileData.readByte();
				typeFace.font_name = fileData.readMultiByte(strLen, "cn-gb");
				
				// Pascal string of font family name
				strLen = fileData.readByte();
				typeFace.font_family_name = fileData.readMultiByte(strLen, "cn-gb");
				
				// Pascal string of font style name
				strLen = fileData.readByte();
				typeFace.font_style_name = fileData.readMultiByte(strLen, "cn-gb");
				
				// Script value
				typeFace.script = fileData.readShort();
				
				// Number of design axes vector to follow
				typeFace.number_axes_vector = fileData.readInt();
				typeFace.vector = [];
				
				// Design vector value
				for(var j:int = 0; j < typeFace.number_axes_vector; j ++)
					typeFace.vector[j] = fileData.readInt();
				
				typeTool.type_Face.push(typeFace);
			}
			
			
			/***********************************************************************/
			// Style information
			/***********************************************************************/
			// Count of styles
			typeTool.styles_count = fileData.readShort();

			// The next 10 fields are repeated for each count specified above
			var typeStyle:TypeStyle;
			for(i = 0; i < typeTool.styles_count; i ++)
			{
				typeStyle = new TypeStyle;
				// Mark value
				typeStyle.mark = fileData.readShort();

				// Face mark value
				typeStyle.face_mark = fileData.readShort();

				// Size value
				typeStyle.size = fileData.readInt();

				// Tracking value
				typeStyle.tracking = fileData.readInt();

				// Kerning value
				typeStyle.kerning = fileData.readInt();

				// Leading value
				typeStyle.leading = fileData.readInt();

				// Base shift value
				typeStyle.base_shift = fileData.readInt();

				// Auto kern on/off
				typeStyle.auto_kern = fileData.readBoolean();

				// Only present in version <= 5
				version = fileData.readByte();

				// Rotate up/down
				typeStyle.rotate = fileData.readBoolean();
				
				typeTool.typeStyle.push(typeStyle);
			}

			/***********************************************************************/
			// Text information
			/***********************************************************************/
			// Type value
			typeTool.type = fileData.readShort();

			// Scaling factor value
			typeTool.scaling_factor = fileData.readInt();

			// Sharacter count value
			typeTool.sharacter_count = fileData.readInt();

			// Horizontal placement
			typeTool.horz_place = fileData.readInt();

			// Vertical placement
			typeTool.vert_place = fileData.readInt();

			// Select start value
			typeTool.select_start = fileData.readInt();

			// Select end value
			typeTool.select_end = fileData.readInt();

			// Line count
			typeTool.lines_count = fileData.readShort();

			var typeLine:TypeLine;
			// The next 5 fields are repeated for each item in line count.
			for(i = 0; i < typeTool.lines_count; i ++)
			{
				typeLine = new TypeLine;
				// Character count value
				typeLine.char_count = fileData.readInt();

				// Orientation value
				typeLine.orientation = fileData.readShort();

				// Alignment value
				typeLine.alignment = fileData.readShort();

				// Actual character as a double byte character
				typeLine.actual_char = fileData.readShort();

				// Style value
				typeLine.style = fileData.readShort();
				
				typeTool.typeIine.push(typeLine);
			}

			/***********************************************************************/
			// Color information
			/***********************************************************************/
			// Color space value
		//	data->color = psd_stream_get_space_color(context);

			// Anti alias on/off
		//	data->anti_alias = psd_stream_get_bool(context);
			
		}
		
		private function readLayerTypeTool6_0():void
		{
			//Version ( =1 for Photoshop 6.0)
			var version:int = fileData.readShort();			
			
			//Transform: xx, xy, yx, yy, tx, and ty respectively.	length:6×8
			textTransfrom = new TextTransform();
			textTransfrom.xx = fileData.readDouble();
			textTransfrom.xy = fileData.readDouble();
			textTransfrom.yx = fileData.readDouble();
			textTransfrom.yy = fileData.readDouble();
			textTransfrom.tx = fileData.readDouble();
			textTransfrom.ty = fileData.readDouble();
			//fileData.position += 48;	//skip 跳过
			
			//Text version ( = 50 for Photoshop 6.0)
			version = fileData.readShort();
			//Descriptor version ( = 16 for Photoshop 6.0)
			version = fileData.readInt();
			//Text data
			
			// Unicode string: name from classID
			var length:int = fileData.readInt() * 2;
//			fileData.position += length;	//skip 跳过
			
			var classID:String = fileData.readMultiByte(length, "unicode");

			// classID: 4 bytes (length), followed either by string or (if length is zero) 4-
			// byte classID
			length = fileData.readInt();
			var key:String = fileData.readUTFBytes(4);
			// Gradient
			//psd_assert(key == 'Grdn');

			// Number of items in descriptor
			var number_items:int = fileData.readInt();
			var rootkey:String
			var keychar:String
			var type:String;
			var name_length:int;
			var name:String;
			var text_length:int;
			var text:String;
			while(number_items --)
			{
				length = fileData.readInt();
				if(length == 0)
					rootkey = fileData.readUTFBytes(4)
				else
				{
					rootkey = "";
					keychar = readString(length,fileData);
				}
				// Type: OSType key
				type = fileData.readUTFBytes(4);
				//trace(type,"tag type")
				switch(rootkey)
				{
					case 'Txt ':
						if (type != "TEXT")
						{
							break;
						}
						textContent = parseUnicodeString(fileData);
					break;
					default:
					
					switch(type)
					{
						case "enum":
						parseEnum(fileData);
						break;
						case "obj ":
							parseObject(fileData);
							break;
						case "Objc":
//							parseDescriptor(fileData)
							break;
						case "bool":
							fileData.position += 1;
							break;
						case "long":
						fileData.position += 4;
						break;
						case "tdta":	//解析原数据
						//trace("原数据begin", fileData.position );
						parseRawData(fileData);
						//trace("原数据end", fileData.position );
						break;
					}
			
					break;
				}
				rootkey = "";
			}
		}
		
		private function parseDescriptor(fileData:ByteArray):void {
			readUnicodeString(fileData)
			readStringOrID(fileData)
		}
		
		private function parseObject(fileData:ByteArray):void {
			var items:int = fileData.readInt();
			var osType:String;
			var name:String
			var classID:String
			var keyID:String
			var TypeID:String
			while(items--)
			{
				// Type: OSType key
				osType = fileData.readUTFBytes(4);
				switch(osType)
				{
					case 'prop':
						name = readUnicodeString(fileData)
						classID = readStringOrID(fileData)
						keyID =readStringOrID(fileData)
						break;
					case 'Clss':
						name = readUnicodeString(fileData)
						classID = readStringOrID(fileData)
						break;
					case 'Enmr':
						name = readUnicodeString(fileData)
						classID = readStringOrID(fileData)
						TypeID = readStringOrID(fileData)
						var enum:String = readStringOrID(fileData)
						break;
					case 'rele':
						name = readUnicodeString(fileData)
						classID = readStringOrID(fileData)
						fileData.position+=4;
						break;
					case 'Idnt':
						break;
					case 'indx':
						break;
					case 'name':
						break;
				}
			}
		}
		
		private function readUnicodeString(fileData:ByteArray):String {
			// Unicode string: name from classID
			var length:int = fileData.readInt() * 2;
			var classID:String = fileData.readMultiByte(length, "unicode");
			return classID;
		}
		
		private function readStringOrID(fileData:ByteArray):String {
			
			var length:int = fileData.readInt();
			var rootkey:String;
			var keychar:String;
			if(length == 0)
				rootkey = fileData.readUTFBytes(4)
			else
			{
				rootkey = "";
				keychar = readString(length,fileData);
			}
			return keychar||rootkey
		}
		
		private var strByteArray:ByteArray = new ByteArray;
		private static const READ_LEN:int = -1;
		private function parseUnicodeString(fileData:ByteArray,readLen:int=READ_LEN):String
		{
			strByteArray.clear();
			strByteArray.position = 0;
			var text_length:int = readLen==READ_LEN?fileData.readInt():readLen;
			var byteLow:uint;
			var byteHeight:uint;
			for (var i:int = 0; i < text_length; i++ )
			{
				byteHeight = fileData.readByte();
				byteLow = fileData.readByte();
				strByteArray.writeByte(byteLow);
				strByteArray.writeByte(byteHeight);
			}
			strByteArray.position = 0;
			return strByteArray.readMultiByte(text_length*2, "unicode");
		}
		private static const LT_FLAH:uint = 0x3C;			//	'<'符号	
		private static const GT_FLAH:uint = 0x3E;			//	'>'符号
		private static const SLASH_FLAH:uint = 0x2F;		//	'/'符号
		private static const SPLIT_FLAH:uint = 0x0A;		//	间隔（分割符）符号
		private static const VALUE_FLAH:uint = 0x20;		//	值（分割符）符号
		private static const TEXT_START_LEFT_BRACKETS_FLAH:uint = 0x28;	//	unicode文本内容开始左括号 '(' 标记符号
		private static const TEXT_START_RIGHT_BRACKETS_FLAH:uint = 0x29;//	unicode文本内容结束右括号 ')' 标记符号
		private static const ARRAY_START_LEFT_BRACKETS_FLAH:uint = 0x5B;//	数组开始 '[' 标记符号
		private static const ARRAY_START_RIGHT_BRACKETS_FLAH:uint = 0x5D;//	数组开始 ']' 标记符号
		private var rawDataTotalLength:int;
		private function parseRawData(fileData:ByteArray):void
		{
			var raws:ByteArray = new ByteArray;
			rawDataTotalLength = fileData.readInt();
			rawData = { };
			//trace("rawDataTotalLength begin", rawDataTotalLength,this.fileData.position);
			fileData.readBytes(raws,0,rawDataTotalLength);
			parseRawDataItem(raws,rawData);
		}
//		private var lt_flah_num:int;//<<标记计数	用于判断是否结束当前循环
//		private var gt_flah_num:int;//>>标记计数	用于判断是否结束当前循环
//		private var bytesString:String="";
		private function parseRawDataItem(fileData:ByteArray,object:Object):void
		{
			var item:Object;
			var text:String;
			var doWhile:Boolean = true;
			var byte:int;
			while (doWhile&&fileData.length>fileData.position)
			{
				//trace("parseRawDataItem",this.fileData.position)
				byte=fileData.readUnsignedByte();
//				bytesString+=String.fromCharCode(byte);
				switch(byte)
				{
					case LT_FLAH:
						if (fileData.readUnsignedByte() != LT_FLAH) continue;
//						lt_flah_num++;
						parseRawDataItem(fileData,item||object) 
						item = null;
					break;
					case SLASH_FLAH:
						var dataObject:Object=parseRawDataItemData(fileData);
//						if (dataObject.name == null) throw new Error("标签错误 格式错误");
						if (dataObject.name == null)continue;
						if(object.hasOwnProperty(dataObject.name))
						{
							if(object[dataObject.name] is Array &&object[dataObject.name].length)
							{
								object[dataObject.name].push(item=(dataObject.value!=null?dataObject.value:{ }) )
							}
							else
							{
								var array:Array=[];
								array.push(object[dataObject.name]);
								array.push(item=(dataObject.value!=null?dataObject.value:{ }) )
								object[dataObject.name]=array;
							}
						}
						else
						item=object[dataObject.name] =dataObject.value!=null?dataObject.value:{ };
					break;
					case GT_FLAH:
						if (fileData.readUnsignedByte() != GT_FLAH) continue;
//						gt_flah_num++;
//						if (gt_flah_num >= lt_flah_num)
//							return true;
						doWhile = false;
					break;
				}
			}
		}
		
		private function parseRawDataItemData(fileData:ByteArray):Object
		{
			var bytesItemName:ByteArray = new ByteArray;
			bytesItemName.clear();
			bytesItemName.position = 0;
			var byte:uint;
			var name:String = "";
			var value:Object;
			var doWhile:Boolean=true;
			while (doWhile&&fileData.position<fileData.length)
			{
				byte = fileData.readUnsignedByte();
				switch(byte)
				{
					case SPLIT_FLAH:	//是否遇到分割符标记
						//bytesItemName.position = 0;
						//name = bytesItemName.length?readString(bytesItemName.length, bytesItemName):null;
						doWhile = false;
					break;
					case VALUE_FLAH:	//值标记符
						byte = fileData.readUnsignedByte();
						if (TEXT_START_LEFT_BRACKETS_FLAH == byte)	//字符串数据
						{
							bytesItemName.position = 0;
							name = bytesItemName.length?readString(bytesItemName.length, bytesItemName):null;
							value = parseItemTextValue(fileData);
							doWhile = false;
						}
						else if(ARRAY_START_LEFT_BRACKETS_FLAH== byte)	//数组数据
						{
							bytesItemName.position = 0;
							name = bytesItemName.length?readString(bytesItemName.length, bytesItemName):null;
							value = parseItemArray(fileData);
							doWhile = false;
						}else if(LT_FLAH== byte)	//遇到 '<' 标记
						{
							byte = fileData.readUnsignedByte();
							fileData.position-=2;
							if(LT_FLAH== byte)
							{
								bytesItemName.position = 0;
								name = bytesItemName.length?readString(bytesItemName.length, bytesItemName):null;
								var data:Object={};
								parseRawDataItem(fileData,data)
								value = data;
								doWhile = false;
							}
							else
							{
								bytesItemName.position = 0;
								name = bytesItemName.length?readString(bytesItemName.length, bytesItemName):null;
								value = parseItemOtherValue(fileData);
								doWhile = false;
							}
						}
						else	//其他类型数据	( 数字 与 bool)
						{
							bytesItemName.position = 0;
							name = bytesItemName.length?readString(bytesItemName.length, bytesItemName):null;
							fileData.position--;
							value = parseItemOtherValue(fileData);
							doWhile = false;
						}
						
					break;
					default:
					break;
				}
				if(doWhile)
				bytesItemName.writeByte(byte);
			}
			bytesItemName.position = 0;
			name = bytesItemName.length?readString(bytesItemName.length, bytesItemName):null;
			//trace(name,"_________",value);
			return {name:name,value:value};
		}
		private function parseItemOtherValue(fileData:ByteArray):Object
		{
			var bytes:ByteArray = new ByteArray;
			var byte:uint;
			var byteBak:uint;
			while (fileData.length>fileData.position)
			{
				byte = fileData.readUnsignedByte();
				if (byte == SPLIT_FLAH)
				{
					break;
				}
				bytes.writeByte(byte);
			}
			bytes.position = 0;
			var value:Object;
			
			value = readString(bytes.length, bytes);
			if (value == "false" || value == "true")
			{
				value = value=="true";
			}
			else
			{
				value = Number(value);
			}
			return value;
		}
		private function parseItemTextValue(fileData:ByteArray):String
		{
			var bytesItemName:ByteArray = new ByteArray;
			var bytes:ByteArray = new ByteArray;
			var byte:uint;
			var byteBak:uint;
			while (true&&fileData.length>fileData.position)
			{
				byte = fileData.readUnsignedByte();
				if (byte == TEXT_START_RIGHT_BRACKETS_FLAH)
				{
					byteBak = byte;
					byte = fileData.readUnsignedByte()
					if (byte == SPLIT_FLAH)
					{
						break;
					}
					else
					{
						bytesItemName.writeByte(byteBak);
					}
				}
				else if (byte == SPLIT_FLAH)
				{
					break;
				}
				bytes.writeByte(byte);
			}
			bytes.position = 0;
			return parseRawDataItemTextString(bytes);
		}
		private function parseItemArray(fileData:ByteArray):Array
		{
			var bytes:ByteArray = new ByteArray;
			var byte:uint;
			var array:Array = [];
			var num:Number;
			var subObject:Object;
			var str:String = "";
			while (true&&fileData.length>fileData.position)
			{
				byte = fileData.readUnsignedByte();
				switch(byte)
				{
					case ARRAY_START_RIGHT_BRACKETS_FLAH:
						return array;
					break;
					case VALUE_FLAH:
						if (!bytes.length) continue;
						byte = fileData.readUnsignedByte();
						if(byte == LT_FLAH)	//的判断是否遇到 '<' 标记符
						{
							byte = fileData.readUnsignedByte();
							if(byte == LT_FLAH)
							{
								fileData.position-=2;
								var data:Object={};
								parseRawDataItem(fileData,data);
								array.push(data);
								continue;
							}
							else
							{
								fileData.position--;
								bytes.position = 0;
								num = Number(readString(bytes.length, bytes));
								array.push(num);
								bytes.clear();
								bytes.position = 0;
								continue;
							}
						}
						else
						{
							fileData.position--;
							bytes.position = 0;
							num = Number(readString(bytes.length, bytes));
							array.push(num);
							bytes.clear();
							str = "";
							bytes.position = 0;
							continue;
						}
						
					break;
					case SPLIT_FLAH:
						subObject = parseArrayInTags(fileData);
						array.push(subObject);
						return array;
					break;
				}
				str += String.fromCharCode(byte);
				bytes.writeByte(byte);
			}
			return array;
		}
		
		private function parseRawDataItemTextString(fileData:ByteArray):String
		{
			//ansi 无任何开头标记
			
			//FF FE 小头 unicode
			//FE FF 大头

			//EF BB BF   utf - 8
			if (fileData.length < 2) return readString(fileData.length, fileData);
			var byte:uint=fileData.readUnsignedByte();		
			if (byte==0xFF)	//判断是否是小头unicode
			{
				byte = fileData.readUnsignedByte();
				if (byte == 0xFE)
				{
					fileData.position = 0;
					return bigHeadUnicodeToUtf8String(fileData.length,fileData);
				}
				else
				{
					fileData.position = 0;
					return readString(fileData.length,fileData);
				}
			}
			else if (byte==0xFE)	//判断是否是大头unicode
			{
				byte = fileData.readUnsignedByte();
				if (byte == 0xFF)
				{
					fileData.position = 0;
					return smallHeadUnicodeToUtf8String(fileData);
				}
				else
				{
					fileData.position = 0;
					return readString(fileData.length,fileData);
				}
			}
			else if (byte==0xEF)	//判断是否utf - 8
			{
				if (fileData.readUnsignedByte() == 0xBB && fileData.readUnsignedByte() == 0xBF)
				{
					fileData.position = 0;
					return fileData.readUTFBytes(fileData.length);
				}
				else
				{
					fileData.position = 0;
					return readString(fileData.length,fileData);
				}
			}
			else
			{
				fileData.position = 0;
				return readString(fileData.length,fileData);
			}
			return "";
		}
		private function smallHeadUnicodeToUtf8String(fileData:ByteArray):String
		{
			strByteArray.clear();
			strByteArray.position = 0;
			var byteLow:uint;
			var byteHeight:uint;
			var bFlag:Boolean = fileData.length % 2==1;	//是否是单数
			for (var i:int = 0; i < uint(fileData.length/2); i++ )
			{
				byteHeight = fileData.readUnsignedByte();
				if (bFlag&&fileData.length-(i+1)*2==1)
				{
					strByteArray.writeByte(byteHeight);
					break;
				}
				
				byteLow = fileData.readUnsignedByte();
				strByteArray.writeByte(byteLow);
				strByteArray.writeByte(byteHeight);
			}
				strByteArray.position = 0;
			return strByteArray.readMultiByte(strByteArray.length, "unicode");
		}
		private function bigHeadUnicodeToUtf8String(length:int,fileData:ByteArray):String
		{
			return fileData.readMultiByte(length, "unicode");
		}
		private function parseArrayInTags(fileData:ByteArray):Object
		{
			var object:Object={};
			var bytes:ByteArray=new ByteArray;
			var byte:int;
			var byteBak:int;
			var arrayStartFlagNum:int=1;	//之前干掉了一个 ' [ ' 标记，所以先记录初始化为1
			var arrayEndFlagNum:int=0;		//' ] ' 标记数量
			var strAll:String="";
			
			while(fileData.length&&fileData.length>fileData.position)
			{
				byte=fileData.readUnsignedByte();
				if(byte==VALUE_FLAH)
				{
					byteBak=byte;
					byte=fileData.readUnsignedByte();
					if(byte==ARRAY_START_LEFT_BRACKETS_FLAH)
					{
						arrayStartFlagNum++
						//trace("arrayStartFlagNum",arrayStartFlagNum)
					}
					fileData.position--;
					byte=byteBak;
				}
				else if(byte==ARRAY_START_RIGHT_BRACKETS_FLAH)
				{
					byteBak=byte;	
					byte=fileData.readUnsignedByte();
					if(byte==SPLIT_FLAH)
					{
						arrayEndFlagNum++
							//trace("arrayEndFlagNum",arrayEndFlagNum)
						if (arrayEndFlagNum >= arrayStartFlagNum)
						{
							//trace(strAll)
							break;
						}
					}
					fileData.position--;
					byte=byteBak;
					
				}
				strAll+=String.fromCharCode(byte)
				bytes.writeByte(byte);
			}
			bytes.position=0;
			parseRawDataItem(bytes,object);
			return object;
		}
		private function parseEnum(fileData:ByteArray):void
		{
			//Length 		Description
			//Variable	Type: 4 bytes (length), followed either by string or (if length is zero) 4-byte typeID
			//Variable	Enum: 4 bytes (length), followed either by string or (if length is zero) 4 - byte enum
			
			var type:String;
			var enum:String
			var typeID:String;
			var length:int = fileData.readInt();
			if(length == 0)
				type = fileData.readUTFBytes(4)
			else
			{
				typeID = readString(length,fileData);
			}
			length = fileData.readInt();
			if(length == 0)
				type = fileData.readUTFBytes(4)
			else
			{
				enum = readString(length,fileData);
			}
		}
		
		private function parseGlow(fileData:ByteArray, inner:Boolean = false):void
		{
			//4 Size of the remaining items: 41 or 51 (depending on version)
			var ver				:int 	= fileData.readInt(); 			//0 (Photoshop 5.0) or 2 (Photoshop 5.5)
			var blur			:int 	= fileData.readShort();			//Blur value in pixels (8)
			var intensity		:int	= fileData.readInt();				//Intensity as a percent (10?) (not working)
			
			fileData.position+=4;											//2 bytes for space
			var color_r:int = fileData.readUnsignedByte();
			fileData.position+=1;	
			var color_g:int = fileData.readUnsignedByte();
			fileData.position+=1;							
			var color_b:int = fileData.readUnsignedByte();
			
			//color shoul be 0xFFFF6633
			var colorValue		:uint = color_r<< 16 | color_g << 8 | color_b;
			
			fileData.position+=3;	
			
			var blendSig:String = fileData.readUTFBytes( 4 );
			if (blendSig != "8BIM") throw new Error("Invalid Blend mode signature for Effect: " + blendSig ); 
			
			/*
			4 bytes.
			Blend mode key.
			*/
			var blendModeKey:String = fileData.readUTFBytes( 4 );
			
			var effectIsEnabled:Boolean = fileData.readBoolean();			//1 Effect enabled
			
			var alpha : Number		= fileData.readUnsignedByte() /255;	 					//1 Opacity as a percent
			
			if (ver == 2)
			{
				if (inner) var invert:Boolean = fileData.readBoolean();	
				
				//get native color
				fileData.position+=4;											//2 bytes for space
				color_r = fileData.readUnsignedByte();
				fileData.position+=1;	
				color_g = fileData.readUnsignedByte();
				fileData.position+=1;							
				color_b = fileData.readUnsignedByte();
				fileData.position+=1;	
				
				var nativeColor		:uint = color_r<< 16 | color_g << 8 | color_b;
			}
			
			if (effectIsEnabled)
			{
				var glowFilter:GlowFilter	= new GlowFilter();
				glowFilter.alpha 			= alpha;
				glowFilter.blurX 			= blur;
				glowFilter.blurY 			= blur;
				glowFilter.color 			= colorValue;
				glowFilter.quality 			= 4;
				glowFilter.strength			= 1; //intensity isn't being passed correctly;
				glowFilter.inner 			= inner;
				
				filters_arr.push(glowFilter);
			}
		}		
		
		private function parseDropShadow(fileData:ByteArray, inner:Boolean = false):void
		{
						//4 Size of the remaining items: 41 or 51 (depending on version)
			var ver				:int 	= fileData.readInt(); 			//0 (Photoshop 5.0) or 2 (Photoshop 5.5)
			var blur			:int 	= fileData.readShort();			//Blur value in pixels (8)
			var intensity		:int 	= fileData.readInt();				//Intensity as a percent (10?)
			var angle			:int 	= fileData.readInt();				//Angle in degrees		(120)
			var distance		:int 	= fileData.readInt();				//Distance in pixels		(25)
			
			fileData.position+=4;											//2 bytes for space
			var color_r:int = fileData.readUnsignedByte();
			fileData.position+=1;	
			var color_g:int = fileData.readUnsignedByte();
			fileData.position+=1;							
			var color_b:int = fileData.readUnsignedByte();
			
			//color shoul be 0xFFFF6633
			var colorValue		:uint = color_r<< 16 | color_g << 8 | color_b;
			
			fileData.position+=3;	
			
			var blendSig:String = fileData.readUTFBytes( 4 );
			if (blendSig != "8BIM") throw new Error("Invalid Blend mode signature for Effect: " + blendSig ); 
			
			/*
			4 bytes.
			Blend mode key.
			*/
			var blendModeKey:String = fileData.readUTFBytes( 4 );
			
			var effectIsEnabled:Boolean = fileData.readBoolean();			//1 Effect enabled
			
			var useInAllEFX:Boolean = fileData.readBoolean();				//1 Use this angle in all of the layer effects
			
			var alpha : Number		= fileData.readUnsignedByte() /255;	 					//1 Opacity as a percent
			
			//get native color
			fileData.position+=4;											//2 bytes for space
			color_r = fileData.readUnsignedByte();
			fileData.position+=1;	
			color_g = fileData.readUnsignedByte();
			fileData.position+=1;							
			color_b = fileData.readUnsignedByte();
			fileData.position+=1;	
			
			var nativeColor		:uint = color_r<< 16 | color_g << 8 | color_b;
			
			if (effectIsEnabled)
			{
				var dropShadowFilter:DropShadowFilter = new DropShadowFilter();
				dropShadowFilter.alpha 		= alpha;
				dropShadowFilter.angle 		= 180 - angle;
				dropShadowFilter.blurX 		= blur;
				dropShadowFilter.blurY 		= blur;
				dropShadowFilter.color 		= colorValue;
				dropShadowFilter.quality 	= 4;
				dropShadowFilter.distance 	= distance;
				dropShadowFilter.inner 		= inner;
				dropShadowFilter.strength	= 1;
				
				filters_arr.push(dropShadowFilter);
				
				if (filters_arr.length == 2)
				{
					filters_arr.reverse();
				}
			}
		}		
		
		private function readRect():Rectangle
		{
			var y 		: int = fileData.readInt();
			var x 		: int = fileData.readInt();
			var bottom 	: int = fileData.readInt();
			var right 	: int = fileData.readInt();
			
			return new Rectangle(x,y,right-x, bottom-y);
		}
		
		private function readLayerSectionDevider() :void
		{
			var dividerType : int = fileData.readInt();
			
			switch (dividerType) 
			{
				case 0: type = LayerType_NORMAL;	 		break;
				case 1: type = LayerType_FOLDER_OPEN; 		break;
				case 2: type = LayerType_FOLDER_CLOSED; 	break; 
				case 3: type = LayerType_HIDDEN;			break;
			}
		}		

		//returns the read value and its length in format {str:value, length:size}
		private function readPascalStringObj():Object
		{
			var size:uint = fileData.readUnsignedByte();
			size += 3 - size % 4;
			return  {str:fileData.readMultiByte( size, "cn-gb"/*"shift-jis"*/).toString(), length:size + 1};
		}
		
		private function readString(length:int,fileData:ByteArray):String
		{
			return  fileData.readMultiByte( length, "cn-gb"/*"shift-jis"*/);
		}


		public function getBlendMode():String
		{
			switch(blendModeKey)
			{
				case "lddg" : return BlendMode.ADD ;
				case "dark" : return BlendMode.DARKEN ;
				case "diff" : return BlendMode.DIFFERENCE ;
				case "hLit" : return BlendMode.HARDLIGHT ;
				case "lite" : return BlendMode.LIGHTEN ;
				case "mul " : return BlendMode.MULTIPLY ;
				case "over" : return BlendMode.OVERLAY ;
				case "scrn" : return BlendMode.SCREEN ;
				case "fsub" : return BlendMode.SUBTRACT ;
				default 	: return BlendMode.NORMAL; 
			}
		}
		
			
			
		
		private function parseLayerMaskData( stream:ByteArray ):void 
		{
			//-------------------------------------------------------------  READING LAYER MASK
			/*
			4 bytes.
			Size of the data: 36, 20, or 0.
			If zero, the following fields are not present
			*/
			var maskSize:uint = stream.readUnsignedInt();
			
			if (!(maskSize == 0 || maskSize ==  20 || maskSize == 36))
			{
				throw new Error ("Invalid mask size");
			}	
			
			if ( maskSize > 0 ) 
			{
				maskBounds2 = readRect();
				var defaultColor	: uint = stream.readUnsignedByte(); //readTinyInt
				var flags			: uint = stream.readUnsignedByte();	//readBits(1)
				
				if (maskSize == 20)
				{
					var maskPadding:int = stream.readInt(); //723 (readShortInt)
				}
				else
				{
					var realFlags:uint 			= stream.readUnsignedByte();
					var realUserMaskBack:uint 	= stream.readUnsignedByte();
					maskBounds				= readRect();
				}
				//stream.position += 2; // padding
			}
		}	
		//是否是text类型
		public function isTextLayer():Boolean
		{
			return rawData != null;
		}
		//获取text样式
		public function getTextStyleSheet():Object
		{
			/*	结构体包含以下信息
				AutoKerning = true	
				AutoLeading = false	  是否自动行间距
				BaselineDirection = 2	
				BaselineShift = 0	
				DLigatures = false	
				FauxBold = false	
				FauxItalic = false	
				FillColor = Object (@214f0b1)	
					Type = 1	
				Values = Array (@288ff91)	
					[0] = 1	
					[1] = 0.49805	
					[2] = 0.49805	
					[3] = 0.49805	
					length = 4	
				FillFirst = false	
				FillFlag = true	
				Font = 0	
				FontBaseline = 0	
				FontCaps = 0	
				FontSize = 78 [0x4e]	
				HorizontalScale = 1	
				Kerning = 0	
				Language = 0	
				Leading = 111 [0x6f]	行间距
				Ligatures = false	
				NoBreak = false	
				OutlineWidth = 154.69221	
				Strikethrough = false	
				StrokeColor = Object (@214f179)	
					Type = 1	
				Values = Array (@288ffc9)	
					[0] = 1	
					[1] = 0	
					[2] = 0	
					[3] = 0	
					length = 4	
				StrokeFlag = false	
				StyleRunAlignment = 2	
				Tracking = 33 [0x21]	
				Tsume = 0	
				Underline = false	下划线
				VerticalScale = 1	
				YUnderline = 1	
			*/
			if(rawData==null)return null;
			var EngineDict:Object=getObjectByKeyName(rawData,"EngineDict");
			if(EngineDict==null)return null;
			var StyleRun:Object=getObjectByKeyName(EngineDict,"StyleRun");
			if(StyleRun==null)return null;
			var RunArray:Object=getObjectByKeyName(StyleRun,"RunArray");
			if(RunArray==null)return null;
			var StyleSheetData:Object=getObjectByKeyName(RunArray,"StyleSheetData");
			if(StyleSheetData==null)return null;
			
			
			return StyleSheetData;
//			return rawData?getObjectByKeyName(rawData.EngineDict.StyleRun.RunArray[0],"StyleSheetData"):null;
//			return rawData?rawData.EngineDict.StyleRun.RunArray[0].StyleSheet.StyleSheetData:null;
		}
		
		public function getFontNameList():Array
		{
			if(rawData==null)return null;
			var ResourceDict:Object=getObjectByKeyName(rawData,"ResourceDict");
			if(ResourceDict==null)return null;
			var FontSet:Object=getObjectByKeyName(ResourceDict,"FontSet");
			if(FontSet==null)return null;
			var Name:Object=getObjectByKeyName(FontSet,"Name");
			if(Name==null)return null;
			return Name as Array;
		}
		
		public function getObjectByKeyName(object:Object,keyName:String):Object
		{
			var obj:Object;
			for(var i:String in object)
			{
				if(i==keyName)
				{
					return object[i];
				}
				else
				{
					obj=getObjectByKeyName(object[i],keyName);
					if(obj!=null)
					{
						return obj;
					}
				}
			}
			return null;
		}
	}
}
//jason
class TextTransform
{
	/*
	|xx xy 0|	
	|yx yy 0|
	|tx ty 1|
	xx,yy 缩放
	xy,yx 旋转
	tx,ty 平移
	2D变幻：原坐标设为（X,Y,1）;
			|xx xy 0|	
	[X,Y,1] |yx yy 0| =  [xx*X + yx*Y + tx ,  xy*X + yy*Y + ty,  1] 	
			|tx ty 1|
	*/

	public var xx:Number;
	public var xy:Number;
	public var yx:Number;
	public var yy:Number;
	public var tx:Number;
	public var ty:Number;
}
class TypeTool
{
	public var transform_info:Array = new Array(6);	
	public var facesCount:int;
	public var type_Face:Vector.<TypeFace> = new Vector.<TypeFace>();
	public var styles_count:int
	public var typeStyle:Vector.<TypeStyle> = new Vector.<TypeStyle>();
	
	public var type:int;
	public var scaling_factor:int;
	public var sharacter_count:int;
	public var horz_place:int;
	public var vert_place:int;
	public var select_start:int;
	public var select_end:int;
	public var lines_count:int;
	public var typeIine:Vector.<TypeLine> = new Vector.<TypeLine>();
	
}
class TypeFace
{
	public var mark:int;					// Mark value
	public var font_type:int;				// Font type data
	public var font_name:String;			// Pascal string of font name
	public var font_family_name:String;		// Pascal string of font family name
	public var font_style_name:String;		// Pascal string of font style name
	public var script:int;					// Script value
	public var number_axes_vector:int;		// Number of design axes vector to follow
	public var vector:Array;				// Design vector value
}

class TypeStyle
{
	public var mark:int;					// Mark value
	public var face_mark:int;				// Face mark value
	public var size:int;					// Size value
	public var tracking:int;				// Tracking value
	public var kerning:int;				// Kerning value
	public var leading:int;					// Leading value
	public var base_shift:int;				// Base shift value
	public var auto_kern:Boolean;				// Auto kern on/off
	public var rotate:Boolean;				// Rotate up/down
}

class TypeLine
{
	public var char_count:int;				// Character count value
	public var orientation:int;				// Orientation value
	public var alignment:int;				// Alignment value
	public var actual_char:int;				// Actual character as a double byte character
	public var style:int;					// Style value
}