function WavFileVisualizer()
{
	this.initialize = function()
	{
		Globals.Instance.initialize(this);

		//var inputFileChooser = document.createElement("input");
		//inputFileChooser.type = "file";
		//inputFileChooser.addEventListener("change", this.loadFileAndVisualize);
		//document.body.appendChild(inputFileChooser);
	};
    
    this.loadFileAndVisualize = function(fileSpecified)
	{
		//var fileSpecified = event.target.files[0];			   
		WavFile.readFromFile(fileSpecified);
	};
    
    this.loadFileAndVisualize_LoadComplete = function(values) {
        var scope = angular.element(document.getElementById("WavContainer")).scope();
        scope.$apply(function() {
            scope.values = values;
        });
        scope.$broadcast('newValues');
    };
    
    
}

/*
	prototype.loadFileAndVisualize_LoadComplete = function(wavFileLoaded)
	{
		var viewport = new Viewport
		(
			"Viewport0",
			new Coords(1280, 720)
		);

		var canvas = document.createElement("canvas");
		canvas.width = viewport.size.x;
		canvas.height = viewport.size.y;
		document.body.appendChild(canvas);

		var graphics = canvas.getContext("2d");
		
		// background
		var grd = graphics.createLinearGradient(0,0,0,viewport.size.y)
		grd.addColorStop(0, "#111111");
		//grd.addColorStop(0.3, "#020711");
		grd.addColorStop(1, "#ffffff");
		graphics.fillStyle = grd;
		graphics.fillRect(0,0,viewport.size.x, viewport.size.y);

		graphics.fillStyle="#123456";

		var samples = wavFileLoaded.samplesForChannels[0];
		var numberOfSamples = samples.length;
		var pixelsPerSample = viewport.size.x / wavFileLoaded.durationInSamples();
		var samplePerPixel = wavFileLoaded.durationInSamples() / viewport.size.x;

		var drawPos = new Coords(0, 0);
		graphics.beginPath();
		graphics.lineWidth="1";
		graphics.strokeStyle="#123456";

		var lastX = 0;
		var lastY = viewport.size.y / 2;

		for (var s = 0; s < viewport.size.x; s++)
		{
			drawPos.x = s;

			drawPos.y = 
				viewport.sizeHalf.y 
				- (samples[( s*samplePerPixel | 0)].convertToDouble() * viewport.sizeHalf.y);

			//graphics.fillRect(drawPos.x, drawPos.y, 1, 1);
			graphics.moveTo(lastX, lastY);
			graphics.lineTo(drawPos.x, drawPos.y);
			//graphics.quadraticCurveTo(drawPos.x, lastY, drawPos.x, drawPos.y);

			lastX = drawPos.x;
			lastY = drawPos.y;
		}

		graphics.stroke();
	}

*/



function Globals()
{
	// do nothing
}
{
	Globals.Instance = new Globals();

	var prototype = Globals.prototype;

	prototype.initialize = function(visualizer)
	{
		this.visualizer = visualizer;   
	}
}



