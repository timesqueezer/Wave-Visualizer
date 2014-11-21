function ByteStreamLittleEndian(bytes)
{
	this.bytes = bytes;  

	this.numberOfBytesTotal = this.bytes.length;
	this.byteIndexCurrent = 0;
}
{
	var prototype = ByteStreamLittleEndian.prototype;

	prototype.peekBytes = function(numberOfBytesToRead)
	{
		var returnValue = [];

		for (var b = 0; b < numberOfBytesToRead; b++)
		{
			returnValue[b] = this.bytes[this.byteIndexCurrent + b];
		}

		return returnValue;
	}

	prototype.readBytes = function(numberOfBytesToRead)
	{
		var returnValue = [];

		for (var b = 0; b < numberOfBytesToRead; b++)
		{
			returnValue[b] = this.readByte();
		}

		return returnValue;
	}

	prototype.readByte = function()
	{
		var returnValue = this.bytes.charCodeAt(this.byteIndexCurrent);

		this.byteIndexCurrent++;

		return returnValue;
	}

	prototype.readInt = function()
	{
		var returnValue =
		(
			(this.readByte() & 0xFF)
			| ((this.readByte() & 0xFF) << 8 )
			| ((this.readByte() & 0xFF) << 16)
			| ((this.readByte() & 0xFF) << 24)
		);

		return returnValue;
	}

	prototype.readShort = function()
	{
		var returnValue =
		(
			(this.readByte() & 0xFF)
			| ((this.readByte() & 0xFF) << 8 )
		);

		return returnValue;
	}
}

function Coords(x, y)
{
	this.x = x;
	this.y = y;
}
{
	var prototype = Coords.prototype;

	prototype.clone = function()
	{
		return new Coords(this.x, this.y);
	}

	prototype.divideScalar = function(scalar)
	{
		this.x /= scalar;
		this.y /= scalar;

		return this;
	}
}

function Viewport(name, size)
{
	this.name = name;
	this.size = size;
	this.sizeHalf = this.size.clone().divideScalar(2);
}

