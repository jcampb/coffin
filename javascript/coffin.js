/*
 * Coffin.js is a modified version of Coffin.js and Casket.js with the drawer on the right and left side, by @jvelo and @fat
 * our activate function requires jquery to work set the z-index correctly for each coffin.
 */
/*
 * Coffin.js V1.0.0
 * Copyright 2012, @fat
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

 var coffin=function(menu_left,menu_right){
    if (!(this instanceof coffin)) {
        return new coffin(menu_left,menu_right);
    }
    // the default menu position is left
    var menu_left = menu_left || true;
    // both can be true
    var menu_right = menu_right || false;

    // start of X scroll pos
    var xStart;

    // start of Y scroll pos
    var yStart;

    // direction of scroll
    var direction;
    // direction of drag
    var dragDirection;

    // movement offset
    var xMovement = 0;

    // end scroll position
    var xEnd = 0;

    // percent ofscroll offset to trigger close/open action
    var fraction = 1/5;

    // is coffin open (can be true for any direction)
    var isOpen = false;
    this.isOpen = function(){
        return isOpen;
     }
     var menuOpen = false;
     this.menuOpen = function(){
         return menuOpen;
     }

    //  element setup
    var page = document.querySelector('.page');
    var menuLeft = document.querySelector('.coffin-left');
    var menuRight = document.querySelector('.coffin-right');

    // is this a touch device
    var isTouch = 'ontouchstart' in document.documentElement;

    // declaritive selectors
    var clickSelector = '[data-coffin=click]';
    var touchSelector = '[data-coffin=touch]';

    // window size cache
    var windowSize = document.body.offsetWidth;

    // if isTouch, map declaritive touch listeners to click events
    if (isTouch) clickSelector += ', ' + touchSelector;

    // function for 3d transforms
    function translate3d (i) {
        page.style.webkitTransform = 'translate3d(' + i + 'px,0,0)';
    }

    // simple helper to force coffin close
     this.toggleCoffin = function(menu) {
        menuOpen = (isOpen) ? menuOpen : menu
        console.log(menuOpen);

        if (windowSize > 767) return;

        if (isOpen) {
          xMovement =  (menuOpen == "right") ? 100: -100
        } else {
          xMovement = (menuOpen == "right") ? -100 : 100
        }
        activate(menuOpen);
        touchEnd();
    }

    // detect the closest element based on a selctor. For simple delegation.
    function closest (element, selector) {
      while (element && !element.webkitMatchesSelector(selector)) {
          element = element.parentNode;
          if (!element.webkitMatchesSelector) return;
      }
      return element;
    }


    function activate(menu){
        
        if (menu == "left"){
            $(menuLeft).addClass("coffin-active")
            $(menuRight).removeClass("coffin-active")
        } else {
            $(menuRight).addClass("coffin-active")
            $(menuLeft).removeClass("coffin-active")
        }

    }

    // handle touch end
    function touchEnd () {

        // if window isn't mobile, or not in a movement, than exit
        if (windowSize > 767 || xMovement == 0) return;

        // remove transition and handler on transitionEnd
        var transitionEnd = function () {
            page.style.webkitTransition = '';
            page.removeEventListener('webkitTransitionEnd', transitionEnd);
        };


        if (menuOpen == "right") {
        // calculate which side to transition to
        xEnd = xMovement <= (isOpen ? (0 - (fraction * 270)) : 270 - fraction * 270) ? -270 : 0;

            // check if transitioned open
            isOpen = xEnd === -270;

        } else if (menuOpen == "left"){
            // calculate which side to transition to
            xEnd = xMovement <= (isOpen ? (270 - (fraction * 270)) : fraction * 270) ? 0 : 270;
            console.log(xEnd)
            // check if transitioned open
            isOpen = xEnd === 270;
        }
         menuOpen = (isOpen) ? menuOpen : false;
        // set transition property for animation
        page.style.webkitTransition = '-webkit-transform .1s linear';

        // tranform element along x axis
        translate3d(xEnd);

        // listen for transition complete
        page.addEventListener('webkitTransitionEnd', transitionEnd);

    }

    // handle resize event
    window.addEventListener('resize', function (e) {

        // if window is resized greater than mobile, then remove any transforms
        if ((windowSize = document.body.offsetWidth) > 767) page.style.webkitTransform = '';

    });


    // handle touch start event
    window.addEventListener('touchstart', function (e) {

        // if window isn't mobile, than exit
        if (windowSize > 767) return;

        // reset direction property
        direction = '';
        dragDirection = '';


        // xMovement is the desired endpoint for the menu
        // reset xMovement to left/right position
        // this will a menu open?
        if (isOpen){
            if (menuOpen == "left"){
                xMovement = isOpen ? 270 : 0;
            } else {
                xMovement = isOpen ? 0 : 270;
            }
        } else {
            //set it to the middle?
            xMovement = 135
        }
 
        // set touch start position for x axis
        xStart = e.touches[0].screenX;

        // set touch start position for y axis
        yStart = e.touches[0].screenY;

    });


    // handle touchmove event
    window.addEventListener('touchmove', function (e) {

        // don't allow scrolling the page up and down when nav open
        if (direction == 'vertical' && isOpen) e.preventDefault();

        // if window isn't mobile, than exit
        if (windowSize > 767 || direction == 'vertical') return;

        // calculate offsets to see if scroll direciton is vertical or horizontal
        var xOffset = Math.abs(e.touches[0].screenX - xStart);
        var yOffset = Math.abs(e.touches[0].screenY - yStart);


        // set direction based on offsets
        if (yOffset > xOffset) return direction = 'vertical';

        // if not vertical, than horizontal :P
        direction = 'horizontal';
        dragDirection = ''
         if (Math.abs(e.touches[0].screenX) > xStart) {
            dragDirection = "right";
         }
         else if (Math.abs(e.touches[0].screenX) < xStart) {
            dragDirection = "left";
         }
         console.log(dragDirection)

        // prevent scrolls if horizontal
        e.preventDefault();

        // calcuate movement based on last scroll pos
        xMovement = e.touches[0].screenX - xStart + xEnd;

        function moveRight(xMovement){
            // if xmovement is within valid range, scroll page
            if (xMovement <= 0 && xMovement >= -270) {
            translate3d(xMovement);
            }
        }

        function moveLeft(xMovement){
            if (xMovement <= 270 && xMovement >= 0) {
            translate3d(xMovement);
            }
        }

        // establish if any menu us open
        if (isOpen){
        // which menu is it
            if (menuOpen == "left") {
                // are we closing or opening it?
                if (dragDirection == "left") {
                    moveLeft(xMovement)
                } 
        
            } else if (menuOpen == "right") {
                // are we closing or opening it?
                if (dragDirection == "right"){
                    moveRight(xMovement);
                }
            }
        // if nothing is open
        // which menu are we trying to open
        } else if (dragDirection == "left") {
            menuOpen = "right";
            activate(menuOpen);
           
            moveLeft(xMovement);
        } else if (dragDirection == "right") {
            menuOpen = "left";
            activate(menuOpen);
            moveRight(xMovement);
        }
        

    });

    // listen for touchend event
    window.addEventListener('touchend', touchEnd);

    // listen to click events on declartive markup
    window.addEventListener('click', function (e) {
        closest(e.target, clickSelector) && toggleCoffin();
    });

    // if not touch exit early comment this out to test on desktop :)
    //if (!isTouch) return;

    // listen to touch start events on declartive markup
    window.addEventListener('touchstart', function (e) {
        closest(e.target, touchSelector) && toggleCoffin();
    });

};

menu = new coffin(true,true);
