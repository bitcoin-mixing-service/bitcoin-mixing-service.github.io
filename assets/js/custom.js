jQuery.noConflict()(function($){
var $map = $('#map-contact');
		google.maps.event.addDomListener(window, 'resize', function() {
			map.setCenter(homeLatlng);
		});
		if( $map.length ) {

			$map.gMap({
				address: '9930 124th Avenue Northeast Kirkland, Washington',
				zoom: 14,
				markers: [
					{ 'address' : '9930 124th Avenue Northeast  Kirkland, Washington',}
				]
			});

		}
});


jQuery.noConflict()(function($){
	$(document).ready(function() {  
		$("a[rel^='prettyPhoto']").prettyPhoto({opacity:0.80,default_width:200,default_height:344,theme:'facebook',hideflash:false,modal:false});
	});
});

jQuery.noConflict()(function($){
	$(window).load(function() {
        $('#slider').nivoSlider();
    });
})

jQuery.noConflict()(function($){
	jQuery(document).ready(function () {
		JQTWEET.loadTweets();
	});
})



jQuery.noConflict()(function($){
	$(".testimonialrotator").testimonialrotator({
		settings_slideshowTime:2
	});
});

jQuery.noConflict()(function($){
	$('#slides').slides({
		preload: true,
        preloadImage: 'assets/img/spinner-trans.gif',
		next: 'next',
		prev: 'prev',
		generatePagination: false
		
	});
});

// PORTFOLIO FILTERING - ISOTOPE
//**********************************
jQuery.noConflict()(function($){
var $container = $('#portfolio');
		
if($container.length) {
	$container.waitForImages(function() {
		
		// initialize isotope

     $container.isotope({
      itemSelector : '.block',
      masonry : {
        //columnWidth : 120
        columnWidth : 1,
		gutterWidth: 1,
      },
      masonryHorizontal : {
        rowHeight: 120
      },
      cellsByRow : {
        columnWidth : 240,
        rowHeight : 240
      },
      cellsByColumn : {
        columnWidth : 240,
        rowHeight : 240
      }});
		// filter items when filter link is clicked
		$('#filters button').click(function(){
		  var selector = $(this).attr('data-filter');
		  $container.isotope({ filter: selector });
		  $(this).removeClass('btn-inverse').addClass('btn-info').siblings().removeClass('btn-info').addClass('btn-inverse');
		  return false;
		});
		
	},null,true);
}});