function WavFile
(
	filePath,
	samplingInfo,
	samplesForChannels
)
{
	this.filePath = filePath;
	this.samplingInfo = samplingInfo;
	this.samplesForChannels = samplesForChannels;

	 // hack
	if (this.samplingInfo == null)
	{
		this.samplingInfo = SamplingInfo.buildDefault();
	}

	if (this.samplesForChannels == null)
	{
		var numberOfChannels = this.samplingInfo.numberOfChannels; 

		this.samplesForChannels = [];
		for (var c = 0; c < numberOfChannels; c++)
		{
			this.samplesForChannels[c] = [];
		}
	}
}
{
	WavFile.BitsPerByte = 8;
	WavFile.NumberOfBytesInRiffWaveAndFormatChunks = 36;

	var prototype = WavFile.prototype;

	// static methods

	WavFile.readFromFile = function(fileToReadFrom)
	{		
		var returnValue = new WavFile(fileToReadFrom.name, null, null);

		var fileReader = new FileReader();
		fileReader.onloadend = function(fileLoadedEvent)
		{
			if (fileLoadedEvent.target.readyState == FileReader.DONE)
			{
				var bytesFromFile = fileLoadedEvent.target.result;
				var reader = new ByteStreamLittleEndian(bytesFromFile);

				returnValue.readFromFilePath_ReadChunks(reader);
			}
            
            Globals.Instance.visualizer.loadFileAndVisualize_LoadComplete(returnValue);
		}

		fileReader.readAsBinaryString(fileToReadFrom);
	}

	prototype.readFromFilePath_ReadChunks = function(reader)
	{
		var riffStringAsBytes = reader.readBytes(4);		  

		var numberOfBytesInFile = reader.readInt();

		var waveStringAsBytes = reader.readBytes(4);

		this.readFromFile_ReadChunks_Format(reader);
		this.readFromFile_ReadChunks_Data(reader);
	}

	prototype.readFromFile_ReadChunks_Format = function(reader)
	{
		var fmt_StringAsBytes = reader.readBytes(4);
		var chunkSizeInBytes = reader.readInt();
		var formatCode = reader.readShort();

		var numberOfChannels = reader.readShort();
		var samplesPerSecond = reader.readInt();

		var bytesPerSecond = reader.readInt();
		var bytesPerSampleMaybe = reader.readShort();
		var bitsPerSample = reader.readShort();

		var samplingInfo = new SamplingInfo
		(
			"[from file]",
			chunkSizeInBytes,
			formatCode,
			numberOfChannels,
			samplesPerSecond,
			bitsPerSample	
		);

		this.samplingInfo = samplingInfo;
	}

	prototype.readFromFile_ReadChunks_Data = function(reader)
	{
		var dataStringAsBytes = reader.readBytes(4);
		var subchunk2SizeInBytes = reader.readInt();

		var samplesForChannelsMixedAsBytes = reader.readBytes(subchunk2SizeInBytes);

		var samplesForChannels = Sample.buildManyFromBytes
		(
			this.samplingInfo,
			samplesForChannelsMixedAsBytes
		);

		this.samplesForChannels = samplesForChannels;	
	}

	// instance methods

	prototype.durationInSamples = function()
	{
		var returnValue = 0;
		if (this.samplesForChannels != null)
		{
			if (this.samplesForChannels.length > 0)
			{
				returnValue = this.samplesForChannels[0].length;
			}
		}

		return returnValue;		
	}

	prototype.durationInSeconds = function()
	{
		return this.durationInSamples() / this.samplingInfo.samplesPerSecond;
	}

	prototype.extendOrTrimSamples = function(numberOfSamplesToExtendOrTrimTo)
	{
		var numberOfChannels = this.samplingInfo.numberOfChannels;
		var samplesForChannelsNew = [];

		for (var c = 0; c < numberOfChannels; c++)
		{
			var samplesForChannelOld = this.samplesForChannels[c];
			var samplesForChannelNew = new Sample[numberOfSamplesToExtendOrTrimTo];

			for (var s = 0; s < samplesForChannelOld.length && s < numberOfSamplesToExtendOrTrimTo; s++)
			{
				samplesForChannelNew[s] = samplesForChannelOld[s];				
			}

			var samplePrototype = this.samplingInfo.samplePrototype();

			for (var s = samplesForChannelOld.length; s < numberOfSamplesToExtendOrTrimTo; s++)
			{
				samplesForChannelNew[s] = samplePrototype.build();
			}

			samplesForChannelsNew[c] = samplesForChannelNew;
		}

		this.samplesForChannels = samplesForChannelsNew;
	}

	// inner classes

	function Sample()
	{
		// do nothing
	}
	{
		var prototype = Sample.prototype;

		prototype.build = function(){}
		prototype.setFromBytes = function(valueAsBytes){}
		prototype.setFromDouble = function(valueAsDouble){}
		prototype.convertToBytes = function(){}
		prototype.convertToDouble = function(){}

	   	Sample.buildManyFromBytes = function
		(
			samplingInfo,
			bytesToConvert
		)
		{
			var numberOfBytes = bytesToConvert.length;

			var numberOfChannels = samplingInfo.numberOfChannels;

			var returnSamples = [];

			var bytesPerSample = samplingInfo.bitsPerSample / WavFile.BitsPerByte;

			var samplesPerChannel =
				numberOfBytes
				/ bytesPerSample
				/ numberOfChannels;

			for (var c = 0; c < numberOfChannels; c++)
			{
				returnSamples[c] = [];
			}

			var b = 0;

			var halfMaxValueForEachSample = Math.pow
			(
				2, WavFile.BitsPerByte * bytesPerSample - 1
			);

			var samplePrototype = samplingInfo.samplePrototype();

			var sampleValueAsBytes = [];

			for (var s = 0; s < samplesPerChannel; s++)
			{				
				for (var c = 0; c < numberOfChannels; c++)
				{
					for (var i = 0; i < bytesPerSample; i++)
					{
						sampleValueAsBytes[i] = bytesToConvert[b];
						b++;
					}

					returnSamples[c][s] = samplePrototype.build().setFromBytes
					(
						sampleValueAsBytes
					);
				}
			}

			return returnSamples;
		}

		prototype.convertManyToBytes = function
		(
			samplesToConvert,
			samplingInfo
		)
		{
			var returnBytes = null;

			var numberOfChannels = samplingInfo.numberOfChannels;

			var samplesPerChannel = samplesToConvert[0].length;

			var bitsPerSample = samplingInfo.bitsPerSample;

			var bytesPerSample = bitsPerSample / WavFile.BitsPerByte;

			var numberOfBytes =
				numberOfChannels
				* samplesPerChannel
				* bytesPerSample;

			returnBytes = [];

			var halfMaxValueForEachSample = Math.pow
			(
				2, WavFile.BitsPerByte * bytesPerSample - 1
			);

			var b = 0;

			for (var s = 0; s < samplesPerChannel; s++)
			{
				for (var c = 0; c < numberOfChannels; c++)
				{
					var sample = samplesToConvert[c][s];	

					var sampleAsBytes = sample.convertToBytes();

					for (var i = 0; i < bytesPerSample; i++)
					{
						returnBytes[b] = sampleAsBytes[i];
						b++;
					}
				}						
			}

			return returnBytes;
		}	
	}

	function Sample16(value)
	{
		this.value = value;
	}
	{
		Sample16.MaxValue = Math.pow(2, 15) - 1;
		Sample16.DoubleMaxValue = Math.pow(2, 16);

		var prototype = Sample16.prototype;

		// Sample members
		prototype.build = function()
		{
			return new Sample16(0);
		}

		prototype.setFromBytes = function(valueAsBytes)
		{
			this.value =
			(
				(valueAsBytes[0] & 0xFF)
				| ((valueAsBytes[1] & 0xFF) << 8 )
			);

			if (this.value > Sample16.MaxValue) 
			{
				this.value -= Sample16.DoubleMaxValue;
			}

			return this;
		}

		prototype.setFromDouble = function(valueAsDouble)
		{
			this.value =
			(
				valueAsDouble * Sample16.MaxValue
			);

			return this;
		}

		prototype.convertToBytes = function()
		{
			return new Array()
			{
				((this.value) & 0xFF),
				((this.value >>> 8 ) & 0xFF)
			};
		}		

		prototype.convertToDouble = function()
		{
			return 1.0 * this.value / Sample16.MaxValue;
		}
	}

	function Sample24(value)
	{
		this.value = value;
	}
	{
		Sample24.MaxValue = Math.pow(2, 23) - 1;
		Sample24.DoubleMaxValue = Math.pow(2, 24);

		// Sample members

		var prototype = Sample24.prototype;

		prototype.build = function()
		{
			return new Sample24(0);
		}

		prototype.setFromBytes = function(valueAsBytes)
		{
			this.value =
			(
				((valueAsBytes[0] & 0xFF))
				| ((valueAsBytes[1] & 0xFF) << 8 )
				| ((valueAsBytes[2] & 0xFF) << 16)
			);

			if (this.value > Sample24.MaxValue) 
			{
				this.value -= Sample24.DoubleMaxValue;
			}

			return this;
		}

		prototype.setFromDouble = function(valueAsDouble)
		{
			this.value = 
			(
				valueAsDouble
				* Sample24.MaxValue
			);

			return this;
		}

		prototype.convertToBytes = function()
		{
			return new Array()
			{
				((this.value) & 0xFF),
				((this.value >>> 8 ) & 0xFF),
				((this.value >>> 16) & 0xFF)
			};
		}		

		prototype.convertToDouble = function()
		{
			return 1.0 * this.value / Sample24.MaxValue;
		}
	}

	function Sample32(value)
	{
		this.value = value;
	}
	{
		Sample32.MaxValue = Math.pow(2, 32);
		Sample32.MaxValueHalf = Math.pow(2, 31);

		// Sample members

		var prototype = Sample32.prototype;

		prototype.build = function()
		{
			return new Sample32(0);
		}

		prototype.setFromBytes = function(valueAsBytes)
		{
			this.value = 
			(
				((valueAsBytes[0] & 0xFF))
				| ((valueAsBytes[1] & 0xFF) << 8 )
				| ((valueAsBytes[2] & 0xFF) << 16)
				| ((valueAsBytes[3] & 0xFF) << 24)
			);

			if (this.value > Sample32.MaxValue) 
			{
				this.value -= Sample32.DoubleMaxValue;
			}

			return this;
		}

		prototype.setFromDouble = function(valueAsDouble)
		{
			this.value = 
			(
				valueAsDouble
				* Sample32.MaxValue
			);

			return this;
		}

		prototype.convertToBytes = function()
		{
			return new Array()
			{
				((this.value) & 0xFF),
				((this.value >>> 8 ) & 0xFF),
				((this.value >>> 16) & 0xFF),
				((this.value >>> 24) & 0xFF)
			};
		}	

		prototype.convertToDouble = function()
		{
			return 1.0 * this.value / Sample32.MaxValue;
		}	
	}

	function SamplingInfo
	(
		 name,	   
		 chunkSizeInBytes,
		 formatCode,
		 numberOfChannels,		
		 samplesPerSecond,
		 bitsPerSample
	)
	{
		this.name = name;
		this.chunkSizeInBytes = chunkSizeInBytes;
		this.formatCode = formatCode;
		this.numberOfChannels = numberOfChannels;
		this.samplesPerSecond = samplesPerSecond;
		this.bitsPerSample = bitsPerSample;
	}
	{
		var prototype = SamplingInfo.prototype;

		SamplingInfo.buildDefault = function()
		{
			return new SamplingInfo
			(
				"Default",
				16, // chunkSizeInBytes
				1, // formatCode
				1, // numberOfChannels
				44100,	 // samplesPerSecond
				16 // bitsPerSample
			);
		}

		prototype.bytesPerSecond = function()
		{	
			return this.samplesPerSecond
				* this.numberOfChannels
				* this.bitsPerSample / WavFile.BitsPerByte;
		}

		prototype.samplePrototype = function()
		{
			var returnValue = null;

			if (this.bitsPerSample == 16)
			{
				returnValue = new Sample16(0);
			}
			else if (this.bitsPerSample == 24)
			{
				returnValue = new Sample24(0);
			}
			else if (this.bitsPerSample == 32)
			{
				returnValue = new Sample32(0);
			}

			return returnValue;
		}

		prototype.toString = function()
		{
			var returnValue =
				"<SamplingInfo "
				+ "chunkSizeInBytes='" + this.chunkSizeInBytes + "' "
				+ "formatCode='" + this.formatCode + "' "
				+ "numberOfChannels='" + this.numberOfChannels + "' "
				+ "samplesPerSecond='" + this.samplesPerSecond + "' "
				+ "bitsPerSample='" + this.bitsPerSample + "' "
				+ "/>";

			return returnValue;
		}		
	}
}