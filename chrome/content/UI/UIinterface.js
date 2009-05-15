/*
 *  UI interface.js - code for interfacing sample to UI
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
//	the onoff icon (sample) will be RED for "on", GREEN for "off".
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
function displayPredicted(trails, opts) {
	try {
		curUIState = new UIstate (trails);
		curUIState.statusDisplay ();
 	} catch (ex) {
 		showStatus ("[UIinterface.displayPredicted] " + ex.message);
 	}
}

function removePredicted () {
	try {
		if (curUIState == null) return;
		statusRemoveItems (curUIState.statusScrollList);
 	} catch (ex) {
 		showStatus ("[UIinterface.displayPredicted] " + ex.message);
 	}
}


//
//  function to smokeTest the UI
//		generate and display  another random trailList
//
function testUI(opts) {}


/* 
//  signatures for callbacks from UI
//
function  userAct( theItem, event) {}           //  user clicks/submits trailItem
function  userControl( onoff ) {}               //  user clicks on/off button
 */

function interfaceInit()
{ 
  statusInit();
  popupInit(popupWin);
  setONOFFbutton("on");
}

function interfaceClose()
{
  popupClose();
  statusClose();
  setONOFFbutton("off");
}


/*
 *  arrange UI initialization from window.onload
 //  the UI will initialize to "ON" state.
 */
window.addEventListener( "load", interfaceInit, false );

