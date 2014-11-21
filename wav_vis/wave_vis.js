angular.module( 'wavVisualizer.wav_vis', [
    'ui.router'
])

.config( function( $stateProvider ) {
    $stateProvider.state( 'wav_vis', {
        url: '/wav_vis',
        views: {
            'main': {
                controller: 'WaveCtrl',
                templateUrl: 'wav_vis/wave_vis.tpl.html'
            }
        },
        data: { pageTitle: 'Wave Visualizer' }
    });
})

.controller( 'WaveCtrl', function( $scope ) {
    $scope.wavViz = new WavFileVisualizer();
    $scope.wavViz.initialize();
    
    $scope.canvasWidth = 1280;
    $scope.canvasHeight = 800;
    $scope.fcolor = '#52b7ff';
    $scope.bgcolor = '#111111';
    
    $scope.values = "penis";
    
})

.directive( 'fileread', [function() {
    return {
        transclude: true,
        
        link: function( scope, element, attributes ) {
            element.bind("change", function( changeEvent ) {
                
                scope.wavViz.loadFileAndVisualize( changeEvent.target.files[0] );
                
            });
        }
    }
}])

.directive( 'ngWavcanvas', function() {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            'width': '=',
            'height': '=',
            'fcolor': '=',
            'bgcolor': '=',
            'values': '='
        },
        link: function(scope, element, $rootScope) {
            scope.init = function() {
                scope.canvas = document.createElement("canvas");
                
                scope.viewport = new Viewport( "Viewport0", new Coords( scope.width, scope.height ) );

                scope.canvas.width = scope.viewport.size.x;
                scope.canvas.height = scope.viewport.size.y;

                var ctx = scope.canvas.getContext('2d');

                ctx.fillStyle = scope.bgcolor;
                ctx.fillRect(0, 0, scope.viewport.size.x, scope.viewport.size.y);

                ctx.strokeStyle = scope.fcolor;
                
                element[0].appendChild(scope.canvas);
            };
            
            scope.draw = function() {
                var samples = scope.values.samplesForChannels[0];
                var numberOfSamples = samples.length;
                var pixelsPerSample = scope.viewport.size.x / scope.values.durationInSamples();
                var samplePerPixel = scope.values.durationInSamples() / scope.viewport.size.x;

                var drawPos = new Coords(0, 0);
                
                var ctx = scope.canvas.getContext('2d');
                
                ctx.beginPath();
                ctx.lineWidth="1";

                var lastX = 0;
                var lastY = scope.viewport.size.y / 2;

                for (var s = 0; s < scope.viewport.size.x; s++) {
                    drawPos.x = s;

                    drawPos.y = 
                        scope.viewport.sizeHalf.y 
                        - (samples[( s*samplePerPixel | 0)].convertToDouble() * scope.viewport.sizeHalf.y);

                    //graphics.fillRect(drawPos.x, drawPos.y, 1, 1);
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(drawPos.x, drawPos.y);
                    //graphics.quadraticCurveTo(drawPos.x, lastY, drawPos.x, drawPos.y);

                    lastX = drawPos.x;
                    lastY = drawPos.y;
                }

                ctx.stroke();
            };
            
            
            scope.updateCanvas = function() {
                scope.viewport.size.x = scope.width;
                scope.viewport.size.y = scope.height;
                
                scope.canvas.width = scope.viewport.size.x;
                scope.canvas.height = scope.viewport.size.y;
                
                var ctx = scope.canvas.getContext('2d');

                ctx.fillStyle = scope.bgcolor;
                ctx.fillRect(0, 0, scope.viewport.size.x, scope.viewport.size.y);

                ctx.strokeStyle = scope.fcolor;
            };
            
            scope.$watch('width + height + fcolor + bgcolor', function() {
                scope.updateCanvas();
                scope.draw();
            });
            
            scope.$on('newValues', function() {
                scope.draw();
            });
            
            scope.init();
        }

    };
})

;