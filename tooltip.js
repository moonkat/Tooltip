// Necessary files: jquery.js, jquery.livequery.js, log function, below
$(document).ready(function(){
	/**
	 * Console Log
	 */
	var debug = false; // set to false to disable logging for production
	var log = function() {
		if (!debug)
			return false;
		try {
			if (window.console && window.console.firebug || typeof firebug === 'object')
	  			console.log.apply(this, arguments);
	  	} catch(err) {
			alert(err.description+'\nmake sure firebug light\nis included in the header before\nautomator.js');
		}
	}
	log('Starting Error Log...');
	/**
	 * ToolTip
	 * 
	 * Displays popup on focus and closes it on blur, or on mouseenter and mouseleave.
	 * @usage (*=optional, d=default, v=other supported values)
	 * tt= text to appear in tooltip
	 * ttclass=* class to assign to created div
	 * ttspeed=* speed of transition, d=1000
	 * ttopacity=* opacity of tooltip, d=100, v=0-100
	 * tttransition=* transition type, d=fade, v=instant
	 * ttoffsetleft=* left offset from target element's right-top border
	 * ttoffsettop=* top offset from target element's right-top border
	 * ttactions=* will set actions on tooltip
	 * ttoverlay=* set to true if the element will be on top of the calling element
	 * (This will ensure that the mouseleave event is triggered on the TT, not the calling element)
	 * 
	 * @example
	 * <.. tt="Put something in here or wild dogs will eat you!" ttclass="toolTip" ttspeed="1000" ttopacity="50" tttransition="fade" ttoffsettop="-10" ttoffsetleft="10">
	 */
	var ttTag 				= "tt";
	var ttSelector 			= "[tt]";
	var ttclassTag 			= "ttclass";
	var ttopacityTag 			= "ttopacity";
	var ttspeedTag 			= "ttspeed";
	var tttransitionTag 		= "tttransition";
	var ttoffsettopTag 			= "ttoffsettop";
	var ttoffsetleftTag 		= "ttoffsetleft";
	var ttoverlayTag 			= "ttoverlay";
	var ttactionsTag 			= "ttactions";
	var hideSelector 			= "[hide='true']";
	$(hideSelector).hide();
	$(ttSelector).livequery(function(){
		var me				= $(this);
		var opacity = (me.attr(ttopacityTag) || "90") / 100;
		var speed = me.attr(ttspeedTag) || 1000;
		var trantype = me.attr(tttransitionTag) || "fade";
		speed = (trantype == "instant") ? 0 : speed;
		// transition types can be defined here
		var transition = {
			'fade':{
				'show':'fadeIn',
				'hide':'fadeOut'
				},
			'instant':{
				'show':'show',
				'hide':'hide'
				}
			};

		// determine which events to bind to
		var showevnt;
		var hideevnt;
		if (this.tagName == 'INPUT' || this.tagName == 'SELECT' ) {
			showevnt = "focus";
			hideevnt = "blur";
		} else {
			showevnt = "mouseenter";
			hideevnt = "mouseleave";
		}
		
		var toffset = $(this).offset(); // get current placement
		var randomid = Math.ceil((10000 + toffset.left + toffset.top) / Math.random());
		//log("random::"+randomid);
		
		var pimage = $(this);
		// show event
		me.bind(showevnt, function() {
			var tt = $(document.createElement("div")); // create element to pop up
			tt.attr('callingId', randomid); // assign attribute to identify calling element

			if ($(this).attr(ttclassTag)) { // if there is a class defined use that
				tt.addClass($(this).attr(ttclassTag));
			} else { // otherwise, create a default look
				log("Create ToolTip style");
				tt.css({
					'background-color':'#ddd',  
					'padding':'5px 10px 5px 10px',
					'font-size':'12px'
				});
			}
			
			// if tt='true' then use the value of the "title" tag instead
			me.attr(ttTag) == 'true' ? tt.html($(this).attr('title')) : tt.html($(this).attr(ttTag)); // assign tool tip text to new element
			// disable browser autocomplete
			tt.attr('autocomplete', 'off');
			
			var offset = me.offset();
			offset.left += me.width() + 16 + ($(this).attr(ttoffsetleftTag) / 1 || 0); // adjust for width of element and apply XHTML provided offset for left
			offset.top += +(me.attr(ttoffsettopTag) || 0); // apply XHTML provided offset for top
			
			tt.css({ // apply location/visibility styles
				'left':offset.left,
				'top':offset.top,
				'position':'absolute',
				'display':'none'
				});
				
			// Apply any actions specified in ttactionsTag	
			if (me.attr(ttactionsTag)) {
				tt.attr(actionTag, $(this).attr(ttactionsTag));				
			}
			
			tt.fadeTo('fast', opacity);
			
			// Insert into the end of the body and make visible
			$("body").append(tt);
			tt[transition[trantype].show](speed);
			
			//if (!$.browser.msie) { DD_roundies.addRule('[callingId]', "16px 4px 4px 16px", true); } Is this line necessary?
		});
		
		// hide event
		// test to see if ttoverlay= has been set to true
		// if so, set the mouseleave event on the overlayed tool tip instead of the calling element since it will be obstructed
		// NOTE: there should be a better way to do this
		// Maybe if we attach the new div as a child of caller, the mouseleave function would work properly
		if (me.attr(ttoverlayTag) == "true" && hideevnt == 'mouseleave') {
			$("[callingId='"+randomid+"']").livequery(hideevnt, function() {
				$("[callingId='"+randomid+"']")[transition[trantype].hide](speed, function () { $(this).remove(); });
			});
		} else {
			me.bind(hideevnt, function() {
				$("[callingId='"+randomid+"']")[transition[trantype].hide](speed, function () { $(this).remove(); });
			});
		}
		
	});
});