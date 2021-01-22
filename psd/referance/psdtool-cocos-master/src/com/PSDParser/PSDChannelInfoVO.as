package com.PSDParser 
{
	import flash.utils.ByteArray;

	public class PSDChannelInfoVO 
	{
		public var id : int;
		public var length : uint;

		public function PSDChannelInfoVO(fileData : ByteArray) 
		{
			id 		= fileData.readShort();
			length 	= fileData.readUnsignedInt();			
		}
	}
}
