angular.module( 'wavVisualizer.about', [
    'ui.router'
])

.config( function( $stateProvider ) {
    $stateProvider.state( 'about', {
        url: '/about',
        views: {
            'main': {
                controller: 'AboutCtrl',
                templateUrl: 'about/about.tpl.html'
            }
        },
        data: { pageTitle: 'About' }
    });
})

.controller( 'AboutCtrl', function( $scope ) {
})

;