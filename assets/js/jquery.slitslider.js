(function( $, undefined ) {
	
	/*
	* smartresize: debounced resize event for jQuery
	*
	* latest version and complete README available on Github:
	* https://github.com/louisremi/jquery.smartresize.js
	*
	* Copyright 2011 @louis_remi
	* Licensed under the MIT license.
	*/
	var $event = $.event, resizeTimeout;

	$event.special.smartresize 	= {
		setup: function() {
			$(this).bind( "resize", $event.special.smartresize.handler );
		},
		teardown: function() {
			$(this).unbind( "resize", $event.special.smartresize.handler );
		},
		handler: function( event, execAsap ) {
			// Save the context
			var context = this,
				args 	= arguments;

			// set correct event type
			event.type = "smartresize";

			if ( resizeTimeout ) { clearTimeout( resizeTimeout ); }
			resizeTimeout = setTimeout(function() {
				jQuery.event.handle.apply( context, args );
			}, execAsap === "execAsap"? 0 : 100 );
		}
	};

	$.fn.smartresize 		= function( fn ) {
		return fn ? this.bind( "smartresize", fn ) : this.trigger( "smartresize", ["execAsap"] );
	};
	
	$.Slitslider 			= function( options, element ) {
	
		this.$slider = $( element );
		this._init( options );
		
	};
	
	$.Slitslider.defaults 	= {
		speed		: 1000,		// transitions speed
		autoplay	: false,	// slideshow on / off
		interval	: 4000,  	// time between transitions
		optOpacity	: false,	// if true the slides's cuts will also animate its opacity
		translateF	: 230,		// amount (%) to translate both cut1 and cut2 - adjust as necessary
		maxAngle	: 25,		// maximum possible angle
		maxScale	: 2			// maximum possible scale
	};
	
	$.Slitslider.prototype 	= {
		_init				: function( options ) {
			
			// the options
			this.options	= $.extend( true, {}, $.Slitslider.defaults, options );
			// the slider
			this.$slides	= this.$slider.children( '.sl-slide' ).hide();
			// total slides
			this.slidesCount= this.$slides.length;
			// current slide
			this.current	= 0;
			// allow to navigate
			this.isAnimating= false;
			// get window size
			this._getWinSize();
			// layout
			this._layout();
			// load some events
			this._loadEvents();
			// slideshow
			if( this.options.autoplay ) {
			
				this._startSlideshow();
			
			}
			
		},
		// gets the current window width & height
		_getWinSize			: function() {
			
			var $win = $( window );
			
			this.windowProp = {
				width	: $win.width(),
				height	: $win.height()
			};
		
		},
		_layout				: function() {
			
			this.$slideWrapper = $( '<div class="sl-slides-wrapper" />' );
			// wrap the slides in sl-slides-wrapper
			this.$slides.wrapAll( this.$slideWrapper ).each( function( i ) {
				
				var $slide			= $( this ),
					// vertical || horizontal
					orientation		= $slide.data( 'orientation' );
					
				$slide.addClass( 'sl-slide-' + orientation )
					  .children()
					  .wrapAll( '<div class="sl-content-wrapper" />' )
					  .wrapAll( '<div class="sl-content" />' );
			
			} );
			
			// set the right size of the slider / slides for the current window size
			this._setSize();
			// show first slide
			this.$slides.eq( this.current ).show();
			// add navigation
			if( this.slidesCount > 1 ) {
				
				this.$slider.append(
					'<nav><span class="sl-prev">Previous</span><span class="sl-next">Next</span></nav>'
				);
				
			}
			
		},
		_setSize			: function() {
		
			// the slider and content wrappers will have the window's width and height
			var css = {
				width	: this.windowProp.width,
				height	: this.windowProp.height
			};
			
			this.$slider.css( css ).find( 'div.sl-content-wrapper' ).css( css );
		
		},
		_loadEvents			: function() {
			
			var _self = this;
			
			if( this.slidesCount > 1 ) {
			
				// navigate "in" or "out"
				this.$slider.find( 'nav > span.sl-prev' ).on( 'click.slitslider', function( event ) {
					
					if( _self.options.autoplay ) {
					
						clearTimeout( _self.slideshow );
						_self.options.autoplay	= false;
					
					}
					_self._navigate( 'out' );
				
				} ).end().find( 'nav > span.sl-next' ).on( 'click.slitslider', function( event ) {
					
					if( _self.options.autoplay ) {
					
						clearTimeout( _self.slideshow );
						_self.options.autoplay	= false;
					
					}
					_self._navigate( 'in' );
				
				} );
			
			}
			
			$( window ).on( 'smartresize.slitslider', function( event ) {
				
				// update window size
				_self._getWinSize();
				_self._setSize();
				
			} );
		
		},
		_navigate			: function( dir ) {
			
			// return if currently navigating / animating
			if( this.isAnimating ) {
			
				return false;
			
			}
			
			var _self = this;
			// while isAnimating is true we can't navigate..
			this.isAnimating = true;
			// the current slide
			var $currentSlide	= this.$slides.eq( this.current ), css;
			// set new current
			( dir === 'in' ) ? 
				( ( this.current < this.slidesCount - 1 ) ? ++this.current : this.current = 0 ) : 
				( ( this.current > 0 ) ? --this.current : this.current = this.slidesCount - 1 );
			
				// next slide to be shown
			var $nextSlide		= this.$slides.eq( this.current ).show(),
				// the slide we want to cut and animate
				$movingSlide	= ( dir === 'in' ) ? $currentSlide : $nextSlide,
				// the following are the data attrs set for each slide
				orientation		= $movingSlide.data( 'orientation' ) || 'horizontal',
				cut1angle		= $movingSlide.data( 'cut1Rotation' ) || 0,
				cut1scale		= $movingSlide.data( 'cut1Scale' ) || 1,
				cut2angle		= $movingSlide.data( 'cut2Rotation' ) || 0,
				cut2scale		= $movingSlide.data( 'cut2Scale' ) || 1;
				
			this._validateValues( cut1angle, cut2angle, cut1scale, cut2scale, orientation );
			
			if( orientation === 'vertical' ) {
			
				css = { marginLeft : -this.windowProp.width / 2 };
			
			}
			else if( orientation === 'horizontal' ) {
			
				css = { marginTop : -this.windowProp.height / 2 };
			
			}
			
			var // default slide's cuts style
				resetStyle 	= ( orientation === 'horizontal' ) ? { x : '0%', y : '0%', rotate : 0, scale : 1, opacity : 1 } : { x : '0%', y : '0%', rotate : 0, scale : 1, opacity : 1 },
				// cut1 style
				cut1Style	= ( orientation === 'horizontal' ) ? { y : '-' + this.options.translateF + '%', rotate : cut1angle, scale : cut1scale } : { x : '-' + this.options.translateF + '%', rotate : cut1angle, scale : cut1scale },
				// cut2 style
				cut2Style	= ( orientation === 'horizontal' ) ? { y : this.options.translateF + '%', rotate : cut2angle, scale : cut2scale } : { x : this.options.translateF + '%', rotate : cut2angle, scale : cut2scale };
			
			if( this.options.optOpacity ) {
			
				cut1Style.opacity = 0;
				cut2Style.opacity = 0;
			
			}
			
			// we are adding the classes sl-trans-elems and sl-trans-back-elems to the slide that is either coming "in"
			// or going "out" according to the direction.
			// the idea is to make it more interesting by giving some animations to the respective slide's elements
			( dir === 'in' ) ? $nextSlide.addClass( 'sl-trans-elems' ) : $currentSlide.addClass( 'sl-trans-back-elems' );
			
			$currentSlide.removeClass( 'sl-trans-elems' );
			
			// add the 2 cuts and animate them ( we are using the jquery.transit plugin : http://ricostacruz.com/jquery.transit/ to add transitions to the elements )
			$movingSlide.css( 'z-index', this.slidesCount )
						.find( 'div.sl-content-wrapper' )
						.wrap( '<div class="sl-content-cut" />' )
						.parent()
						.cond(
							dir === 'out', 
							function() {
							
								this.css( cut1Style )
									.transition( resetStyle, _self.options.speed, dir );
										 
							}, 
							function() {
								
								this.transition( cut1Style, _self.options.speed, dir )
						
							}
						)
						.clone()
						.appendTo( $movingSlide )
						.cond(
							dir === 'out', 
							function() {
								
								var cut = this;
								cut.css( cut2Style )
									.transition( resetStyle, _self.options.speed, dir , function() {
				 
										_self._onEndNavigate( cut, $currentSlide, dir );
								 
									} )
						
							},
							function() {
								
								var cut = this;
								cut.transition( cut2Style, _self.options.speed, dir, function() {
									
									_self._onEndNavigate( cut, $currentSlide, dir );
								 
								} )
								
							}
						)
						.find( 'div.sl-content-wrapper' )
						.css( css );
			
		},
		_validateValues		: function( cut1angle, cut2angle, cut1scale, cut2scale, orientation ) {
			
			// OK, so we are restricting the angles and scale values here.
			// This is to avoid the cuts wrong sides to be shown.
			// you can adjust these values as you wish but make sure you also ajust the
			// paddings of the slides and also the this.options.translateF and scale data attrs
			if( cut1angle > this.options.maxAngle || cut1angle < -this.options.maxAngle ) {
				
				cut1angle = this.options.maxAngle;
			
			}
			if( cut2angle > this.options.maxAngle  || cut2angle < -this.options.maxAngle ) {
				
				cut2angle = this.options.maxAngle;
			
			}
			if( cut1scale > this.options.maxScale || cut1scale <= 0 ) {
			
				cut1scale = this.options.maxScale;
			
			}
			if( cut2scale > this.options.maxScale || cut2scale <= 0 ) {
				
				cut2scale = this.options.maxScale;
			
			}
			if( orientation !== 'vertical' && orientation !== 'horizontal' ) {
			
				orientation = 'horizontal'
			
			}
			
		},
		_onEndNavigate		: function( $slice, $oldSlide, dir ) {
			
			// reset previous slide's style after next slide is shown
			var $slide 			= $slice.parent(),
				removeClasses	= 'sl-trans-elems sl-trans-back-elems';
			
			// remove second slide's cut
			$slice.remove();
			// unwrap..
			$slide.css( 'z-index', 1 )
				  .find( 'div.sl-content-wrapper' )
				  .unwrap();
			
			// hide previous current slide
			$oldSlide.hide().removeClass( removeClasses );
			$slide.removeClass( removeClasses );
			// now we can navigate again..
			this.isAnimating = false;
			
		},
		_startSlideshow		: function() {
		
			var _self	= this;
			
			this.slideshow	= setTimeout( function() {
				
				_self._navigate( 'in' );
				
				if( _self.options.autoplay ) {
				
					_self._startSlideshow();
				
				}
			
			}, this.options.interval );
		
		},
	};
	
	var logError 			= function( message ) {
		if ( this.console ) {
			console.error( message );
		}
	};
	
	$.fn.slitslider			= function( options ) {
		
		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				var instance = $.data( this, 'slitslider' );
				
				if ( !instance ) {
					logError( "cannot call methods on slitslider prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for slitslider instance" );
					return;
				}
				
				instance[ options ].apply( instance, args );
			
			});
		
		} 
		else {
		
			this.each(function() {
			
				var instance = $.data( this, 'slitslider' );
				if ( !instance ) {
					$.data( this, 'slitslider', new $.Slitslider( options, this ) );
				}
			});
		
		}
		
		return this;
		
	};
	
})( jQuery );