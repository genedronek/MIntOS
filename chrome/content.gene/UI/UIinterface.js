/*
 *  UI interface.js - 
 *  upper monitor code and the UI interface solely through this file.
 */

//
//  function to have UI close popup window (if open) clear status bar
//  only the onoff button will remain, showing "ON" state.
//
function clearPredicted() {
	popupClose();
	statusClose();
	setONOFFbutton("on");
}


//
//  function to set UI into the ON/OFF state.
//	the onoff icon (brain) will be RED for "on", GREEN for "off".
//  The onoff button always appears on the status bar.
//
function controlUI(state) 
{
	if ( state == "on" ) {
		interfaceInit("on");
	}
	else if ( state == "off" ) {
		interfaceClose();
	}
}


//
//  function to pass trails to UI
//  for immediate display.
//
function displayPredicted(trails,opts) {}


//
//  function to smokeTest the UI
//		rolls another random trailList
//		into UItrails and displays it.
//

function testUI(opts) {
	
	var nt = 1+random(3), ntrails = nt;
	UItrails = [ ];
	//  random number of trails
	while ( nt-- ) {
		var tl = 1+random(6);
		var trail = [ ];
		//  random trail lengths
		while ( tl-- ) {
			//  random trail items
			var s = "abcdefghijklmnopqrstuvwxyz";
			var item = { tt: random(3), label: s[ntrails-(nt+1)]+(tl+1) }; 
			trail.push( item );
		}
		UItrails.push( trail );
	}
	interfaceInit();
}


/* 
//  signatures for callbacks from UI
//
function  userAct( theItem, event) {}           //  user clicks/submits trailItem
function  userControl( flag ) {}               //  user clicks on/off button

//  TODO:  needs "userControl" call into monitor that
//  will shut monitoring down/start up.


*/







function interfaceInit()
{ 
	statusInit();
	popupInit(popupWin,false);
	setONOFFbutton("on");
}

function interfaceClose()
{
	popupClose();
	statusClose();
}


/*
 *  arrange UI initialization from window.onload
 //  the UI will initialize to "ON" state.
 */
window.addEventListener( "load", interfaceInit, false );

