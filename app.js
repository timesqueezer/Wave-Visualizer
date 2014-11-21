angular.module( 'wavVisualizer', [
    'wavVisualizer.home',
    'wavVisualizer.about',
    'wavVisualizer.wav_vis',
    'ui.router'
])

.config( function( $stateProvider, $urlRouterProvider ) {
    $urlRouterProvider.otherwise( '/home' );
})

.run( function() {})

.controller( 'AppCtrl', function( $scope, $location ) {
    $scope.$on('$stateChangeSuccess', function( event, toState, toParams, fromState, fromParams) {
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | WaveVisualizer' ;
        }
    });
})

;